"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Loader2, ArrowRight, Wand2, Activity } from "lucide-react";
import { useAppDispatch } from "@/lib/hooks";
import { checkSession } from "@/lib/features/authSlice";
import { motion } from "framer-motion";

export default function LoginPage() {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [magicLoading, setMagicLoading] = useState(false);
	const [isSignUp, setIsSignUp] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [magicMessage, setMagicMessage] = useState<string | null>(null);

	const handleAuth = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			if (isSignUp) {
				const { error } = await supabase.auth.signUp({
					email,
					password,
				});
				if (error) throw error;
				alert("Check your email for the confirmation link!");
			} else {
				const { error } = await supabase.auth.signInWithPassword({
					email,
					password,
				});
				if (error) throw error;
				await dispatch(checkSession());
				router.push("/");
			}
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleMagicLink = async () => {
		if (!email) {
			setError("Please enter your email first.");
			return;
		}
		setMagicLoading(true);
		setError(null);
		setMagicMessage(null);
		try {
			const { error } = await supabase.auth.signInWithOtp({ email });
			if (error) throw error;
			setMagicMessage("Check your email for the magic link!");
		} catch (err: any) {
			setError(err.message);
		} finally {
			setMagicLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex">
			{/* Left Side - Image */}
			<div className="hidden lg:block w-1/2 bg-slate-900 relative">
				<div className="absolute inset-0 bg-gradient-to-tr from-pink-600/30 to-purple-600/30 mix-blend-overlay z-10" />
				<img
					src="/mammo_auth_bg.svg"
					alt="Medical Background"
					className="w-full h-full object-cover opacity-80"
				/>
				<div className="absolute bottom-0 left-0 w-full p-12 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20">
					<blockquote className="text-white max-w-lg">
						<p className="text-2xl font-serif italic mb-4">
							"Advanced detection, clearer results, and a better
							future for radiology."
						</p>
						<footer className="text-white/70 font-medium">
							MammoDetect AI
						</footer>
					</blockquote>
				</div>
			</div>

			{/* Right Side - Form */}
			<div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-900 transition-colors">
				<div className="w-full max-w-md">
					<div className="text-center mb-10">
						<div className="flex items-center justify-center gap-2 mb-2">
							<Activity className="h-8 w-8 text-primary" />
							<span className="text-2xl font-bold text-foreground">
								EarlyVision
							</span>
						</div>
						<h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-3 font-display">
							{isSignUp ? "Create Account" : "Welcome Back"}
						</h1>
						<p className="text-slate-500 dark:text-slate-400 text-lg">
							{isSignUp
								? "Join the network today"
								: "Sign in to your dashboard"}
						</p>
					</div>

					{error && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium text-center">
							{error}
						</motion.div>
					)}

					{magicMessage && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							className="mb-6 p-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-sm font-medium text-center">
							{magicMessage}
						</motion.div>
					)}

					<form onSubmit={handleAuth} className="space-y-5">
						<div className="space-y-2">
							<label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
								Email Address
							</label>
							<div className="relative group">
								<Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
								<input
									type="email"
									required
									className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-800 dark:text-white font-medium"
									placeholder="name@hospital.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<div className="flex justify-between items-center ml-1">
								<label className="text-sm font-bold text-slate-700 dark:text-slate-300">
									Password
								</label>
								{!isSignUp && (
									<Link
										href="/forgot-password"
										className="text-sm text-pink-500 hover:text-pink-600 font-medium">
										Forgot Password?
									</Link>
								)}
							</div>
							<div className="relative group">
								<Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
								<input
									type="password"
									required
									className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-800 dark:text-white font-medium"
									placeholder="••••••••"
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
								/>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group">
							{loading ? (
								<Loader2 className="w-5 h-5 animate-spin" />
							) : isSignUp ? (
								"Create Account"
							) : (
								"Sign In"
							)}
						</button>

						{!isSignUp && (
							<button
								type="button"
								onClick={handleMagicLink}
								disabled={magicLoading}
								className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
								{magicLoading ? (
									<Loader2 className="w-4 h-4 animate-spin" />
								) : (
									<>
										<Wand2 className="w-4 h-4" /> Sign in
										with Magic Link
									</>
								)}
							</button>
						)}
					</form>

					<div className="mt-8 text-center">
						<p className="text-slate-500 dark:text-slate-400">
							{isSignUp
								? "Already have an account?"
								: "Don't have an account?"}
							<button
								onClick={() => setIsSignUp(!isSignUp)}
								className="ml-2 font-bold text-slate-800 dark:text-white hover:text-pink-500 transition-colors">
								{isSignUp ? "Sign In" : "Sign Up"}
							</button>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
