/**
 * Blob 파일 다운로드 유틸
 * - PC 웹: <a download> 방식
 * - Android WebView: AndroidBridge.downloadFile() 방식 (Base64 전달)
 */
export async function downloadBlob(blob: Blob, filename: string): Promise<void> {
  // Android WebView 환경 감지
  const androidBridge = (window as unknown as { AndroidBridge?: { downloadFile?: (base64: string, filename: string, mimeType: string) => void } }).AndroidBridge;

  if (androidBridge?.downloadFile) {
    // Base64로 변환 후 AndroidBridge를 통해 저장
    const base64 = await blobToBase64(blob);
    androidBridge.downloadFile(base64, filename, blob.type);
  } else {
    // PC 웹: Blob URL + <a download> 방식
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // "data:mimetype;base64," 접두어 제거
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
