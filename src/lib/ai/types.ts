export interface GenerateInput {
  prompt: string;
  jerseyImageDataUrl: string;
  userPhotoDataUrl?: string | null;
}

/** Per-request overrides — API key & model can come from the Settings UI. */
export interface ProviderOptions {
  apiKey?: string;
  model?: string;
}

export interface AIProvider {
  name: string;
  generate: (
    input: GenerateInput,
    opts: ProviderOptions,
  ) => Promise<{ imageUrl: string }>;
}
