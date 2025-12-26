import { Sparkles, Loader2 } from "lucide-react";

export function DashboardLoader() {
	return (
		<div className="flex h-[80vh] items-center justify-center flex-col gap-4">
			<div className="relative">
				<Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
				<Sparkles className="w-6 h-6 text-pink-300 absolute -top-4 -right-4 animate-bounce" />
			</div>
			<p className="text-slate-400 animate-pulse">Loading Dashboard...</p>
		</div>
	);
}
