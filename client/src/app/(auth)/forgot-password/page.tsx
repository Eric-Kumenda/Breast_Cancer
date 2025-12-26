"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { ArrowLeft, Mail, Loader2, KeyRound } from "lucide-react";
import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleReset = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setMessage(null);

		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/update-password`,
			});
			if (error) throw error;
			setMessage("Check your email for the password reset link.");
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex">
			{/* Left Side - Image */}
			<div className="hidden lg:block w-1/2 bg-slate-50 relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 z-10" />
				<img
					src="/mammo_auth_bg.svg"
					alt="Medical Abstract"
					className="w-full h-full object-cover"
				/>
				<div className="absolute bottom-10 left-10 z-20 text-white p-8 bg-black/50 backdrop-blur-md rounded-2xl max-w-lg">
					<h2 className="text-3xl font-bold mb-2">
						Secure & Reliable
					</h2>
					<p className="text-gray-200">
						Restoring access to your diagnostic tools securely.
					</p>
				</div>
			</div>

			{/* Right Side - Form */}
			<div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-900 transition-colors">
				<div className="w-full max-w-md space-y-8">
					<div className="text-center">
						<Link
							href="/login"
							className="inline-flex items-center text-sm text-slate-500 hover:text-pink-600 transition-colors mb-6">
							<ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
						</Link>
						<motion.div
							initial={{ scale: 0.5, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-2xl mx-auto flex items-center justify-center mb-6 text-pink-600 dark:text-pink-400">
							<KeyRound className="w-8 h-8" />
						</motion.div>
						<h1 className="text-3xl font-bold text-slate-800 dark:text-white">
							Reset Password
						</h1>
						<p className="text-slate-500 dark:text-slate-400 mt-2">
							Enter your email to receive recovery instructions.
						</p>
					</div>

					{message && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-center font-medium">
							{message}
						</motion.div>
					)}

					{error && (
						<div className="p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-center font-medium">
							{error}
						</div>
					)}

					<form onSubmit={handleReset} className="space-y-6">
						<div className="space-y-2">
							<label className="text-sm font-semibold text-slate-600 dark:text-slate-300 ml-1">
								Email Address
							</label>
							<div className="relative group">
								<Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
								<input
									type="email"
									required
									className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-800 dark:text-white"
									placeholder="doctor@hospital.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
							{loading ? (
								<Loader2 className="w-5 h-5 animate-spin" />
							) : (
								"Send Reset Link"
							)}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
