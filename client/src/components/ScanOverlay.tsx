import React from "react";
import { cn } from "@/lib/utils";

interface ScanOverlayProps {
	imageUrl: string;
	maskImage?: string; // Base64 or URL
	className?: string;
	imageOpacity?: number;
	maskOpacity?: number;
}

export const ScanOverlay: React.FC<ScanOverlayProps> = ({
	imageUrl,
	maskImage,
	className,
	imageOpacity = 1,
	maskOpacity = 0.6,
}) => {
	return (
		<div
			className={cn(
				"relative rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700",
				className
			)}>
			{/* Original Image */}
			<img
				src={imageUrl}
				alt="Scan Original"
				className="w-full h-full object-cover transition-opacity duration-200"
				style={{ opacity: imageOpacity }}
			/>

			{/* Mask Overlay (if present) */}
			{maskImage && (
				<div
					className="absolute inset-0 z-10 pointer-events-none mix-blend-normal transition-opacity duration-200"
					style={{ opacity: maskOpacity }}>
					<img
						src={maskImage}
						alt="Segmentation Mask"
						className="w-full h-full object-cover"
					/>
				</div>
			)}

			{/* Legend/Info if needed */}
			{maskImage && (
				<div
					className="absolute bottom-2 right-2 z-20 bg-black/70 backdrop-blur px-2 py-1 rounded text-xs text-white transition-opacity duration-200"
					// Hide label if mask is invisible
					style={{ opacity: maskOpacity > 0 ? 1 : 0 }}>
					Mask Overlay
				</div>
			)}
		</div>
	);
};
