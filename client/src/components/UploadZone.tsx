"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, FileImage, Check, Loader2, Sparkles } from "lucide-react";
import GlassCard from "./GlassCard";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface UploadZoneProps {
	onFileSelect: (file: File) => void;
	isScanning: boolean;
}

export default function UploadZone({
	onFileSelect,
	isScanning,
}: UploadZoneProps) {
	const [isDragActive, setIsDragActive] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragActive(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragActive(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragActive(false);
		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			onFileSelect(e.dataTransfer.files[0]);
		}
	};

	const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			onFileSelect(e.target.files[0]);
		}
	};

	return (
		<GlassCard
			className={cn(
				"relative overflow-hidden group border-2 border-dashed transition-all duration-300 min-h-[400px] flex flex-col items-center justify-center cursor-pointer",
				isDragActive
					? "border-pink-500 bg-pink-50/50"
					: "border-slate-200 hover:border-pink-300 hover:bg-white/50"
			)}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			onClick={() => !isScanning && fileInputRef.current?.click()}>
			<AnimatePresence>
				{isScanning && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
						<div className="relative w-64 h-64 flex items-center justify-center">
							{/* Scanning Bar */}
							<motion.div
								className="absolute w-full h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent shadow-[0_0_15px_rgba(236,72,153,0.8)] z-30"
								animate={{ top: ["0%", "100%", "0%"] }}
								transition={{
									duration: 3,
									ease: "linear",
									repeat: Infinity,
								}}
							/>

							<div className="w-48 h-48 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden relative">
								{/* Fake scanning grid */}
								<div className="absolute inset-0 bg-[linear-gradient(rgba(236,72,153,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(236,72,153,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
								<Loader2 className="w-8 h-8 text-pink-500 animate-spin z-10" />
							</div>
						</div>

						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
							className="mt-6 text-center">
							<h3 className="text-xl font-bold text-slate-800 flex items-center justify-center gap-2">
								Analyzing Scans{" "}
								<Sparkles className="w-5 h-5 text-pink-500 animate-pulse" />
							</h3>
							<p className="text-slate-500 mt-1">
								VGG16 Model Processing • Detecting Anomalies
							</p>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			<input
				type="file"
				ref={fileInputRef}
				className="hidden"
				accept="image/*"
				onChange={handleFileInput}
			/>

			<motion.div
				animate={{ scale: isDragActive ? 1.1 : 1 }}
				className="w-20 h-20 bg-pink-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
				<UploadCloud className="w-10 h-10 text-pink-500" />
			</motion.div>

			<h3 className="text-2xl font-bold mb-2 text-slate-800 text-center">
				Upload Mammogram
			</h3>
			<p className="text-slate-500 mb-8 text-center max-w-sm">
				Drag and drop your DICOM or Image files here, or click to
				browse.
			</p>

			<div className="flex gap-3">
				<span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-md text-xs font-medium flex items-center gap-1.5">
					<FileImage className="w-3.5 h-3.5" /> JPG, PNG
				</span>
				<span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-md text-xs font-medium flex items-center gap-1.5">
					<Check className="w-3.5 h-3.5" /> High Res
				</span>
			</div>
		</GlassCard>
	);
}
