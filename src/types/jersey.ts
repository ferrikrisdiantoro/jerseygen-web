export type JerseyDesign = "cross" | "tackle" | "city" | "pool" | "nouCamp";

export type JerseySize = "oversize" | "regular" | "press";

export interface JerseyState {
  design: JerseyDesign;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  playerName: string;
  playerNumber: string;
  sponsorText: string;
  logoDataUrl: string | null;
  size: JerseySize;
  useFace: boolean;
  userPhotoDataUrl: string | null;
}

export interface GenerateRequest {
  jersey: JerseyState;
  jerseyPreviewDataUrl: string;
}

export interface GenerateResponse {
  imageUrl: string;
}

export const DESIGN_LABELS: Record<JerseyDesign, string> = {
  cross: "Cross",
  tackle: "Tackle",
  city: "City",
  pool: "Pool",
  nouCamp: "Nou Camp",
};

export const SIZE_LABELS: Record<JerseySize, string> = {
  oversize: "Oversize",
  regular: "Regular",
  press: "Press Body",
};
