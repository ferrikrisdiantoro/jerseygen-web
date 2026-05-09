import { NextResponse } from "next/server";
import { getProvider } from "@/lib/ai";
import { buildJerseyPrompt } from "@/lib/prompt";
import type { JerseyState } from "@/types/jersey";

export const runtime = "nodejs";
export const maxDuration = 120;

interface Body {
  jersey: JerseyState;
  jerseyPreviewDataUrl: string;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.jersey || !body.jerseyPreviewDataUrl) {
    return NextResponse.json({ error: "Data jersey tidak lengkap" }, { status: 400 });
  }
  if (body.jersey.useFace && !body.jersey.userPhotoDataUrl) {
    return NextResponse.json(
      { error: "Toggle 'pakai muka sendiri' aktif tapi belum upload foto" },
      { status: 400 },
    );
  }

  try {
    const provider = getProvider();
    const prompt = buildJerseyPrompt(body.jersey);
    const result = await provider.generate({
      prompt,
      jerseyImageDataUrl: body.jerseyPreviewDataUrl,
      userPhotoDataUrl: body.jersey.useFace ? body.jersey.userPhotoDataUrl : null,
    });
    return NextResponse.json({ imageUrl: result.imageUrl, provider: provider.name });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error";
    console.error("[generate] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
