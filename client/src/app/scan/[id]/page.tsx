"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import { ScanOverlay } from "@/components/ScanOverlay";
import { DashboardLoader } from "@/components/DashboardLoader";
import {
	ArrowLeft,
	Calendar,
	FileText,
	Activity,
	AlertTriangle,
	CheckCircle,
	BrainCircuit,
} from "lucide-react";
import { ScanRecord } from "@/lib/features/historySlice";

export default function ScanPage() {
	const params = useParams();
	const router = useRouter();
	const id = params?.id as string;

	const [scan, setScan] = useState<ScanRecord | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Ultrasound specific
	const [maskImage, setMaskImage] = useState<string | null>(null);
	const [revalLoading, setRevalLoading] = useState(false);
	const [revalData, setRevalData] = useState<any>(null);
	const [imageOpacity, setImageOpacity] = useState(1);
	const [maskOpacity, setMaskOpacity] = useState(0.6);

	useEffect(() => {
		if (id) {
			fetchScan();
		}
	}, [id]);

	const fetchScan = async () => {
		try {
			setLoading(true);
			const { data, error } = await supabase
				.from("scans")
				.select("*")
				.eq("id", id)
				.single();

			if (error) throw error;
			if (!data) throw new Error("Scan not found");

			setScan(data as ScanRecord);

			// If ultrasound, trigger re-evaluation automatically
			if (data.scan_type === "ultrasound" && data.original_image_url) {
				reevaluateUltrasound(data.original_image_url);
			}
		} catch (err: any) {
			console.error("Error fetching scan:", err);
			setError(err.message || "Failed to load scan");
		} finally {
			setLoading(false);
		}
	};

	const reevaluateUltrasound = async (imageUrl: string) => {
		try {
			setRevalLoading(true);
			const apiUrl =
				process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

			const response = await fetch(`${apiUrl}/ultrasound/reevaluate`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ image_url: imageUrl }),
			});

			if (!response.ok) {
				throw new Error("Re-evaluation request failed");
			}

			const data = await response.json();

			if (data && data.mask_image) {
				setMaskImage(data.mask_image);
				setRevalData(data);
			}
		} catch (err) {
			console.error("Re-evaluation failed:", err);
			// Don't block the page load, just log it or maybe show a toast
		} finally {
			setRevalLoading(false);
		}
	};

	if (loading) return <DashboardLoader />;

	if (error || !scan) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
				<div className="text-rose-500 text-lg font-medium">
					Error: {error || "Scan not found"}
				</div>
				<button
					onClick={() => router.back()}
					className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200">
					Go Back
				</button>
			</div>
		);
	}

	const isUltrasound = scan.scan_type === "ultrasound";

	return (
		<div className="md:ml-72 min-h-screen bg-slate-50/50 dark:bg-slate-900/50">
			<div className="max-w-5xl mx-auto py-10 px-6 space-y-8">
				{/* Header */}
				<header className="flex items-center gap-4">
					<button
						onClick={() => router.back()}
						className="p-2 -ml-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
						<ArrowLeft className="w-5 h-5" />
					</button>
					<div>
						<h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
							Scan Details
							<span className="text-sm font-medium px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-mono">
								#{scan.id.slice(0, 8)}
							</span>
						</h1>
						<p className="text-slate-500 dark:text-slate-400 text-sm">
							Created on{" "}
							{new Date(scan.created_at).toLocaleString()}
						</p>
					</div>
				</header>

				<div className="grid lg:grid-cols-3 gap-8">
					{/* Left Column: Image & Overlay */}
					<div className="lg:col-span-2 space-y-6">
						<div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
							<h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
								<FileText className="w-5 h-5 text-pink-500" />
								Visual Analysis
							</h2>

							<div className="relative aspect-square md:aspect-video w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
								{scan.original_image_url ? (
									<ScanOverlay
										imageUrl={scan.original_image_url}
										maskImage={maskImage || undefined}
										className="w-full h-full"
										imageOpacity={imageOpacity}
										maskOpacity={maskOpacity}
									/>
								) : (
									<div className="text-slate-400">
										No Image Available
									</div>
								)}

								{/* Loading State Overlay for Re-evaluation */}
								{isUltrasound && revalLoading && (
									<div className="absolute inset-0 z-30 bg-black/20 backdrop-blur-sm flex items-center justify-center">
										<div className="bg-white dark:bg-slate-800 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3">
											<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-500"></div>
											<span className="font-medium text-slate-700 dark:text-slate-200">
												Processing Overlay...
											</span>
										</div>
									</div>
								)}
							</div>

							{isUltrasound && (
								<div className="mt-4 space-y-4">
									<div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30 text-sm text-blue-700 dark:text-blue-300">
										<p className="font-semibold flex items-center gap-2 mb-1">
											<BrainCircuit className="w-4 h-4" />
											AI Enhanced View
										</p>
										<p>
											This ultrasound scan has been
											re-evaluated to generate a
											segmentation mask (highlighted area)
											showing potential regions of
											interest.
										</p>
									</div>

									{/* Opacity Controls */}
									<div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 space-y-4">
										<div className="space-y-2">
											<div className="flex justify-between text-xs font-semibold text-slate-500 uppercase">
												<span>Image Opacity</span>
												<span>
													{Math.round(
														imageOpacity * 100
													)}
													%
												</span>
											</div>
											<input
												type="range"
												min="0"
												max="1"
												step="0.05"
												value={imageOpacity}
												onChange={(e) =>
													setImageOpacity(
														parseFloat(
															e.target.value
														)
													)
												}
												className="w-full accent-slate-600 dark:accent-slate-400 cursor-pointer"
											/>
										</div>
										<div className="space-y-2">
											<div className="flex justify-between text-xs font-semibold text-slate-500 uppercase">
												<span>Mask Opacity</span>
												<span>
													{Math.round(
														maskOpacity * 100
													)}
													%
												</span>
											</div>
											<input
												type="range"
												min="0"
												max="1"
												step="0.05"
												value={maskOpacity}
												onChange={(e) =>
													setMaskOpacity(
														parseFloat(
															e.target.value
														)
													)
												}
												className="w-full accent-pink-500 cursor-pointer"
											/>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Right Column: Metadata & Details */}
					<div className="space-y-6">
						{/* Diagnosis Card */}
						<div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
							<h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
								Diagnosis Result
							</h2>

							<div className="flex flex-col gap-4">
								<div
									className={cn(
										"p-4 rounded-xl border flex items-center gap-3",
										scan.prediction_label === "Malignant" ||
											scan.prediction_label ===
												"Potential Abnormality Detected"
											? "bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-900/20 dark:border-rose-900/30 dark:text-rose-400"
											: "bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-900/30 dark:text-emerald-400"
									)}>
									{scan.prediction_label === "Malignant" ||
									scan.prediction_label ===
										"Potential Abnormality Detected" ? (
										<AlertTriangle className="w-6 h-6 shrink-0" />
									) : (
										<CheckCircle className="w-6 h-6 shrink-0" />
									)}
									<div>
										<p className="font-bold text-lg leading-tight">
											{scan.prediction_label}
										</p>
										<p className="text-sm opacity-80 mt-1">
											Based on AI Analysis
										</p>
									</div>
								</div>

								<div className="space-y-2">
									<div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400">
										<span>Confidence Score</span>
										<span className="font-mono font-bold text-slate-700 dark:text-slate-200">
											{(
												scan.confidence_score * 100
											).toFixed(1)}
											%
										</span>
									</div>
									<div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
										<div
											className={cn(
												"h-full rounded-full transition-all duration-1000",
												scan.confidence_score > 0.7
													? "bg-emerald-500"
													: "bg-amber-500"
											)}
											style={{
												width: `${
													scan.confidence_score * 100
												}%`,
											}}
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Details Card */}
						<div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
							<h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
								Technical Details
							</h2>

							<div className="space-y-4">
								<DetailRow
									label="Scan Type"
									value={scan.scan_type || "N/A"}
									className="capitalize"
								/>
								<DetailRow
									label="Scan ID"
									value={scan.id}
									className="font-mono text-xs truncate max-w-[150px]"
								/>
								<DetailRow
									label="Date"
									value={new Date(
										scan.created_at
									).toLocaleDateString()}
								/>
								<DetailRow
									label="Time"
									value={new Date(
										scan.created_at
									).toLocaleTimeString()}
								/>

								{isUltrasound && revalData && (
									<>
										<div className="h-px bg-slate-100 dark:bg-slate-700 my-4" />
										<h3 className="text-xs font-semibold text-slate-400 mb-2">
											Re-evaluation Data
										</h3>
										<DetailRow
											label="New Prediction"
											value={revalData.prediction}
											className="text-xs"
										/>
										<DetailRow
											label="Tumor Detected"
											value={
												revalData.tumor_detected
													? "Yes"
													: "No"
											}
										/>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function DetailRow({
	label,
	value,
	className,
}: {
	label: string;
	value: string | React.ReactNode;
	className?: string;
}) {
	return (
		<div className="flex justify-between items-start gap-4">
			<span className="text-sm text-slate-500 dark:text-slate-400 shrink-0">
				{label}
			</span>
			<span
				className={cn(
					"text-sm font-medium text-slate-700 dark:text-slate-200 text-right",
					className
				)}>
				{value}
			</span>
		</div>
	);
}
