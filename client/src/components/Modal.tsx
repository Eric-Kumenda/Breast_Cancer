"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
}

export default function Modal({
	isOpen,
	onClose,
	title,
	children,
	footer,
}: ModalProps) {
	// Prevent scrolling when modal is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="absolute inset-0 bg-black/50 backdrop-blur-sm"
					onClick={onClose}
				/>
				<motion.div
					initial={{ scale: 0.95, opacity: 0, y: 20 }}
					animate={{ scale: 1, opacity: 1, y: 0 }}
					exit={{ scale: 0.95, opacity: 0, y: 20 }}
					className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
					<div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
						<h3 className="text-xl font-bold text-slate-800 dark:text-white">
							{title}
						</h3>
						<button
							onClick={onClose}
							className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
							<X className="w-5 h-5" />
						</button>
					</div>

					<div className="p-6 text-slate-600 dark:text-slate-300">
						{children}
					</div>

					{footer && (
						<div className="p-6 pt-0 flex justify-end gap-3">
							{footer}
						</div>
					)}
				</motion.div>
			</div>
		</AnimatePresence>
	);
}
