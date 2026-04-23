
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '1rem',
			screens: {
				'2xl': '1400px'
			}
		},
		screens: {
			'xs': '375px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px'
		},
		extend: {
			fontFamily: {
				'inter': ['Inter', 'sans-serif'],
				'display': ['Playfair Display', 'Georgia', 'serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Jaipur heritage colors
				jaipur: {
					pink: 'hsl(var(--jaipur-pink))',
					terracotta: 'hsl(var(--jaipur-terracotta))',
					gold: 'hsl(var(--jaipur-gold))',
					sand: 'hsl(var(--jaipur-sand))',
					deep: 'hsl(var(--jaipur-deep))',
					heritage: 'hsl(var(--jaipur-heritage))',
				},
				campaign: {
					ipl: 'hsl(var(--campaign-ipl))',
					'ipl-foreground': 'hsl(var(--campaign-ipl-foreground))',
				},
				whatsapp: {
					DEFAULT: 'hsl(var(--whatsapp))',
					foreground: 'hsl(var(--whatsapp-foreground))'
				}
			},
			borderRadius: {
				'2xl': '1rem',
				'3xl': '1.5rem',
				'4xl': '2rem',
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			spacing: {
				'safe-area-inset-bottom': 'env(safe-area-inset-bottom)',
			},
			boxShadow: {
				'soft': 'var(--shadow-soft)',
				'glow': 'var(--shadow-glow)',
				'card': 'var(--shadow-card)',
				'heritage': '0 8px 30px -8px hsl(var(--jaipur-pink) / 0.25)',
			},
			backgroundImage: {
				'gradient-heritage': 'linear-gradient(135deg, hsl(var(--jaipur-pink)) 0%, hsl(var(--jaipur-terracotta)) 50%, hsl(var(--jaipur-gold)) 100%)',
				'gradient-warm': 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--jaipur-terracotta)) 100%)',
				'gradient-gold': 'linear-gradient(135deg, hsl(var(--jaipur-gold)) 0%, hsl(35, 85%, 50%) 100%)',
				'gradient-sunset': 'linear-gradient(180deg, hsl(var(--jaipur-pink)) 0%, hsl(30, 80%, 60%) 100%)',
				'gradient-radial': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'spin-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'scale-in': {
					'0%': { 
						opacity: '0', 
						transform: 'scale(0.95)' 
					},
					'100%': { 
						opacity: '1', 
						transform: 'scale(1)' 
					}
				},
				'fade-in': {
					'0%': { 
						opacity: '0', 
						transform: 'translateY(10px)' 
					},
					'100%': { 
						opacity: '1', 
						transform: 'translateY(0)' 
					}
				},
				'slide-up': {
					'0%': { 
						opacity: '0', 
						transform: 'translateY(20px)' 
					},
					'100%': { 
						opacity: '1', 
						transform: 'translateY(0)' 
					}
				},
				'bounce-subtle': {
					'0%, 100%': { 
						transform: 'translateY(0)' 
					},
					'50%': { 
						transform: 'translateY(-4px)' 
					}
				},
				'float': {
					'0%, 100%': { 
						transform: 'translateY(0)' 
					},
					'50%': { 
						transform: 'translateY(-6px)' 
					}
				},
				'pulse-soft': {
					'0%, 100%': { 
						opacity: '1' 
					},
					'50%': { 
						opacity: '0.7' 
					}
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'spin-slow': 'spin-slow 3s linear infinite',
				'scale-in': 'scale-in 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-up': 'slide-up 0.4s ease-out',
				'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
				'shimmer': 'shimmer 1.5s linear infinite',
			},
			backdropBlur: {
				xs: '2px',
			}
		}
	},
	plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
