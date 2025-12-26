"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
	children: React.ReactNode;
}

export default function GlassCard({
	children,
	className,
	...props
}: GlassCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: "easeOut" }}
			className={cn("glass-card rounded-2xl p-6 md:p-8", className)}
			{...props}>
			{children}
		</motion.div>
	);
}
