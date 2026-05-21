import { PATTERN_LABELS, type JerseyState } from "@/types/jersey";

const NAMED_COLORS: [string, [number, number, number]][] = [
  ["black", [10, 10, 10]],
  ["white", [255, 255, 255]],
  ["red", [220, 40, 40]],
  ["royal blue", [29, 78, 216]],
  ["navy", [11, 31, 87]],
  ["sky blue", [14, 165, 233]],
  ["green", [16, 160, 90]],
  ["yellow", [250, 200, 30]],
  ["orange", [255, 91, 4]],
  ["purple", [150, 60, 200]],
  ["pink", [236, 72, 153]],
  ["grey", [120, 120, 120]],
  ["maroon", [124, 45, 18]],
];

function colorName(hex: string): string {
  const m = hex.replace("#", "");
  if (m.length !== 6) return "the chosen color";
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  let best = "the chosen color";
  let bestDist = Infinity;
  for (const [name, [cr, cg, cb]] of NAMED_COLORS) {
    const d = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = name;
    }
  }
  return best;
}

export function buildJerseyPrompt(jersey: JerseyState): string {
  const primary = colorName(jersey.primaryColor);
  const secondary = colorName(jersey.secondaryColor);
  const accent = colorName(jersey.accentColor);

  const patternDesc =
    jersey.patternType === "solid"
      ? `a solid ${primary} body`
      : `a ${primary} body with a ${PATTERN_LABELS[jersey.patternType].toLowerCase()} pattern in ${colorName(jersey.patternColor)}`;

  // Only list graphics that actually exist in the design.
  const details: string[] = [];
  if (jersey.sponsorText.trim())
    details.push(`the sponsor text "${jersey.sponsorText.trim()}" across the chest`);
  if (jersey.playerNumber.trim())
    details.push(`the number "${jersey.playerNumber.trim()}" printed large`);
  if (jersey.playerName.trim())
    details.push(`the name "${jersey.playerName.trim()}" on the upper back`);
  if (jersey.logoDataUrl) details.push(`a small custom logo emblem on the chest`);
  jersey.customTexts
    .filter((t) => t.value.trim())
    .forEach((t) => details.push(`the text "${t.value.trim()}"`));

  const detailSentence = details.length
    ? `The jersey contains ONLY these graphics: ${details.join(", ")} — and nothing else.`
    : `The jersey is completely plain: NO sponsor text, NO number, NO player name, NO logo, NO crest, NO badges, NO graphics whatsoever.`;

  const fit =
    jersey.size === "oversize"
      ? "loose oversize fit"
      : jersey.size === "press"
        ? "tight slim fit pressed against the body"
        : "regular athletic fit";

  const subject = jersey.useFace
    ? "Keep the EXACT same face, identity, hairstyle, and skin tone as the person in the SECOND reference image — do not change their face."
    : "The model is a generic young athletic man with a neutral appearance.";

  return [
    `Photorealistic photo of a person wearing the EXACT custom football/soccer jersey shown in the FIRST reference image.`,
    `The first reference image is a flat 2D design template. Recreate that jersey faithfully as a real worn jersey: ${patternDesc}, ${secondary} sleeves, and ${accent} trim and cuff stripes.`,
    detailSentence,
    `STRICT RULE: Do NOT invent, add, or change anything on the jersey. Do NOT add any real-world brand or competition marks — no Nike, Adidas, Puma, Emirates, Fly Emirates, Premier League, La Liga, club crests, or any sponsor/logo that is not in the reference. Match the reference jersey 1:1.`,
    subject,
    `Jersey fit: ${fit}. Pose: standing, relaxed three-quarter body shot, soft natural daylight, blurred outdoor urban background. Style: high-quality DSLR photograph, sharp focus, ultra-detailed fabric texture, realistic.`,
    `Avoid: distorted or warped text, extra limbs, invented sponsors, brand logos, club badges, plastic-looking skin.`,
  ].join(" ");
}
