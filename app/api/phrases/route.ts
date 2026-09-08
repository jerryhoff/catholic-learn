import { NextResponse } from "next/server";
import { getAllPhrases } from "@/lib/phrases";

export async function GET() {
  const phrases = getAllPhrases();
  return NextResponse.json(phrases);
}
