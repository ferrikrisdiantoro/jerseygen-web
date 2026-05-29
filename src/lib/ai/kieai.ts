import type { AIProvider, GenerateInput, ProviderOptions } from "./types";

// KIE.AI — image edit with reference image(s).
// Docs: https://docs.kie.ai/market/google/nano-banana-edit
//
// Async pattern:
//   1) POST /api/v1/jobs/createTask  → { code, msg, data: { taskId } }
//   2) Poll GET /api/v1/jobs/recordInfo?taskId=...
//        → { code, data: { state, resultJson, failMsg } }
//      state: "waiting" | "queuing" | "generating" | "success" | "fail"
//      resultJson is a STRING containing JSON { resultUrls: [...] }

const BASE_URL = "https://api.kie.ai";
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
  taskId?: string;
  state?: string;
  resultJson?: string;
  failCode?: number;
  failMsg?: string;
  progress?: number;
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

    const refs = [jerseyImageDataUrl];
    if (userPhotoDataUrl) refs.push(userPhotoDataUrl);

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };

    // ---- 1. create task (with one retry on 5xx — KieAI server hiccups) ----
    const requestBody = JSON.stringify({
      model,
      input: {
        prompt,
        image_urls: refs,
        output_format: "png",
        image_size: "9:16",
      },
    });

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

      // KieAI envelope error (code 4xx/5xx in body)
      if (createJson.code >= 500 && attempt === 1) {
        lastError = `code ${createJson.code}: ${createJson.msg}`;
        await sleep(2000);
        createJson = null;
        continue;
      }

      const hint =
        createJson.code === 422 && /model/i.test(createJson.msg || "")
          ? " (cek model di Setelan → coba 'google/nano-banana-2')"
          : createJson.code >= 500
            ? " (server KieAI sibuk — coba lagi beberapa detik, atau ganti provider ke Freepik)"
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
        // resultJson is a JSON STRING — parse it
        let resultUrls: string[] = [];
        if (pollJson.data.resultJson) {
          try {
            const rj = JSON.parse(pollJson.data.resultJson) as {
              resultUrls?: string[];
            };
            resultUrls = rj.resultUrls || [];
          } catch {
            // fall through
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
      // else: keep polling ("waiting" / "queuing" / "generating")
    }
    throw new Error("Timeout menunggu hasil KieAI (>3 menit)");
  },
};
