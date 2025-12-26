"use client";

import React, { useEffect, useState } from "react";
import UploadZone from "@/components/UploadZone";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { checkSession } from "@/lib/features/authSlice";
import { fetchHistory } from "@/lib/features/historySlice";
import DashboardStats from "@/components/DashboardStats";
import { DashboardLoader } from "@/components/DashboardLoader";
import { useRouter } from "next/navigation";
import { uploadScan, clearScan } from "@/lib/features/scanSlice";
import ResultCard from "@/components/ResultCard";

export default function Home() {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const { user, loading: authLoading } = useAppSelector(
		(state) => state.auth
	);
	const { scans, loading: historyLoading } = useAppSelector(
		(state) => state.history
	);
	const {
		scanning,
		result,
		error: scanError,
	} = useAppSelector((state) => state.scan);
	const [activeTab, setActiveTab] = useState<"upload" | "overview">(
		"overview"
	);

	useEffect(() => {
		dispatch(checkSession());
	}, [dispatch]);

	useEffect(() => {
		if (!authLoading && !user) {
			router.push("/login");
		} else if (user) {
			dispatch(fetchHistory());
		}
	}, [user, authLoading, dispatch, router]);

	const handleFileSelect = async (file: File) => {
		await dispatch(uploadScan(file));
		if (user) dispatch(fetchHistory()); // Refresh history after scan
	};

	const resetScan = () => {
		dispatch(clearScan());
	};

	if (authLoading || (user && historyLoading && scans.length === 0))
		return <DashboardLoader />;
	if (!user) return null;

	return (
		<div className="max-w-6xl mx-auto space-y-8 pb-20 md:ml-72">
			<header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
				<div>
					<motion.h1
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-400 bg-clip-text text-transparent mb-2">
						Dashboard
					</motion.h1>
					<p className="text-slate-500 dark:text-slate-400">
						Welcome back, {user.email}
					</p>
				</div>
				<div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
					<button
						onClick={() => setActiveTab("overview")}
						className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
							activeTab === "overview"
								? "bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 shadow-sm"
								: "text-slate-500 hover:text-slate-700 dark:text-slate-400"
						}`}>
						Overview
					</button>
					<button
						onClick={() => setActiveTab("upload")}
						className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
							activeTab === "upload"
								? "bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 shadow-sm"
								: "text-slate-500 hover:text-slate-700 dark:text-slate-400"
						}`}>
						New Scan
					</button>
				</div>
			</header>

			{activeTab === "overview" ? (
				<DashboardStats scans={scans} />
			) : (
				<div className="max-w-4xl mx-auto">
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
			)}
		</div>
	);
}
