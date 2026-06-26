/** Renaiss.xyz card image CDN (Vercel Blob storage used by renaiss.xyz) */
export const RENAISS_IMAGE_CDN =
  "https://8nothtoc5ds7a0x3.public.blob.vercel-storage.com";

export function renaissGradedCardImage(
  certificationNumber: string,
  variant: "nft_image" | "nft_image_silver" | "nft_image_diamond" | "nft_image_golden" = "nft_image",
): string {
  return `${RENAISS_IMAGE_CDN}/graded-cards-renders/${certificationNumber}/${variant}.jpg`;
}

/** Real graded-card renders sourced from renaiss.xyz marketplace / homepage */
export const RENAISS_CARD_IMAGES = {
  pikachu: renaissGradedCardImage("PSA104881731"),
  blastoise: renaissGradedCardImage("PSA70570865"),
  hooh: renaissGradedCardImage("PSA79604612", "nft_image_diamond"),
  charizard: renaissGradedCardImage("PSA74736597"),
  luffy: renaissGradedCardImage("BGS0017054288", "nft_image_diamond"),
  mewtwo: renaissGradedCardImage("PSA98784241", "nft_image_golden"),
  rayquaza: renaissGradedCardImage("PSA127811223"),
  gengar: renaissGradedCardImage("PSA112732317", "nft_image_diamond"),
  eevee: renaissGradedCardImage("PSA109339927"),
  playingInTheSeaPikachu: "/nft_image_golden.webp",
  acerolasPremonition: "/card2.webp",
} as const;
