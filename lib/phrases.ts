import { Phrase } from "./types";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const PHRASES_FILE = path.join(DATA_DIR, "phrases.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PHRASES_FILE)) {
    fs.writeFileSync(PHRASES_FILE, JSON.stringify([], null, 2));
  }
}

export function getAllPhrases(): Phrase[] {
  ensureDataDir();
  const raw = fs.readFileSync(PHRASES_FILE, "utf-8");
  return JSON.parse(raw);
}

export function getPhraseById(id: string): Phrase | undefined {
  return getAllPhrases().find((p) => p.id === id);
}

export function createPhrase(
  phrase: Omit<Phrase, "id" | "createdAt" | "updatedAt" | "audioStatus" | "audio">
): Phrase {
  const phrases = getAllPhrases();
  const newPhrase: Phrase = {
    ...phrase,
    id: crypto.randomUUID(),
    audio: {},
    audioStatus: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  phrases.push(newPhrase);
  savePhrases(phrases);
  return newPhrase;
}

export function updatePhrase(id: string, updates: Partial<Phrase>): Phrase | null {
  const phrases = getAllPhrases();
  const index = phrases.findIndex((p) => p.id === id);
  if (index === -1) return null;

  phrases[index] = {
    ...phrases[index],
    ...updates,
    id, // prevent id overwrite
    updatedAt: new Date().toISOString(),
  };
  savePhrases(phrases);
  return phrases[index];
}

export function deletePhrase(id: string): boolean {
  const phrases = getAllPhrases();
  const filtered = phrases.filter((p) => p.id !== id);
  if (filtered.length === phrases.length) return false;
  savePhrases(filtered);
  return true;
}

export function getAllTags(): string[] {
  const phrases = getAllPhrases();
  const tagSet = new Set<string>();
  phrases.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

function savePhrases(phrases: Phrase[]) {
  ensureDataDir();
  fs.writeFileSync(PHRASES_FILE, JSON.stringify(phrases, null, 2));
}
