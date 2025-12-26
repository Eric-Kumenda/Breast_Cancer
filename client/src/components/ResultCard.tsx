"use client";

import React from "react";
import GlassCard from "./GlassCard";
import { CheckCircle, AlertOctagon, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ResultCardProps {
	prediction: string;
	confidence: number;
	imageUrl?: string;
}

export default function ResultCard({
	prediction,
	confidence,
	imageUrl,
}: ResultCardProps) {
	const isMalignant = prediction === "Malignant";
	const percentage = (confidence * 100).toFixed(1);
	const color = isMalignant ? "rose" : "emerald"; // Tailwind dynamic colors can be tricky, stick to explicit classes or strict palette

	return (
		<GlassCard className="overflow-hidden p-0 md:p-0">
			<div className="grid md:grid-cols-2">
				{/* Image Section */}
				<div className="relative h-64 md:h-auto bg-slate-900 overflow-hidden group">
					{imageUrl ? (
						<motion.img
							initial={{ scale: 1.1 }}
							animate={{ scale: 1 }}
							transition={{ duration: 1.5 }}
							src={imageUrl}
							alt="Scan"
							className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center text-slate-500">
							No Image
						</div>
					)}
					<div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
						<span className="text-white/80 text-sm font-medium">
							Input Source
						</span>
					</div>
				</div>

				{/* Content Section */}
				<div className="p-8 space-y-8">
					<div>
						<div className="flex items-center gap-2 mb-2">
							<Activity className="w-5 h-5 text-slate-400" />
							<h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
								Analysis Result
							</h4>
						</div>

						<div className="flex items-center gap-4">
							{isMalignant ? (
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
									<AlertOctagon className="w-7 h-7" />
								</motion.div>
							) : (
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
									<CheckCircle className="w-7 h-7" />
								</motion.div>
							)}
							<div>
								<h2
									className={cn(
										"text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r",
										isMalignant
											? "from-rose-600 to-pink-600"
											: "from-emerald-600 to-teal-500"
									)}>
									{prediction}
								</h2>
								<p className="text-slate-400 text-sm">
									Detected Class
								</p>
							</div>
						</div>
					</div>

					<div>
						<div className="flex justify-between items-end mb-3">
							<span className="text-slate-600 font-medium">
								Confidence Score
							</span>
							<span className="text-2xl font-bold text-slate-800">
								{percentage}%
							</span>
						</div>
						<div className="h-3 bg-slate-100 rounded-full overflow-hidden">
							<motion.div
								initial={{ width: 0 }}
								animate={{ width: `${percentage}%` }}
								transition={{ duration: 1, ease: "circOut" }}
								className={cn(
									"h-full rounded-full",
									isMalignant
										? "bg-gradient-to-r from-rose-500 to-pink-500"
										: "bg-gradient-to-r from-emerald-500 to-teal-500"
								)}
							/>
						</div>
					</div>

					<div className="pt-6 border-t border-slate-100">
						<p className="text-slate-500 text-sm leading-relaxed">
							{isMalignant
								? "AI indicates a high probability of malignancy. Please confirm with biopsy and review heatmap generation if available."
								: "AI indicates benign tissue structure with high confidence. Routine screening suggested."}
						</p>
					</div>
				</div>
			</div>
		</GlassCard>
	);
}
