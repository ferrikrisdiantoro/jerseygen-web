import { DESIGN_LABELS, type JerseyState } from "@/types/jersey";

export function buildJerseyPrompt(jersey: JerseyState): string {
  const designName = DESIGN_LABELS[jersey.design];
  const fitDescription =
    jersey.size === "oversize"
      ? "loose oversize fit, baggy silhouette around the torso"
      : jersey.size === "press"
        ? "slim athletic fit, fabric pressed close to the body"
        : "regular athletic fit";

  const facePart = jersey.useFace
    ? "use the face from the second reference image as the player's face, preserve identity, hair, and skin tone"
    : "a young South-East Asian male model with athletic build, casual hairstyle, natural skin tone, no specific identity";

  return [
    `Photorealistic full-body portrait of a person wearing a custom ${designName} football/soccer jersey.`,
    `The jersey design follows the first reference image precisely — same colors, stripes, sponsor text, number, and logo placement.`,
    `Jersey fit: ${fitDescription}.`,
    `Subject: ${facePart}.`,
    `Setting: outdoor urban background, soft natural light, shallow depth of field.`,
    `Pose: standing, three-quarter body, arms relaxed, looking slightly to the side.`,
    `Style: high-quality DSLR photo, sharp focus, magazine editorial look, 4k, ultra-detailed fabric texture.`,
    `Negative: no distorted text, no extra limbs, no logo distortion, no warped sponsor letters, no plastic skin.`,
  ].join(" ");
}
