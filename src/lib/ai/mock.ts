import type { AIProvider } from "./types";

// Returns a placeholder image — used when AI_PROVIDER=mock or no API key is configured.
// Useful for local dev / UI testing without burning API credit.
export const mockProvider: AIProvider = {
  name: "mock",
  async generate({ jerseyImageDataUrl }) {
    await new Promise((r) => setTimeout(r, 1500));
    return {
      imageUrl: jerseyImageDataUrl,
    };
  },
};
