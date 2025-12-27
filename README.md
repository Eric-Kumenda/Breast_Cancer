# MammoDetect: AI-Powered Breast Cancer Detection

MammoDetect is a state-of-the-art web application designed to assist in the early detection of breast cancer using Mammogram analysis. It leverages a custom **Vision Transformer (ViT)** model for high-accuracy classification and features a modern, empathetic user interface built with Next.js.

## 🌟 Key Features

-   **Advanced AI Model**: Custom Vision Transformer (ViT) trained on mammogram datasets for precise Malignant vs. Benign classification.
-   **Modern UI/UX**: "Medical Pink" aesthetic with glassmorphism, fluid animations (Framer Motion), and responsive design.
-   **Secure Data Handling**: Integrated with **Supabase** for secure authentication, database management, and encrypted storage of medical images.
-   **Analytics Dashboard**: Real-time statistics and visualization of diagnosis confidence.
-   **History Archive**: Comprehensive log of past screenings with search and filter capabilities.
-   **Theme Support**: Fully accessible Light and Dark modes.

## 🏗️ System Architecture

-   **Frontend**: Next.js 16 (React), Redux Toolkit, Tailwind CSS, Framer Motion.
-   **Backend**: Flask (Python), TensorFlow/Keras (ViT Model).
-   **Database & Storage**: Supabase (PostgreSQL, S3-compatible Storage).
-   **Deployment**: Netlify (Frontend), Render (Backend - Recommended).

---

## 🚀 Getting Started

Follow these instructions to set up the project on your local machine.

### Prerequisites

-   **Git**: [Download Git](https://git-scm.com/downloads)
-   **Node.js** (v18+): [Download Node.js](https://nodejs.org/)
-   **Python** (3.9+): [Download Python](https://www.python.org/downloads/)

### 1. Get the Source Code

#### Option A: Clone with Git

```bash
git clone https://github.com/Eric-Kumenda/Breast_Cancer.git
# Note: The folder will be named Breast_Cancer
cd Breast_Cancer
```

#### Option B: Download ZIP (No Git required)

1.  Go to the repository page: [https://github.com/Eric-Kumenda/Breast_Cancer](https://github.com/Eric-Kumenda/Breast_Cancer)
2.  Click on the green **<> Code** button.
3.  Select **Download ZIP**.
4.  Extract the ZIP file to your desired folder.
5.  Open the terminal/command prompt and navigate into the extracted folder (e.g., `cd Breast_Cancer-main`).

### 2. Backend Setup (Flask API)

The backend hosts the ViT model and exposes endpoints for prediction and data management.

#### Windows

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

#### macOS / Linux

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

#### Download the AI Model

**Important:** The ViT model is too large for GitHub and must be downloaded separately.

1.  **Download the model** from this Google Drive link:
    -   [Download vit_mammogram_model.keras](https://drive.google.com/file/d/13u77kKDAMRq-4Z3GFBp5Mz0CFv5PO9Hs/view?usp=drive_link)
2.  **Move the file** to the `backend/models/` directory.
    -   Ensure the filename is exactly `vit_mammogram_model.keras`.
    -   Path should look like: `.../mammodetect/backend/models/vit_mammogram_model.keras`

#### Configure Environment Variables

Create a file named `.env` in the `backend/` directory:

```bash
# backend/.env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
PORT=5000
```

#### Run the Backend server

```bash
# Ensure virtual env is active
python app.py
```

Server will start at `http://localhost:5000`.

### 3. Frontend Setup (Next.js)

The frontend provides the user interface.

```bash
cd client
npm install
```

#### Configure Environment Variables

Create a file named `.env.local` in the `client/` directory:

```bash
# client/.env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:5000
```

_Note: `NEXT_PUBLIC_API_URL` should point to your local Flask server._

#### Run the Frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 🧠 Model Pipeline

MammoDetect uses a **Vision Transformer (ViT)** instead of traditional CNNs.

1.  **Input**: Mammogram image (JPEG/PNG).
2.  **Preprocessing**:
    -   Convert to Grayscale.
    -   Resize to 224x224 pixels.
    -   Normalization: `(pixel - 0.5) / 0.5` (Scaling to [-1, 1]).
3.  **Patching**: Image is split into 16x16 patches.
4.  **Encoding**: Patches are linearly projected and combined with positional embeddings.
5.  **Transformer Encoder**: processed through 8 layers of Multi-Head Self-Attention (4 heads) and MLPs.
6.  **Classification Head**: MLP + Softmax to output probabilities for **Benign** and **Malignant**.

## 📂 Project Structure

```
mammodetect/
├── backend/                # Flask API & Model
│   ├── models/            # Model files & Architecture
│   │   └── vit_mammogram.py
│   ├── .venv/             # Virtual Environment (excluded)
│   ├── app.py             # Main Application Entry
│   └── requirements.txt   # Python Dependencies
├── client/                 # Next.js Frontend
│   ├── src/
│   │   ├── app/           # App Router Pages
│   │   ├── components/    # Reusable UI Components
│   │   └── lib/           # Redux Slices & Utilities
│   ├── public/            # Static Assets
│   └── package.json       # Node Dependencies
└── docs/                   # Documentation & Diagrams
```

## 🤝 Contributing

Contributions are welcome! Please fork the repository and create a pull request.

## 📄 License

Distributed under the MIT License.
