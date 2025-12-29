"use client";

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
	fetchHistory,
	deleteScan,
	ScanRecord,
} from "@/lib/features/historySlice";
import GlassCard from "@/components/GlassCard";
import { Calendar, AlertOctagon, CheckCircle, Search } from "lucide-react";
import { checkSession } from "@/lib/features/authSlice";
import { useRouter } from "next/navigation";
import { DashboardLoader } from "@/components/DashboardLoader";
import { cn } from "@/lib/utils";
import Lightbox from "@/components/Lightbox";
import Modal from "@/components/Modal";

export default function HistoryPage() {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const { scans, loading, error } = useAppSelector((state) => state.history);
	const { user, loading: authLoading } = useAppSelector(
		(state) => state.auth
	);
	const [lightboxImage, setLightboxImage] = React.useState<string | null>(
		null
	);

	const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
	const [scanToDelete, setScanToDelete] = React.useState<string | null>(null);
	const [isDeleting, setIsDeleting] = React.useState(false);

	// Filter Logic
	const [filterType, setFilterType] = React.useState<
		"all" | "mammogram" | "ultrasound"
	>("all");
	const [searchQuery, setSearchQuery] = React.useState("");

	const filteredScans = React.useMemo(() => {
		return scans.filter((scan) => {
			// 1. Filter by Type
			if (filterType !== "all" && scan.scan_type !== filterType) {
				// Fallback for messy data: if scan_type is missing, assume mammogram if filter is mammogram?
				// Or just strict string match. Let's do strict.
				// Actually, if scan_type is undefined, it might be an old mammogram.
				if (filterType === "mammogram" && !scan.scan_type) return true;
				return false;
			}

			// 2. Filter by Search (ID or Type)
			if (searchQuery) {
				const q = searchQuery.toLowerCase();
				const idMatch = scan.id.toLowerCase().includes(q);
				const typeMatch = (scan.scan_type || "mammogram")
					.toLowerCase()
					.includes(q);
				return idMatch || typeMatch;
			}

			return true;
		});
	}, [scans, filterType, searchQuery]);

	const confirmDelete = (scanId: string) => {
		setScanToDelete(scanId);
		setDeleteModalOpen(true);
	};

	const executeDelete = async () => {
		if (scanToDelete && !isDeleting) {
			setIsDeleting(true);
			await dispatch(deleteScan(scanToDelete));
			setIsDeleting(false);
			setDeleteModalOpen(false);
			setScanToDelete(null);
		}
	};

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

	if (loading || authLoading) return <DashboardLoader />;

	if (error) {
		return (
			<div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-200">
				Error: {error}
			</div>
		);
	}

	return (
		<div className="md:ml-72">
			<div className="max-w-6xl mx-auto pb-20 space-y-8 pt-10 px-6">
				<header className="flex flex-col gap-6">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
						<div>
							<h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
								Scan History
							</h1>
							<p className="text-slate-500 dark:text-slate-400">
								Archive of all previous diagnostic sessions.
							</p>
						</div>
						<div className="relative">
							<Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
							<input
								type="text"
								placeholder="Search ID or Type..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-pink-500 w-full md:w-64 shadow-sm text-slate-800 dark:text-slate-200"
							/>
						</div>
					</div>

					{/* Filter Tabs */}
					<div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
						{(["all", "mammogram", "ultrasound"] as const).map(
							(type) => (
								<button
									key={type}
									onClick={() => setFilterType(type)}
									className={cn(
										"px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all",
										filterType === type
											? "bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 shadow-sm"
											: "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
									)}>
									{type}
								</button>
							)
						)}
					</div>
				</header>

				<div className="grid gap-4">
					{filteredScans.length === 0 ? (
						<div className="text-center py-20">
							<p className="text-slate-400">
								No scans found matching your criteria.
							</p>
						</div>
					) : (
						filteredScans.map((scan: ScanRecord) => (
							<GlassCard
								key={scan.id}
								className="p-4 flex flex-col md:flex-row gap-6 items-center hover:bg-white/90 dark:hover:bg-slate-800/90 transition-colors cursor-pointer group">
								<div
									className="w-full aspect-square md:w-24 md:h-24 md:aspect-auto flex-shrink-0 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative"
									onClick={(e) => {
										e.stopPropagation();
										setLightboxImage(
											scan.original_image_url || null
										);
									}}>
									{scan.original_image_url ? (
										<img
											src={scan.original_image_url}
											alt="Scan"
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
											No Img
										</div>
									)}
									{/* Type Badge on Image */}
									<div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/50 backdrop-blur rounded text-[10px] text-white font-medium uppercase">
										{scan.scan_type || "Mammogram"}
									</div>
								</div>

								<div className="flex-1 space-y-1 text-center md:text-left">
									<div className="flex items-center justify-center md:justify-start gap-3 text-xs font-medium text-slate-400 uppercase tracking-wide">
										<span className="flex items-center gap-1">
											<Calendar className="w-3 h-3" />
											{new Date(
												scan.created_at
											).toLocaleDateString()}
										</span>
										<span>•</span>
										<span>ID: {scan.id.slice(0, 8)}</span>
									</div>
									<h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center md:justify-start gap-2">
										{scan.prediction_label} Detection
										{/* Optional: Icon based on type */}
									</h3>
									<p className="text-sm text-slate-500 dark:text-slate-400">
										Confidence Score:{" "}
										<span className="font-semibold text-slate-700 dark:text-slate-300">
											{(
												scan.confidence_score * 100
											).toFixed(1)}
											%
										</span>
									</p>
								</div>

								<div className="flex-shrink-0 flex items-center gap-4">
									{scan.prediction_label === "Malignant" ||
									scan.prediction_label ===
										"Potential Abnormality Detected" ? (
										<div className="flex items-center gap-2 px-5 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-full text-sm font-bold border border-rose-100 dark:border-rose-900/30">
											<AlertOctagon className="w-4 h-4" />{" "}
											High Risk
										</div>
									) : (
										<div className="flex items-center gap-2 px-5 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-bold border border-emerald-100 dark:border-emerald-900/30">
											<CheckCircle className="w-4 h-4" />{" "}
											Benign
										</div>
									)}
									{/* Delete Button */}
									<button
										onClick={(e) => {
											e.stopPropagation();
											confirmDelete(scan.id);
										}}
										className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
										title="Delete Scan">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="20"
											height="20"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round">
											<path d="M3 6h18" />
											<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
											<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
											<line
												x1="10"
												x2="10"
												y1="11"
												y2="17"
											/>
											<line
												x1="14"
												x2="14"
												y1="11"
												y2="17"
											/>
										</svg>
									</button>
								</div>
							</GlassCard>
						))
					)}
				</div>

				<Lightbox
					isOpen={!!lightboxImage}
					imageSrc={lightboxImage}
					onClose={() => setLightboxImage(null)}
				/>

				<Modal
					isOpen={deleteModalOpen}
					onClose={() => setDeleteModalOpen(false)}
					title="Delete Scan Record"
					footer={
						<>
							<button
								onClick={() => setDeleteModalOpen(false)}
								disabled={isDeleting}
								className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors disabled:opacity-50">
								Cancel
							</button>
							<button
								onClick={executeDelete}
								disabled={isDeleting}
								className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
								{isDeleting ? "Deleting..." : "Delete"}
							</button>
						</>
					}>
					<p>
						Are you sure you want to permanently delete this scan?
						This action cannot be undone and will remove the record
						from the database and the image from storage.
					</p>
				</Modal>
			</div>
		</div>
	);
}
