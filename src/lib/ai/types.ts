export interface GenerateInput {
  prompt: string;
  jerseyImageDataUrl: string;
  userPhotoDataUrl?: string | null;
}

export interface AIProvider {
  name: string;
  generate: (input: GenerateInput) => Promise<{ imageUrl: string }>;
}
