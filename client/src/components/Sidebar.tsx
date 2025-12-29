"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { signOut } from "@/lib/features/authSlice";
import {
	Activity,
	History,
	Settings,
	LogOut,
	Menu,
	X,
	Sun,
	Moon,
	ChartPie,
	Plus,
	Microscope,
	Fullscreen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTheme } from "./ThemeProvider";

export default function Sidebar() {
	const pathname = usePathname();
	const dispatch = useAppDispatch();
	const { session } = useAppSelector((state) => state.auth);
	const [isOpen, setIsOpen] = useState(false);
	const { theme, toggleTheme } = useTheme();

	if (!session) return null;

	const links = [
		{ name: "Dashboard", href: "/", icon: ChartPie },
		{ name: "Mammogram", href: "/mammogram", icon: Fullscreen },
		{ name: "Ultrasound", href: "/ultrasound", icon: Microscope },

		{ name: "History", href: "/history", icon: History },
	];

	return (
		<>
			{/* Mobile Toggle */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-full shadow-lg text-pink-600 dark:text-pink-400">
				{isOpen ? <X /> : <Menu />}
			</button>

			{/* Sidebar container */}
			<aside
				className={cn(
					"fixed left-0 top-0 h-screen w-72 glass-sidebar z-40 transition-transform duration-300 md:translate-x-0 flex flex-col p-8 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 shadow-xl md:shadow-none",
					isOpen ? "translate-x-0" : "-translate-x-full"
				)}>
				<div className="flex items-center gap-3 mb-12">
					<div className="flex items-center gap-3 px-2">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
							<Activity className="h-6 w-6" />
						</div>
						<span className="text-xl font-bold text-foreground">
							EarlyVision
						</span>
					</div>
				</div>

				<nav className="flex-1 space-y-3">
					{links.map((link) => {
						const Icon = link.icon;
						const isActive = pathname === link.href;
						return (
							<Link
								key={link.name}
								href={link.href}
								onClick={() => setIsOpen(false)}
								className={cn(
									"flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group font-medium relative overflow-hidden",
									isActive
										? "text-pink-600 dark:text-pink-400 shadow-sm bg-pink-50/50 dark:bg-pink-500/10"
										: "text-slate-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50/30 dark:hover:bg-pink-500/5"
								)}>
								{isActive && (
									<motion.div
										layoutId="activeTab"
										className="absolute left-0 top-0 w-1 h-full bg-pink-500 rounded-r-full"
									/>
								)}
								<Icon
									className={cn(
										"w-5 h-5 transition-colors",
										isActive
											? "text-pink-500"
											: "text-slate-400 group-hover:text-pink-400"
									)}
								/>
								{link.name}
							</Link>
						);
					})}
				</nav>

				<div className="mt-auto space-y-4">
					{/* Theme Toggle 
					<button
						onClick={toggleTheme}
						className="flex items-center gap-4 px-4 py-3 w-full rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
						{theme === "light" ? (
							<>
								<Moon className="w-5 h-5 text-slate-400" />
								<span className="font-medium">Dark Mode</span>
							</>
						) : (
							<>
								<Sun className="w-5 h-5 text-amber-400" />
								<span className="font-medium">Light Mode</span>
							</>
						)}
					</button>
         					 */}

					<div className="pt-4 border-t border-pink-100/50 dark:border-pink-500/10">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold overflow-hidden">
								{session.user.user_metadata?.avatar_url ? (
									<img
										src={
											session.user.user_metadata
												.avatar_url
										}
										alt="User"
									/>
								) : (
									<span className="text-sm">
										{session.user.email?.[0].toUpperCase()}
									</span>
								)}
							</div>
							<div className="overflow-hidden">
								<p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate w-32">
									{session.user.email}
								</p>
								<p className="text-xs text-slate-400">
									Radiologist
								</p>
							</div>
						</div>
						<button
							onClick={() => dispatch(signOut())}
							className="flex items-center gap-3 px-4 py-2 w-full rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 group">
							<LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
							Sign Out
						</button>
					</div>
				</div>
			</aside>

			{/* Overlay for mobile */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
					onClick={() => setIsOpen(false)}
				/>
			)}
		</>
	);
}
