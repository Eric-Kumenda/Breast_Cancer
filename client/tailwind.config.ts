import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				primary: {
					50: "#fdf2f8",
					100: "#fce7f3",
					200: "#fbcfe8",
					300: "#f9a8d4",
					400: "#f472b6",
					500: "#ec4899", // Base pink
					600: "#db2777",
					700: "#be185d",
					800: "#9d174d",
					900: "#831843",
				},
				surface: {
					50: "#ffffff",
					100: "#fafafa",
					200: "#f4f4f5",
				},
			},
			fontFamily: {
				sans: ["var(--font-inter)", "sans-serif"],
			},
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"soft-gradient":
					"linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)",
			},
			animation: {
				scan: "scan 2.5s ease-in-out infinite",
				in: "in 0.3s ease-out forwards",
			},
			keyframes: {
				scan: {
					"0%, 100%": { transform: "translateY(-100%)" },
					"50%": { transform: "translateY(100%)" },
				},
				in: {
					"0%": { opacity: "0", transform: "translateY(10px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
			},
		},
	},
	plugins: [],
};
export default config;
