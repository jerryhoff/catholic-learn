export interface Phrase {
  id: string;
  english: string;
  japanese?: {
    text: string;
    romaji: string;
    reading: string;
  };
  italian?: {
    text: string;
  };
  reference?: string;
  tags: string[];
  politeness: "casual" | "polite" | "formal";
  audio: {
    english?: string;
    japanese?: string;
    italian?: string;
  };
  audioStatus: "pending" | "generating" | "ready" | "error";
  createdAt: string;
  updatedAt: string;
}

export type Language = "english" | "japanese" | "italian";

export interface PlayerSettings {
  languages: Language[];
  languageOrder: Language[];
  pauseBetweenLanguages: number; // seconds
  pauseBetweenPhrases: number; // seconds
  shuffle: boolean;
  continuous: boolean;
  musicEnabled: boolean;
  musicVolume: number; // 0-1
  phraseVolume: number; // 0-1
}
