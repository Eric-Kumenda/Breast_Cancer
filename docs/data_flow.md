# Data Flow Documentation

## Overview

This document describes how data moves through the EarlyVision system for each major user flow: authentication, scan upload & prediction, history retrieval, and scan detail viewing.

---

## 1. Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend as Next.js Client
    participant Supabase as Supabase Auth

    User->>Frontend: Enter email & password
    Frontend->>Supabase: signUp() / signInWithPassword()
    Supabase-->>Frontend: Session { access_token, user }
    Frontend->>Frontend: Redux authSlice.setSession(session)
    Note over Frontend: JWT stored in Redux state
    Frontend-->>User: Redirect to Dashboard
```

**Token Lifecycle:**

- JWT access tokens issued by Supabase on login
- Tokens passed to Flask API via `Authorization: Bearer <token>` header
- Flask validates tokens by calling `supabase.auth.get_user(token)`
- Frontend checks session on page load via `checkSession()` thunk

---

## 2. Mammogram Upload & Prediction

```mermaid
sequenceDiagram
    participant User
    participant Frontend as Next.js Client
    participant Redux as Redux Store
    participant Backend as Flask API
    participant Supabase as Supabase

    User->>Frontend: Select mammogram image
    Frontend->>Redux: dispatch(uploadScan(file))
    Redux->>Backend: POST /predict (FormData + JWT)
    Backend->>Backend: Validate JWT via Supabase
    Backend->>Backend: preprocess_image(bytes)
    Note over Backend: Grayscale → 224×224 → Normalize
    Backend->>Backend: model.predict() → softmax
    Backend->>Supabase: Upload image to Storage
    Supabase-->>Backend: Public URL
    Backend->>Supabase: INSERT into scans table
    Backend-->>Redux: { prediction, confidence, image_url }
    Redux-->>Frontend: Update scanSlice.result
    Frontend-->>User: Display ResultCard
```

**Data Transformations:**

1. `File` → `FormData` → HTTP multipart upload
2. Raw bytes → Grayscale PIL → 224×224 → float32 → normalized `[-1, 1]`
3. Model logits → softmax → `{label, confidence}`
4. Original bytes → Supabase Storage → public URL
5. Metadata → Supabase DB `scans` table

---

## 3. Ultrasound Upload & Segmentation

```mermaid
sequenceDiagram
    participant User
    participant Frontend as Next.js Client
    participant Redux as Redux Store
    participant Backend as Flask API
    participant Supabase as Supabase

    User->>Frontend: Select ultrasound image
    Frontend->>Redux: dispatch(uploadUltrasoundScan(file))
    Redux->>Backend: POST /ultrasound (FormData + JWT)
    Backend->>Backend: Validate JWT
    Backend->>Backend: preprocess_ultrasound(bytes)
    Note over Backend: RGB → 128×128 → Normalize [0,1]
    Backend->>Backend: model.predict() → mask
    Backend->>Backend: Threshold (>0.5) → binary mask
    Backend->>Backend: Encode mask → Base64 PNG
    Backend->>Supabase: Upload original to Storage
    Backend->>Supabase: INSERT into scans table
    Backend-->>Redux: { prediction, mask_image, confidence }
    Redux-->>Frontend: Update scanSlice.result
    Frontend-->>User: Display ResultCard + Mask
```

**Key Differences from Mammogram Flow:**

- Input is RGB (3 channels), not grayscale
- Output is a segmentation mask, not a class label
- Mask is encoded as Base64 PNG and sent inline (not stored in Supabase)
- Diagnosis derived from mask: `sum(mask) > 0` → tumor detected

---

## 4. History & Scan Details

```mermaid
sequenceDiagram
    participant User
    participant Frontend as Next.js Client
    participant Supabase as Supabase DB
    participant Backend as Flask API

    User->>Frontend: Navigate to /history
    Frontend->>Supabase: SELECT * FROM scans (via SDK)
    Note over Supabase: RLS ensures user sees own scans only
    Supabase-->>Frontend: ScanRecord[]
    Frontend-->>User: Display scan cards

    User->>Frontend: Click scan card
    Frontend->>Frontend: router.push(/scan/{id})
    Frontend->>Supabase: SELECT * FROM scans WHERE id={id}
    Supabase-->>Frontend: Single ScanRecord

    alt scan_type == "ultrasound"
        Frontend->>Backend: POST /ultrasound/reevaluate { image_url }
        Backend->>Backend: Download image from URL
        Backend->>Backend: Re-run U-Net inference
        Note over Backend: No database write (ephemeral)
        Backend-->>Frontend: { mask_image (Base64), prediction }
        Frontend-->>User: Display with ScanOverlay + opacity sliders
    else scan_type == "mammogram"
        Frontend-->>User: Display image + metadata only
    end
```

**Re-evaluation Key Points:**

- The `/ultrasound/reevaluate` endpoint is **stateless** — it does not persist results
- This enables on-demand overlay generation from stored image URLs
- Opacity sliders (`imageOpacity`, `maskOpacity`) allow interactive visualization

---

## 5. Scan Deletion

```mermaid
sequenceDiagram
    participant User
    participant Frontend as Next.js Client
    participant Backend as Flask API
    participant Supabase as Supabase

    User->>Frontend: Click delete on scan
    Frontend->>Backend: DELETE /scans/{id} (JWT)
    Backend->>Backend: Validate JWT
    Backend->>Supabase: SELECT scan (verify ownership)
    Backend->>Supabase: DELETE from Storage (image file)
    Backend->>Supabase: DELETE from scans table
    Backend-->>Frontend: { message: "deleted" }
    Frontend->>Frontend: Remove from Redux historySlice
    Frontend-->>User: Card removed from UI
```

---

## Data Storage Summary

| Data                | Location                              | Retention      |
| ------------------- | ------------------------------------- | -------------- |
| User credentials    | Supabase Auth                         | Permanent      |
| JWT tokens          | Redux state (memory)                  | Session-scoped |
| Scan metadata       | Supabase PostgreSQL `scans` table     | Until deleted  |
| Original images     | Supabase Storage `mammo-scans` bucket | Until deleted  |
| Segmentation masks  | Sent as Base64 in API response        | Not persisted  |
| Re-evaluation masks | Computed on-demand                    | Not persisted  |

## Environment Variables

| Variable                        | Location            | Purpose                           |
| ------------------------------- | ------------------- | --------------------------------- |
| `SUPABASE_URL`                  | `backend/.env`      | Backend Supabase connection       |
| `SUPABASE_KEY`                  | `backend/.env`      | Backend Supabase anon key         |
| `PORT`                          | `backend/.env`      | Flask server port (default: 5000) |
| `NEXT_PUBLIC_SUPABASE_URL`      | `client/.env.local` | Frontend Supabase connection      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `client/.env.local` | Frontend Supabase anon key        |
| `NEXT_PUBLIC_API_URL`           | `client/.env.local` | Flask backend URL                 |
