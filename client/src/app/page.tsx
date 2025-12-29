"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { checkSession } from "@/lib/features/authSlice";
import { fetchHistory } from "@/lib/features/historySlice";
import DashboardStats from "@/components/DashboardStats";
import { DashboardLoader } from "@/components/DashboardLoader";
import { useRouter } from "next/navigation";

export default function Home() {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const { user, loading: authLoading } = useAppSelector(
		(state) => state.auth
	);
	const { scans, loading: historyLoading } = useAppSelector(
		(state) => state.history
	);

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

	if (authLoading || (user && historyLoading && scans.length === 0))
		return <DashboardLoader />;
	if (!user) return null;

	return (
		<div className="max-w-6xl mx-auto space-y-8 pb-20 md:ml-72">
			<header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
				<div>
					<motion.h1
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-400 bg-clip-text text-transparent mb-2">
						Dashboard
					</motion.h1>
					<p className="text-slate-500 dark:text-slate-400">
						Welcome back, {user.email}
					</p>
				</div>
			</header>

			<DashboardStats scans={scans} />
		</div>
	);
}
