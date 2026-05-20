import type { AIProvider, GenerateInput, ProviderOptions } from "./types";

// KieAI Playground API — image edit with reference image(s).
// Docs: https://docs.kie.ai/
//
// Flow:
// 1) POST /api/v1/playground/createTask  → { taskId }
// 2) Poll GET /api/v1/playground/recordInfo?taskId=...  until status === "success"
// 3) Read result image URL from the response.

const BASE_URL = "https://api.kie.ai";
const POLL_INTERVAL_MS = 2500;
const MAX_POLL_MS = 120_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const kieaiProvider: AIProvider = {
  name: "kieai",
  async generate(
    { prompt, jerseyImageDataUrl, userPhotoDataUrl }: GenerateInput,
    opts: ProviderOptions,
  ) {
    const apiKey = opts.apiKey || process.env.KIEAI_API_KEY;
    if (!apiKey) throw new Error("API key KieAI belum diisi");
    const model = opts.model || process.env.KIEAI_MODEL || "google/nano-banana-edit";

    const refs = [jerseyImageDataUrl];
    if (userPhotoDataUrl) refs.push(userPhotoDataUrl);

    const createRes = await fetch(`${BASE_URL}/api/v1/playground/createTask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: { prompt, image_urls: refs, output_format: "png" },
      }),
    });

    if (!createRes.ok) {
      const text = await createRes.text();
      throw new Error(`KieAI createTask gagal: ${createRes.status} ${text}`);
    }
    const createJson = (await createRes.json()) as {
      data?: { taskId?: string };
      taskId?: string;
    };
    const taskId = createJson.data?.taskId || createJson.taskId;
    if (!taskId) throw new Error("KieAI tidak mengembalikan taskId");

    const start = Date.now();
    while (Date.now() - start < MAX_POLL_MS) {
      await sleep(POLL_INTERVAL_MS);
      const pollRes = await fetch(
        `${BASE_URL}/api/v1/playground/recordInfo?taskId=${encodeURIComponent(taskId)}`,
        { headers: { Authorization: `Bearer ${apiKey}` } },
      );
      if (!pollRes.ok) continue;
      const pollJson = (await pollRes.json()) as {
        data?: {
          status?: string;
          state?: string;
          resultUrls?: string[];
          resultJson?: { resultUrls?: string[] };
        };
      };
      const data = pollJson.data;
      const status = (data?.status || data?.state || "").toLowerCase();
      if (status === "success" || status === "succeeded") {
        const url = data?.resultUrls?.[0] || data?.resultJson?.resultUrls?.[0];
        if (!url) throw new Error("KieAI sukses tapi tidak ada result URL");
        return { imageUrl: url };
      }
      if (status === "failed" || status === "fail") {
        throw new Error("KieAI generate gagal");
      }
    }
    throw new Error("Timeout menunggu hasil KieAI");
  },
};
