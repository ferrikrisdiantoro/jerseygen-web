import type { AIProvider, GenerateInput, ProviderOptions } from "./types";

// Freepik / Magnific AI — image edit with reference images.
// Docs: https://docs.freepik.com  (now hosted at docs.magnific.com)
//
// Verified models (async task pattern: create -> poll):
//  - "seedream-v4-5-edit"  : edit pakai 1-5 reference image + prompt (DEFAULT, terverifikasi)
//  - "nano-banana-pro"     : Google Gemini, paling jago "orang + baju -> orang pakai baju"
//  - "nano-banana"         : versi standar nano banana
//
// Flow:
//  1) POST {BASE}/v1/ai/text-to-image/{model}  -> { data: { task_id, status, generated } }
//  2) Poll GET {BASE}/v1/ai/text-to-image/{model}/{task_id} sampai status COMPLETED
//  3) Ambil URL gambar dari data.generated[0]

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_MS = 120_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface FreepikTask {
  data?: {
    task_id?: string;
    status?: string;
    generated?: string[];
  };
}

export const freepikProvider: AIProvider = {
  name: "freepik",
  async generate(
    { prompt, jerseyImageDataUrl, userPhotoDataUrl }: GenerateInput,
    opts: ProviderOptions,
  ) {
    const apiKey = opts.apiKey || process.env.FREEPIK_API_KEY;
    if (!apiKey) throw new Error("API key Freepik belum diisi");

    const base = process.env.FREEPIK_BASE_URL || "https://api.freepik.com";
    const model = opts.model || process.env.FREEPIK_MODEL || "seedream-v4-5-edit";
    const endpoint = `${base}/v1/ai/text-to-image/${model}`;

    const refs = [jerseyImageDataUrl];
    if (userPhotoDataUrl) refs.push(userPhotoDataUrl);

    // Freepik & Magnific keys — kirim dua-duanya supaya kompatibel kedua host.
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-freepik-api-key": apiKey,
      "x-magnific-api-key": apiKey,
    };

    // nano-banana memakai field "image_urls", seedream memakai "reference_images".
    // aspect_ratio 9:16 (portrait) sesuai permintaan klien.
    const isNanoBanana = model.includes("nano-banana");
    const body = isNanoBanana
      ? { prompt, image_urls: refs, aspect_ratio: "portrait_9_16" }
      : { prompt, reference_images: refs, aspect_ratio: "portrait_9_16" };

    const createRes = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!createRes.ok) {
      const t = await createRes.text();
      throw new Error(`Freepik create gagal: ${createRes.status} ${t}`);
    }

    const created = (await createRes.json()) as FreepikTask;
    if (created.data?.generated?.length) {
      return { imageUrl: created.data.generated[0] };
    }
    const taskId = created.data?.task_id;
    if (!taskId) throw new Error("Freepik tidak mengembalikan task_id");

    const start = Date.now();
    while (Date.now() - start < MAX_POLL_MS) {
      await sleep(POLL_INTERVAL_MS);
      const pollRes = await fetch(`${endpoint}/${taskId}`, { headers });
      if (!pollRes.ok) continue;
      const poll = (await pollRes.json()) as FreepikTask;
      const status = poll.data?.status;
      if (status === "COMPLETED" && poll.data?.generated?.length) {
        return { imageUrl: poll.data.generated[0] };
      }
      if (status === "FAILED") throw new Error("Freepik generate gagal (FAILED)");
    }
    throw new Error("Timeout menunggu hasil Freepik");
  },
};
