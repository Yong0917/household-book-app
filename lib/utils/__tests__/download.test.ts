import { downloadBlob } from "../download";

type AndroidBridge = {
  downloadFile: jest.Mock<void, [string, string, string]>;
};

type WindowWithBridge = Window & { AndroidBridge?: AndroidBridge };

function setAndroidBridge(bridge: AndroidBridge | undefined) {
  (window as WindowWithBridge).AndroidBridge = bridge;
}

describe("downloadBlob", () => {
  afterEach(() => {
    delete (window as WindowWithBridge).AndroidBridge;
    jest.restoreAllMocks();
  });

  describe("Android WebView 분기 (AndroidBridge.downloadFile 존재)", () => {
    it("AndroidBridge.downloadFile 을 호출해야 한다", async () => {
      const bridge: AndroidBridge = { downloadFile: jest.fn() };
      setAndroidBridge(bridge);

      const blob = new Blob(["hello"], { type: "text/plain" });
      await downloadBlob(blob, "greeting.txt");

      expect(bridge.downloadFile).toHaveBeenCalledTimes(1);
    });

    it("filename, mimeType 인자를 그대로 전달해야 한다", async () => {
      const bridge: AndroidBridge = { downloadFile: jest.fn() };
      setAndroidBridge(bridge);

      const blob = new Blob(["data"], { type: "application/octet-stream" });
      await downloadBlob(blob, "file.bin");

      expect(bridge.downloadFile).toHaveBeenCalledTimes(1);
      const [, filename, mime] = bridge.downloadFile.mock.calls[0];
      expect(filename).toBe("file.bin");
      expect(mime).toBe("application/octet-stream");
    });

    it("Blob 내용을 Base64 문자열로 전달해야 한다 (data: 접두어 없이)", async () => {
      const bridge: AndroidBridge = { downloadFile: jest.fn() };
      setAndroidBridge(bridge);

      // "hello" → Base64 = "aGVsbG8="
      const blob = new Blob(["hello"], { type: "text/plain" });
      await downloadBlob(blob, "greeting.txt");

      expect(bridge.downloadFile).toHaveBeenCalledTimes(1);
      const [base64] = bridge.downloadFile.mock.calls[0];
      expect(base64).toBe("aGVsbG8=");
      expect(base64).not.toMatch(/^data:/);
    });
  });

  describe("PC 웹 분기 (AndroidBridge 미존재)", () => {
    // jsdom 은 URL.createObjectURL/revokeObjectURL 을 정의하지 않으므로 직접 할당
    let createObjectURL: jest.Mock;
    let revokeObjectURL: jest.Mock;

    beforeEach(() => {
      createObjectURL = jest.fn().mockReturnValue("blob:mock-url");
      revokeObjectURL = jest.fn();
      (URL as unknown as { createObjectURL: jest.Mock }).createObjectURL =
        createObjectURL;
      (URL as unknown as { revokeObjectURL: jest.Mock }).revokeObjectURL =
        revokeObjectURL;
    });

    afterEach(() => {
      delete (URL as unknown as { createObjectURL?: jest.Mock }).createObjectURL;
      delete (URL as unknown as { revokeObjectURL?: jest.Mock }).revokeObjectURL;
    });

    it("URL.createObjectURL → a.click → URL.revokeObjectURL 흐름을 수행해야 한다", async () => {
      const clickSpy = jest
        .spyOn(HTMLAnchorElement.prototype, "click")
        .mockImplementation(() => {});

      const blob = new Blob(["x"], { type: "text/plain" });
      await downloadBlob(blob, "out.txt");

      expect(createObjectURL).toHaveBeenCalledWith(blob);
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });

    it("생성된 anchor 에 download 속성과 blob URL 이 세팅되어야 한다", async () => {

      let capturedAnchor: HTMLAnchorElement | null = null;
      const originalCreateElement = document.createElement.bind(document);
      jest
        .spyOn(document, "createElement")
        .mockImplementation(((tagName: string) => {
          const el = originalCreateElement(tagName);
          if (tagName === "a") {
            capturedAnchor = el as HTMLAnchorElement;
            jest
              .spyOn(capturedAnchor, "click")
              .mockImplementation(() => {});
          }
          return el;
        }) as typeof document.createElement);

      const blob = new Blob(["x"], { type: "text/plain" });
      await downloadBlob(blob, "report.csv");

      expect(capturedAnchor).not.toBeNull();
      expect(capturedAnchor!.href).toBe("blob:mock-url");
      expect(capturedAnchor!.download).toBe("report.csv");
    });
  });
});
