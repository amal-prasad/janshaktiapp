import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import type { ImageRef } from "@/lib/types";

const MAX_BYTES = 15 * 1024 * 1024;

function readNaturalSize(file: File): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("फ़ोटो पढ़ी नहीं जा सकी।"));
    };
    img.src = url;
  });
}

export async function uploadImage(editionId: string, file: File): Promise<ImageRef> {
  if (!file.type.startsWith("image/")) {
    throw new Error("केवल फ़ोटो फ़ाइलें (image) स्वीकार्य हैं।");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("फ़ोटो का आकार 15 MB से अधिक नहीं होना चाहिए।");
  }

  const { w, h } = await readNaturalSize(file);

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `editions/${editionId}/${crypto.randomUUID()}-${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return {
    url,
    storagePath: path,
    naturalW: w,
    naturalH: h,
    focalX: 0.5,
    focalY: 0.5,
  };
}
