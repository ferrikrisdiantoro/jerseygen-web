import type { AIProvider, GenerateInput } from "./types";

// Freepik AI — Mystic / Imagen style. Adjust endpoint per Freepik's current docs.
// Reference: https://docs.freepik.com/api-reference
//
// This is a skeleton — confirm exact request/response shape on Freepik dashboard
// before going live. Default to KieAI provider unless Freepik is preferred.

const BASE_URL = "https://api.freepik.com";

export const freepikProvider: AIProvider = {
  name: "freepik",
  async generate({ prompt, jerseyImageDataUrl, userPhotoDataUrl }: GenerateInput) {
    const apiKey = process.env.FREEPIK_API_KEY;
    if (!apiKey) throw new Error("FREEPIK_API_KEY belum diisi di environment");

    const refs = [jerseyImageDataUrl];
    if (userPhotoDataUrl) refs.push(userPhotoDataUrl);

    const res = await fetch(`${BASE_URL}/v1/ai/text-to-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-freepik-api-key": apiKey,
      },
      body: JSON.stringify({
        prompt,
        reference_images: refs,
        num_images: 1,
        styling: { style: "photo" },
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Freepik gagal: ${res.status} ${text}`);
    }
    const json = (await res.json()) as {
      data?: Array<{ base64?: string; url?: string }>;
    };
    const first = json.data?.[0];
    const imageUrl = first?.url || (first?.base64 ? `data:image/png;base64,${first.base64}` : "");
    if (!imageUrl) throw new Error("Freepik tidak mengembalikan gambar");
    return { imageUrl };
  },
};
