import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { isFirebaseConfigured, storage } from "../config/firebase";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 640;
const JPEG_QUALITY = 0.82;

function requireStorage() {
  if (!isFirebaseConfigured || !storage) {
    throw new Error("Firebase Storage is not configured. Check VITE_FIREBASE_STORAGE_BUCKET.");
  }
}

function validateImageFile(file) {
  if (!file) {
    return;
  }

  if (!file.type?.startsWith("image/")) {
    throw new Error("Student photo must be an image file.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Student photo must be smaller than 8 MB.");
  }
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read the selected student photo."));
    };

    image.src = url;
  });
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("Could not optimize the selected student photo."));
      },
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
}

async function compressStudentPhoto(file) {
  validateImageFile(file);

  const image = await loadImage(file);
  const largestSide = Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height);
  const scale = largestSide > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / largestSide : 1;
  const width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
  const height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;

  if (!context) {
    throw new Error("Could not optimize the selected student photo.");
  }

  context.drawImage(image, 0, 0, width, height);

  return canvasToBlob(canvas);
}

function getSafeFileName(file) {
  const baseName = String(file?.name || "student-photo")
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return `${Date.now()}-${baseName || "student-photo"}.jpg`;
}

export async function uploadStudentPhoto(file, studentId) {
  if (!file) {
    return "";
  }

  requireStorage();

  const normalizedStudentId = String(studentId || "").trim();
  if (!normalizedStudentId) {
    throw new Error("Student ID is required before uploading a photo.");
  }

  const optimizedPhoto = await compressStudentPhoto(file);
  const photoRef = ref(storage, `student-photos/${normalizedStudentId}/${getSafeFileName(file)}`);

  const uploadResult = await uploadBytes(photoRef, optimizedPhoto, {
    cacheControl: "public,max-age=31536000",
    contentType: "image/jpeg",
  });

  const downloadUrl = await getDownloadURL(uploadResult.ref);

  if (!downloadUrl) {
    throw new Error("Student photo uploaded, but Firebase did not return a download URL.");
  }

  return downloadUrl;
}
