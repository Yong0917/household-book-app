import Image from "next/image";

// Android `activity_main.xml`의 loadingOverlay 디자인을 픽셀 단위로 매칭.
// orb/shimmer 색은 splash_orb_warm.xml, splash_orb_cool.xml, splash_shimmer_*.xml에서 그대로 가져옴.
export default function AppSplash() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#FAF8F3" }}
    >
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          top: "-64px",
          right: "-64px",
          width: "72vw",
          height: "72vw",
          background:
            "radial-gradient(circle, rgba(196,152,90,0.22) 0%, rgba(196,152,90,0) 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          bottom: "-32px",
          left: "-32px",
          width: "56vw",
          height: "56vw",
          background:
            "radial-gradient(circle, rgba(110,150,170,0.14) 0%, rgba(110,150,170,0) 70%)",
        }}
      />

      <div className="relative flex flex-col items-center">
        <Image
          src="/icon-512.png"
          alt=""
          width={96}
          height={96}
          priority
          style={{
            width: 96,
            height: 96,
            filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.08))",
          }}
        />
        <h1
          className="mt-7 text-[26px] font-bold leading-none"
          style={{
            fontFamily: "serif",
            color: "#1C1714",
            letterSpacing: "-0.01em",
          }}
        >
          머니로그
        </h1>
        <p
          className="mt-2 text-[11px] uppercase"
          style={{
            color: "#B8A898",
            letterSpacing: "0.18em",
          }}
        >
          나의 하루 기록
        </p>
      </div>

      <div
        className="absolute overflow-hidden"
        style={{
          bottom: 68,
          width: 52,
          height: 2,
          borderRadius: 999,
          backgroundColor: "rgba(180,155,120,0.22)",
        }}
      >
        <div
          className="h-full"
          style={{
            width: 18,
            borderRadius: 999,
            background:
              "linear-gradient(90deg, rgba(160,120,70,0) 0%, rgba(160,120,70,0.75) 50%, rgba(160,120,70,0) 100%)",
            animation: "splash-shimmer 1.2s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
}
