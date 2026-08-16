import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./index.html",
		"./src/**/*.{ts,tsx}",
		"../../libs/shared/{types,utils,data,supabase,ui}/src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: { center: true, padding: "1.5rem" },
		extend: {
			fontFamily: {
				sans: ["var(--font-sans)", "system-ui", "sans-serif"],
				display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
			},
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
					glow: "hsl(var(--primary-glow))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				coral: {
					DEFAULT: "hsl(var(--coral))",
					foreground: "hsl(var(--coral-foreground))",
					deep: "hsl(var(--coral-deep))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				success: {
					DEFAULT: "hsl(var(--success))",
					foreground: "hsl(var(--primary-foreground))",
				},
				warning: {
					DEFAULT: "hsl(var(--warning))",
					foreground: "hsl(var(--primary-foreground))",
				},
				info: {
					DEFAULT: "hsl(var(--info))",
					foreground: "hsl(var(--primary-foreground))",
				},
				status: {
					available: "hsl(var(--status-available))",
					"available-foreground": "hsl(var(--status-available-foreground))",
					"available-soft": "hsl(var(--status-available-bg))",
					pending: "hsl(var(--status-pending))",
					"pending-foreground": "hsl(var(--status-pending-foreground))",
					"pending-soft": "hsl(var(--status-pending-bg))",
					taken: "hsl(var(--status-taken))",
					"taken-foreground": "hsl(var(--status-taken-foreground))",
					"taken-soft": "hsl(var(--status-taken-bg))",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			boxShadow: {
				card: "var(--shadow-card)",
				elevated: "var(--shadow-elevated)",
				glow: "var(--shadow-glow)",
			},
			backgroundImage: {
				"gradient-primary": "var(--gradient-primary)",
				"gradient-subtle": "var(--gradient-subtle)",
				"gradient-hero": "var(--gradient-hero)",
			},
			keyframes: {
				"accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
				"accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
				"fade-in": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
				"pop-in": { from: { opacity: "0", transform: "scale(0.96)" }, to: { opacity: "1", transform: "scale(1)" } },
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"fade-in": "fade-in 0.35s ease-out both",
				"pop-in": "pop-in 0.25s ease-out both",
			},
		},
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
