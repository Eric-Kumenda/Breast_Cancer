import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import scanReducer from "./features/scanSlice";
import historyReducer from "./features/historySlice";

export const makeStore = () => {
	return configureStore({
		reducer: {
			auth: authReducer,
			scan: scanReducer,
			history: historyReducer,
		},
	});
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
