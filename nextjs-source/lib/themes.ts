import type { Theme, Tone } from "@/types/presentation";

/** Visual themes keyed by tone. Shared contract with the front-end preview. */
export const THEMES: Record<Tone, Theme> = {
  tech:      { name: "Tech",            dark: false, bg: "#FFFFFF", title: "#0E1116", body: "#5B6573", accent: "#E5322B" },
  modern:    { name: "Современный",      dark: false, bg: "#FFFFFF", title: "#0E1116", body: "#5B6573", accent: "#E5322B" },
  strict:    { name: "Строгий",          dark: false, bg: "#FFFFFF", title: "#14161B", body: "#535C68", accent: "#C0241E" },
  minimal:   { name: "Минималистичный",  dark: false, bg: "#FFFFFF", title: "#15181F", body: "#6B7280", accent: "#E5322B" },
  premium:   { name: "Premium",          dark: true,  bg: "#0C0E12", title: "#FFFFFF", body: "#A7AEBB", accent: "#F0463E" },
  corporate: { name: "Corporate",        dark: false, bg: "#FFFFFF", title: "#0E1116", body: "#566070", accent: "#D72A23" },
};

export function themeFor(tone: Tone): Theme {
  return THEMES[tone] ?? THEMES.tech;
}
