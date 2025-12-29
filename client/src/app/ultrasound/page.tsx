"use client";

import React, { useEffect } from "react";
import UploadZone from "@/components/UploadZone";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { checkSession } from "@/lib/features/authSlice";
import { fetchHistory } from "@/lib/features/historySlice";
import { DashboardLoader } from "@/components/DashboardLoader";
import { useRouter } from "next/navigation";
import { uploadUltrasoundScan, clearScan } from "@/lib/features/scanSlice";
import ResultCard from "@/components/ResultCard";

export default function UltrasoundPage() {
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
	}, [user, authLoading, dispatch, router]);

	// Clear scan on mount/unmount
	useEffect(() => {
		dispatch(clearScan());
		return () => {
			dispatch(clearScan());
		};
	}, [dispatch]);

	const handleFileSelect = async (file: File) => {
		await dispatch(uploadUltrasoundScan(file));
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
					className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent mb-2">
					Ultrasound Analysis
				</motion.h1>
				<p className="text-slate-500 dark:text-slate-400">
					Upload an ultrasound scan for tumor segmentation and
					diagnosis.
				</p>
			</header>

			{result ? (
				<div className="space-y-6">
					{/* For ultrasound, we might want to show the mask if available, or just the result card as is */}
					<ResultCard
						prediction={result.prediction}
						confidence={result.confidence}
						imageUrl={result.mask_image || result.image_url}
					/>
					{result.mask_image && (
						<div className="text-center text-sm text-slate-500 mt-2">
							A segmentation mask has been generated highlighting
							potential abnormalities.
						</div>
					)}

					<div className="flex justify-center">
						<button
							onClick={resetScan}
							className="text-slate-500 hover:text-blue-600 p-4 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm text-sm">
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
