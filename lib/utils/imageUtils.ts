/**
 * 이미지를 canvas API 로 리사이즈 + 압축. WebP 우선, 미지원/실패 시 JPEG 폴백.
 *
 * @param file    원본 이미지 파일
 * @param maxDim  최대 너비/높이 (px), 기본 1200
 * @param quality 압축 품질 (0~1), 기본 0.8
 */
export function compressImage(
  file: File,
  maxDim = 1200,
  quality = 0.8,
): Promise<{ blob: Blob; mime: "image/webp" | "image/jpeg"; ext: "webp" | "jpg" }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width >= height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 컨텍스트를 가져올 수 없습니다."));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // WebP 시도 → 실패 시 JPEG 폴백
      canvas.toBlob(
        (webpBlob) => {
          if (webpBlob) {
            resolve({ blob: webpBlob, mime: "image/webp", ext: "webp" });
            return;
          }
          canvas.toBlob(
            (jpegBlob) => {
              if (!jpegBlob) {
                reject(new Error("이미지 변환에 실패했습니다."));
                return;
              }
              resolve({ blob: jpegBlob, mime: "image/jpeg", ext: "jpg" });
            },
            "image/jpeg",
            quality,
          );
        },
        "image/webp",
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("이미지를 불러올 수 없습니다."));
    };

    img.src = objectUrl;
  });
}

/** Storage URL에서 버킷 내 경로(path)를 추출 */
export function extractStoragePath(url: string, bucket: string): string {
  const marker = `/${bucket}/`;
  const idx = url.indexOf(marker);
  return idx !== -1 ? url.slice(idx + marker.length) : "";
}
