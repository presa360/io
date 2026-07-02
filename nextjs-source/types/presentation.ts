// Shared types for the Presa presentation pipeline.

export type Tone =
  | "tech"
  | "modern"
  | "strict"
  | "minimal"
  | "premium"
  | "corporate";

export type Language = "ru" | "en";

export interface GenerateRequest {
  companyName: string;
  industry: string;
  presentationGoal: string;
  targetAudience: string;
  slideCount: number;
  tone: Tone;
  language: Language;
  additionalInfo?: string;
}

export interface Slide {
  slideNumber: number;
  title: string;
  bullets: string[];
  speakerNotes: string;
  visualSuggestion: string;
  /** layout hint used by the PPTX renderer */
  layout?: "title" | "content" | "cta";
  subtitle?: string;
}

export interface Presentation {
  presentationTitle: string;
  presentationSubtitle: string;
  slides: Slide[];
}

/** Visual theme shared by the preview and the PPTX exporter. */
export interface Theme {
  name: string;
  dark: boolean;
  bg: string;
  title: string;
  body: string;
  accent: string;
}
