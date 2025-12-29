import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../supabaseClient";

interface ScanResult {
	prediction: "Benign" | "Malignant";
	confidence: number;
	raw_output: number[][];
	image_url?: string;
	original_url?: string;
	annotated_url?: string;
	mask_image?: string;
	scan_type?: "mammogram" | "ultrasound";
}

interface ScanState {
	scanning: boolean;
	result: ScanResult | null;
	error: string | null;
}

const initialState: ScanState = {
	scanning: false,
	result: null,
	error: null,
};

export const uploadScan = createAsyncThunk(
	"scan/uploadScan",
	async (file: File, { getState, rejectWithValue }) => {
		try {
			// Cast to any to avoid circular dependency import issues of RootState
			const state = getState() as any;
			const session = state.auth.session;

			if (!session) {
				throw new Error("User not authenticated");
			}

			const formData = new FormData();
			formData.append("file", file);

			const apiUrl =
				process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
			const response = await fetch(`${apiUrl}/predict`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${session.access_token}`,
				},
				body: formData,
			});

			if (!response.ok) {
				const err = await response.json();
				throw new Error(err.error || "Failed to analyze scan");
			}

			const data: ScanResult = await response.json();
			return data;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const uploadUltrasoundScan = createAsyncThunk(
	"scan/uploadUltrasoundScan",
	async (file: File, { getState, rejectWithValue }) => {
		try {
			const state = getState() as any;
			const session = state.auth.session;

			if (!session) {
				throw new Error("User not authenticated");
			}

			const formData = new FormData();
			formData.append("file", file);

			const apiUrl =
				process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
			const response = await fetch(`${apiUrl}/ultrasound`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${session.access_token}`,
				},
				body: formData,
			});

			if (!response.ok) {
				const err = await response.json();
				throw new Error(err.error || "Failed to analyze ultrasound");
			}

			const data: ScanResult = await response.json();
			return data;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

const scanSlice = createSlice({
	name: "scan",
	initialState,
	reducers: {
		clearScan(state) {
			state.result = null;
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(uploadScan.pending, (state) => {
				state.scanning = true;
				state.error = null;
				state.result = null;
			})
			.addCase(uploadScan.fulfilled, (state, action) => {
				state.scanning = false;
				state.result = action.payload;
			})
			.addCase(uploadScan.rejected, (state, action) => {
				state.scanning = false;
				state.error = action.payload as string;
			})
			.addCase(uploadUltrasoundScan.pending, (state) => {
				state.scanning = true;
				state.error = null;
				state.result = null;
			})
			.addCase(uploadUltrasoundScan.fulfilled, (state, action) => {
				state.scanning = false;
				state.result = action.payload;
			})
			.addCase(uploadUltrasoundScan.rejected, (state, action) => {
				state.scanning = false;
				state.error = action.payload as string;
			});
	},
});

export const { clearScan } = scanSlice.actions;
export default scanSlice.reducer;
