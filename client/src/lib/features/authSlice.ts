import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "../supabaseClient";
import { Session, User } from "@supabase/supabase-js";

interface AuthState {
	user: User | null;
	session: Session | null;
	loading: boolean;
	error: string | null;
}

const initialState: AuthState = {
	user: null,
	session: null,
	loading: true,
	error: null,
};

export const checkSession = createAsyncThunk("auth/checkSession", async () => {
	const {
		data: { session },
		error,
	} = await supabase.auth.getSession();
	if (error) throw error;
	return session;
});

export const signOut = createAsyncThunk("auth/signOut", async () => {
	const { error } = await supabase.auth.signOut();
	if (error) throw error;
});

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setSession(state, action: PayloadAction<Session | null>) {
			state.session = action.payload;
			state.user = action.payload?.user ?? null;
			state.loading = false;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(checkSession.pending, (state) => {
				state.loading = true;
			})
			.addCase(checkSession.fulfilled, (state, action) => {
				state.session = action.payload;
				state.user = action.payload?.user ?? null;
				state.loading = false;
			})
			.addCase(checkSession.rejected, (state, action) => {
				state.error = action.error.message || "Failed to check session";
				state.loading = false;
			})
			.addCase(signOut.fulfilled, (state) => {
				state.session = null;
				state.user = null;
			});
	},
});

export const { setSession } = authSlice.actions;
export default authSlice.reducer;
