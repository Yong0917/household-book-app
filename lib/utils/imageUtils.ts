/**
 * 이미지를 canvas API를 이용해 리사이즈 + JPEG 압축
 * @param file    원본 이미지 파일
 * @param maxDim  최대 너비/높이 (px), 기본 1200
 * @param quality JPEG 품질 (0~1), 기본 0.75
 */
export function compressImage(
  file: File,
  maxDim = 1200,
  quality = 0.75,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
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
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("이미지 변환에 실패했습니다."));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
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
