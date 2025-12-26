"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState<Theme>("light");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		// Check local storage or system preference
		const storedTheme = localStorage.getItem("theme") as Theme;
		if (storedTheme) {
			setTheme(storedTheme);
		} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
			setTheme("dark");
		}
	}, []);

	useEffect(() => {
		if (!mounted) return;
		const root = window.document.documentElement;
		root.classList.remove("light", "dark");
		root.classList.add(theme);
		localStorage.setItem("theme", theme);
	}, [theme, mounted]);

	const toggleTheme = () => {
		setTheme((prev) => (prev === "light" ? "dark" : "light"));
	};

	// To prevent hydration mismatch, we might want to return null/loading or just children
	// returning children is fine, but theme might be wrong for a split second (flash of wrong theme)
	// For now, let's just render.

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
};
