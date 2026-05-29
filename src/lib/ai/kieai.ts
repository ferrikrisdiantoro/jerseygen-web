import type { AIProvider, GenerateInput, ProviderOptions } from "./types";

// KIE.AI — image edit with reference image(s).
// Docs: https://docs.kie.ai/market/google/nano-banana-edit
//
// PENTING: createTask butuh image_urls berupa URL ASLI (bukan base64 data URI).
// Mengirim base64 langsung -> server 500. Jadi alurnya:
//   0) Upload tiap base64 ke /api/file-base64-upload  -> dapat downloadUrl
//   1) POST /api/v1/jobs/createTask  -> { code, msg, data: { taskId } }
//   2) Poll GET /api/v1/jobs/recordInfo?taskId=...
//        -> { code, data: { state, resultJson, failMsg } }
//      state: "waiting" | "queuing" | "generating" | "success" | "fail"
//      resultJson = STRING berisi JSON { resultUrls: [...] }

const BASE_URL = "https://api.kie.ai";
// File-upload service is on a different host than the jobs API.
const UPLOAD_URL = "https://kieai.redpandaai.co/api/file-base64-upload";
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_MS = 180_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface KieEnvelope<T> {
  code: number;
  msg?: string;
  data?: T;
}

interface CreateTaskData {
  taskId?: string;
}

interface RecordInfoData {
  state?: string;
  resultJson?: string;
  failMsg?: string;
}

interface UploadData {
  downloadUrl?: string;
}

/** Upload a base64 / data-URL image to KieAI storage, return a hosted URL. */
async function uploadBase64(
  apiKey: string,
  dataUrl: string,
  index: number,
): Promise<string> {
  const res = await fetch(UPLOAD_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      base64Data: dataUrl,
      uploadPath: "jerseygen/refs",
      fileName: `ref-${Date.now()}-${index}.png`,
    }),
  });
  if (!res.ok) {
    throw new Error(`Upload gambar ke KieAI gagal: HTTP ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as KieEnvelope<UploadData>;
  const url = json.data?.downloadUrl;
  if (json.code !== 200 || !url) {
    throw new Error(
      `Upload gambar ke KieAI gagal (code ${json.code}): ${json.msg || "no url"}`,
    );
  }
  return url;
}

export const kieaiProvider: AIProvider = {
  name: "kieai",
  async generate(
    { prompt, jerseyImageDataUrl, userPhotoDataUrl }: GenerateInput,
    opts: ProviderOptions,
  ) {
    const apiKey = opts.apiKey || process.env.KIEAI_API_KEY;
    if (!apiKey) throw new Error("API key KieAI belum diisi");
    const model = opts.model || process.env.KIEAI_MODEL || "google/nano-banana-edit";

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };

    // ---- 0. upload reference images -> real URLs ----
    const sources = [jerseyImageDataUrl];
    if (userPhotoDataUrl) sources.push(userPhotoDataUrl);

    let refUrls: string[];
    try {
      refUrls = await Promise.all(
        sources.map((src, i) =>
          // if it's already a public URL, pass through; else upload
          /^https?:\/\//i.test(src) ? Promise.resolve(src) : uploadBase64(apiKey, src, i),
        ),
      );
    } catch (e) {
      throw new Error(
        e instanceof Error ? e.message : "Gagal upload gambar referensi ke KieAI",
      );
    }

    // ---- 1. create task ----
    // nano-banana-pro pakai field "image_input", model lain pakai "image_urls".
    const isPro = model.includes("nano-banana-pro");
    const input: Record<string, unknown> = {
      prompt,
      output_format: "png",
      aspect_ratio: "9:16",
    };
    if (isPro) {
      input.image_input = refUrls;
      input.resolution = "2K";
    } else {
      input.image_urls = refUrls;
    }
    const requestBody = JSON.stringify({ model, input });

    let createJson: KieEnvelope<CreateTaskData> | null = null;
    let lastError = "";
    for (let attempt = 1; attempt <= 2; attempt++) {
      const createRes = await fetch(`${BASE_URL}/api/v1/jobs/createTask`, {
        method: "POST",
        headers,
        body: requestBody,
      });

      if (!createRes.ok) {
        lastError = `HTTP ${createRes.status} ${await createRes.text()}`;
        if (createRes.status >= 500 && attempt === 1) {
          await sleep(2000);
          continue;
        }
        throw new Error(`KieAI createTask gagal: ${lastError}`);
      }

      createJson = (await createRes.json()) as KieEnvelope<CreateTaskData>;
      if (createJson.code === 200) break;

      if (createJson.code >= 500 && attempt === 1) {
        lastError = `code ${createJson.code}: ${createJson.msg}`;
        await sleep(2000);
        createJson = null;
        continue;
      }

      const hint =
        createJson.code === 422 && /model/i.test(createJson.msg || "")
          ? " (model tidak didukung — cek nama model di Setelan)"
          : createJson.code >= 500
            ? " (server KieAI sibuk — coba lagi, atau ganti provider ke Freepik)"
            : "";
      throw new Error(
        `KieAI menolak request (code ${createJson.code}): ${createJson.msg || "no message"}${hint}`,
      );
    }

    if (!createJson) throw new Error(`KieAI gagal setelah retry: ${lastError}`);

    const taskId = createJson.data?.taskId;
    if (!taskId) {
      throw new Error(
        `KieAI tidak mengembalikan taskId. Response: ${JSON.stringify(createJson).slice(0, 300)}`,
      );
    }

    // ---- 2. poll ----
    const start = Date.now();
    while (Date.now() - start < MAX_POLL_MS) {
      await sleep(POLL_INTERVAL_MS);
      const pollRes = await fetch(
        `${BASE_URL}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
        { headers: { Authorization: `Bearer ${apiKey}` } },
      );
      if (!pollRes.ok) continue;
      const pollJson = (await pollRes.json()) as KieEnvelope<RecordInfoData>;
      if (pollJson.code !== 200 || !pollJson.data) continue;

      const state = (pollJson.data.state || "").toLowerCase();

      if (state === "success") {
        let resultUrls: string[] = [];
        if (pollJson.data.resultJson) {
          try {
            const rj = JSON.parse(pollJson.data.resultJson) as {
              resultUrls?: string[];
            };
            resultUrls = rj.resultUrls || [];
          } catch {
            // ignore parse error
          }
        }
        const url = resultUrls[0];
        if (!url) throw new Error("KieAI sukses tapi tidak ada result URL");
        return { imageUrl: url };
      }

      if (state === "fail" || state === "failed") {
        throw new Error(
          `KieAI generate gagal: ${pollJson.data.failMsg || "unknown error"}`,
        );
      }
      // else keep polling
    }
    throw new Error("Timeout menunggu hasil KieAI (>3 menit)");
  },
};
