/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Cairo', 'sans-serif'],
            },
            colors: {
                background: "#020617", // Slate 950
                foreground: "#f1f5f9", // Slate 100
                primary: {
                    DEFAULT: "#7c3aed", // Violet 600
                    foreground: "#ffffff",
                },
                secondary: {
                    DEFAULT: "#d97706", // Amber 600
                    foreground: "#ffffff",
                },
                accent: {
                    DEFAULT: "#c026d3", // Fuchsia 600
                },
                card: {
                    DEFAULT: "rgba(15, 23, 42, 0.6)", // Slate 900 with opacity
                    foreground: "#f1f5f9",
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-gradient': 'linear-gradient(to bottom right, #020617, #2e1065)', // Slate 950 to Violet 950
            }
        },
    },
    plugins: [],
}
