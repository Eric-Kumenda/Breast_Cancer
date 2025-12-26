"use client";

import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LightboxProps {
	isOpen: boolean;
	imageSrc: string | null;
	onClose: () => void;
}

export default function Lightbox({ isOpen, imageSrc, onClose }: LightboxProps) {
	if (!isOpen || !imageSrc) return null;

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
				onClick={onClose}>
				<div className="absolute top-4 right-4 flex gap-4 z-50">
					<button
						onClick={onClose}
						className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
						<X className="w-6 h-6" />
					</button>
				</div>

				<div
					className="w-full h-full flex items-center justify-center"
					onClick={(e) => e.stopPropagation()}>
					<motion.img
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						src={imageSrc}
						className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
						alt="Full Screen Scan"
					/>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}
