import { NextResponse } from "next/server";
import { getProvider } from "@/lib/ai";
import { buildJerseyPrompt } from "@/lib/prompt";
import type { JerseyState } from "@/types/jersey";

export const runtime = "nodejs";
export const maxDuration = 120;

interface Body {
  jersey: JerseyState;
  jerseyPreviewDataUrl: string;
  // optional overrides from the Settings UI
  provider?: string;
  apiKey?: string;
  model?: string;
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
    // provider & key: request override > env default
    const providerName = body.provider || process.env.AI_PROVIDER || "mock";
    const provider = getProvider(providerName);
    const prompt = buildJerseyPrompt(body.jersey);

    const result = await provider.generate(
      {
        prompt,
        jerseyImageDataUrl: body.jerseyPreviewDataUrl,
        userPhotoDataUrl: body.jersey.useFace ? body.jersey.userPhotoDataUrl : null,
      },
      { apiKey: body.apiKey, model: body.model },
    );

    return NextResponse.json({ imageUrl: result.imageUrl, provider: provider.name });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error";
    console.error("[generate] error:", msg);
    const lower = msg.toLowerCase();
    let code: "quota" | "auth" | "generic" = "generic";
    if (/429|free trial|limit|upgrade|quota|billing|credit|insufficient|exceeded|payment/.test(lower)) {
      code = "quota";
    } else if (/401|403|unauthorized|forbidden|invalid|belum diisi|api key/.test(lower)) {
      code = "auth";
    }
    return NextResponse.json({ error: msg, code }, { status: 500 });
  }
}
