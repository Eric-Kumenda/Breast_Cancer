"use client";

import React from "react";
import { motion } from "framer-motion";
import {
	Activity,
	Users,
	CheckCircle,
	AlertOctagon,
	TrendingUp,
} from "lucide-react";
import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	Tooltip,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
} from "recharts";
import { ScanRecord } from "@/lib/features/historySlice";

interface DashboardStatsProps {
	scans: ScanRecord[];
}

export default function DashboardStats({ scans }: DashboardStatsProps) {
	const totalScans = scans.length;
	const malignantCount = scans.filter(
		(s) => s.prediction_label === "Malignant"
	).length;
	const benignCount = scans.filter(
		(s) => s.prediction_label === "Benign"
	).length;

	// Average Confidence
	const avgConfidence =
		totalScans > 0
			? (
					(scans.reduce(
						(acc, curr) => acc + curr.confidence_score,
						0
					) /
						totalScans) *
					100
			  ).toFixed(1)
			: "0.0";

	// Pie Chart Data
	const pieData = [
		{ name: "Benign", value: benignCount, color: "#10b981" }, // Emerald-500
		{ name: "Malignant", value: malignantCount, color: "#f43f5e" }, // Rose-500
	];

	// Accuracy Distribution (Mock for now, or bin confidence scores?)
	// Let's bin confidence scores > 90%, 80-90%, < 80%
	const highConf = scans.filter((s) => s.confidence_score >= 0.9).length;
	const medConf = scans.filter(
		(s) => s.confidence_score >= 0.8 && s.confidence_score < 0.9
	).length;
	const lowConf = scans.filter((s) => s.confidence_score < 0.8).length;

	const barData = [
		{ name: ">90%", count: highConf },
		{ name: "80-90%", count: medConf },
		{ name: "<80%", count: lowConf },
	];

	const stats = [
		{
			title: "Total Scans",
			value: totalScans,
			icon: Activity,
			color: "text-blue-500",
			bg: "bg-blue-50 dark:bg-blue-900/20",
		},
		{
			title: "Avg. Confidence",
			value: `${avgConfidence}%`,
			icon: TrendingUp,
			color: "text-purple-500",
			bg: "bg-purple-50 dark:bg-purple-900/20",
		},
		{
			title: "Benign Cases",
			value: benignCount,
			icon: CheckCircle,
			color: "text-emerald-500",
			bg: "bg-emerald-50 dark:bg-emerald-900/20",
		},
		{
			title: "Malignant Cases",
			value: malignantCount,
			icon: AlertOctagon,
			color: "text-rose-500",
			bg: "bg-rose-50 dark:bg-rose-900/20",
		},
	];

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{stats.map((stat, index) => (
					<motion.div
						key={stat.title}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
						className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-slate-500 dark:text-slate-400">
									{stat.title}
								</p>
								<h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
									{stat.value}
								</h3>
							</div>
							<div className={`p-3 rounded-xl ${stat.bg}`}>
								<stat.icon
									className={`w-6 h-6 ${stat.color}`}
								/>
							</div>
						</div>
					</motion.div>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Pie Chart */}
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.4 }}
					className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none min-h-[350px]">
					<h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">
						Distribution Overview
					</h3>
					<div className="h-[250px] w-full">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={pieData}
									cx="50%"
									cy="50%"
									innerRadius={60}
									outerRadius={80}
									paddingAngle={5}
									dataKey="value">
									{pieData.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={entry.color}
										/>
									))}
								</Pie>
								<Tooltip
									contentStyle={{
										borderRadius: "12px",
										border: "none",
										boxShadow:
											"0 4px 6px -1px rgb(0 0 0 / 0.1)",
									}}
								/>
							</PieChart>
						</ResponsiveContainer>
					</div>
				</motion.div>

				{/* Bar Chart */}
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.5 }}
					className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none min-h-[350px]">
					<h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">
						Model Confidence Distribution
					</h3>
					<div className="h-[250px] w-full">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={barData}>
								<CartesianGrid
									strokeDasharray="3 3"
									vertical={false}
									stroke="#e2e8f0"
								/>
								<XAxis
									dataKey="name"
									axisLine={false}
									tickLine={false}
									tick={{ fill: "#94a3b8" }}
									dy={10}
								/>
								<YAxis
									axisLine={false}
									tickLine={false}
									tick={{ fill: "#94a3b8" }}
								/>
								<Tooltip
									cursor={{ fill: "transparent" }}
									contentStyle={{
										borderRadius: "12px",
										border: "none",
										boxShadow:
											"0 4px 6px -1px rgb(0 0 0 / 0.1)",
									}}
								/>
								<Bar
									dataKey="count"
									fill="#ec4899"
									radius={[4, 4, 0, 0]}
									barSize={40}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
