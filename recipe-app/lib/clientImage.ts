"use client";

import { UploadedImage } from "./types";

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;

/**
 * Zmenší fotku na rozumnou velikost pro upload/Claude API (screenshoty z
 * Instagramu bývají zbytečně velké) a vrátí ji jako base64 JPEG.
 */
export function resizeImageToBase64(file: File): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas není podporován.");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
        const base64 = dataUrl.split(",")[1];
        resolve({ filename: file.name, contentType: "image/jpeg", dataBase64: base64 });
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Zpracování fotky selhalo."));
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Fotku "${file.name}" se nepodařilo načíst - je poškozená nebo v nepodporovaném formátu.`));
    };

    img.src = objectUrl;
  });
}
