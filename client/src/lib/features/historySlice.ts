import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../supabaseClient";

export interface ScanRecord {
	id: string;
	created_at: string;
	prediction_label: string;
	confidence_score: number;
	original_image_url: string;
	annotated_image_url?: string;
	scan_type?: string;
}

interface HistoryState {
	scans: ScanRecord[];
	loading: boolean;
	error: string | null;
}

const initialState: HistoryState = {
	scans: [],
	loading: false,
	error: null,
};

export const fetchHistory = createAsyncThunk(
	"history/fetchHistory",
	async (_, { rejectWithValue }) => {
		try {
			const { data, error } = await supabase
				.from("scans")
				.select("*")
				.order("created_at", { ascending: false });

			if (error) throw error;
			return data as ScanRecord[];
		} catch (err: any) {
			return rejectWithValue(err.message);
		}
	}
);

export const deleteScan = createAsyncThunk(
	"history/deleteScan",
	async (scanId: string, { getState, rejectWithValue }) => {
		try {
			const state = getState() as any;
			const session = state.auth.session;
			if (!session) throw new Error("No session");

			const apiUrl =
				process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
			const response = await fetch(`${apiUrl}/scans/${scanId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${session.access_token}`,
				},
			});

			if (!response.ok) {
				const err = await response.json();
				throw new Error(err.error || "Failed to delete");
			}

			return scanId;
		} catch (err: any) {
			return rejectWithValue(err.message);
		}
	}
);

const historySlice = createSlice({
	name: "history",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchHistory.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchHistory.fulfilled, (state, action) => {
				state.loading = false;
				state.scans = action.payload;
			})
			.addCase(fetchHistory.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(deleteScan.fulfilled, (state, action) => {
				state.scans = state.scans.filter(
					(scan) => scan.id !== action.payload
				);
			});
	},
});

export default historySlice.reducer;
