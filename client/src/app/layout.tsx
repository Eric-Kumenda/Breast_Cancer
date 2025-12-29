import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google"; // Adding Outfit for headers
import "./globals.css";
import StoreProvider from "./StoreProvider";
import Sidebar from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' }); // Optional: nicer headings

export const metadata: Metadata = {
	title: "EarlyVision - Breast Cancer Detection",
	description:
		"EarlyVision uses advanced AI to detect breast cancer early from mammograms and ultrasounds.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className}>
				<StoreProvider>
					<ThemeProvider>
						<div className="flex min-h-screen relative bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
							<Sidebar />
							<main className="flex-1 p-4 md:p-10 transition-all duration-300">
								{children}
							</main>
						</div>
					</ThemeProvider>
				</StoreProvider>
			</body>
		</html>
	);
}
