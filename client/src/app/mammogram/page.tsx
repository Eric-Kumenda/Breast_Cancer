"use client";

import React, { useEffect } from "react";
import UploadZone from "@/components/UploadZone";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { checkSession } from "@/lib/features/authSlice";
import { fetchHistory } from "@/lib/features/historySlice";
import { DashboardLoader } from "@/components/DashboardLoader";
import { useRouter } from "next/navigation";
import { uploadScan, clearScan } from "@/lib/features/scanSlice";
import ResultCard from "@/components/ResultCard";

export default function MammogramPage() {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const { user, loading: authLoading } = useAppSelector(
		(state) => state.auth
	);
	const {
		scanning,
		result,
		error: scanError,
	} = useAppSelector((state) => state.scan);

	useEffect(() => {
		dispatch(checkSession());
	}, [dispatch]);

	useEffect(() => {
		if (!authLoading && !user) {
			router.push("/login");
		}
		// No need to fetch history here unless we display side stats, but usually good to have session checked
	}, [user, authLoading, dispatch, router]);

	// Clear scan on mount/unmount to reset state
	useEffect(() => {
		dispatch(clearScan());
		return () => {
			dispatch(clearScan());
		};
	}, [dispatch]);

	const handleFileSelect = async (file: File) => {
		await dispatch(uploadScan(file));
		// We could fetch history if we wanted to update a global counter, but separated pages might not need it immediately
		if (user) dispatch(fetchHistory());
	};

	const resetScan = () => {
		dispatch(clearScan());
	};

	if (authLoading) return <DashboardLoader />;
	if (!user) return null;

	return (
		<div className="max-w-4xl mx-auto space-y-8 pb-20 md:ml-72 pt-10">
			<header className="mb-8">
				<motion.h1
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-400 bg-clip-text text-transparent mb-2">
					Mammogram Analysis
				</motion.h1>
				<p className="text-slate-500 dark:text-slate-400">
					Upload a mammogram scan for AI-powered detection.
				</p>
			</header>

			{result ? (
				<div className="space-y-6">
					<ResultCard
						prediction={result.prediction}
						confidence={result.confidence}
						imageUrl={result.image_url}
					/>
					<div className="flex justify-center">
						<button
							onClick={resetScan}
							className="text-slate-500 hover:text-pink-600 p-4 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm text-sm">
							Scan Another Image
						</button>
					</div>
				</div>
			) : (
				<div className="space-y-4">
					{scanError && (
						<div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 text-center">
							{scanError}
						</div>
					)}
					<UploadZone
						onFileSelect={handleFileSelect}
						isScanning={scanning}
					/>
				</div>
			)}
		</div>
	);
}
