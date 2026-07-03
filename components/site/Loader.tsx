import Image from "next/image";

export default function Loader({ done }: { done: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A0612] transition-all duration-700 ease-in-out ${
        done ? "pointer-events-none opacity-0 scale-105 blur-sm" : "opacity-100 scale-100"
      }`}
    >
      {/* outer ambient ring */}
      <div
        className="absolute h-[420px] w-[420px] rounded-full"
        style={{
          background: "radial-gradient(circle, #7B2FBE28 0%, transparent 65%)",
          animation: "orbFloat 4s ease-in-out infinite",
        }}
      />
      {/* inner glow pulse */}
      <div className="absolute h-64 w-64 animate-[pulseGlow_2s_ease-in-out_infinite] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, #9B30FF55 0%, transparent 70%)" }} />

      {/* logo — entrance via logoReveal keyframe */}
      <div
        className="relative z-10"
        style={{
          animation: "logoReveal 1s cubic-bezier(0.34, 1.36, 0.64, 1) 0.15s both",
          filter: "drop-shadow(0 0 48px #9B30FFaa) drop-shadow(0 0 20px #D4AF3755)",
        }}
      >
        <Image
          src="/logo.png"
          alt="2XLbet Casino"
          width={320}
          height={320}
          priority
          className="h-40 w-auto"
        />
      </div>

      {/* tagline */}
      <p
        className="z-10 mt-6 text-[11px] font-bold tracking-[0.45em] uppercase text-[#7B5EA7]"
        style={{ animation: "fadeIn 0.6s ease 0.9s both" }}
      >
        Premium Casino Experience
      </p>

      {/* progress bar */}
      <div
        className="relative z-10 mt-8 h-1 w-52 overflow-hidden rounded-full"
        style={{ background: "rgba(255,255,255,0.07)", animation: "fadeIn 0.4s ease 0.7s both" }}
      >
        <div
          className="absolute left-0 top-0 h-full w-1/2 rounded-full"
          style={{
            background: "linear-gradient(to right, #7B2FBE, #D4AF37, #F5C842)",
            animation: "loadbar 1.3s ease-in-out infinite",
            boxShadow: "0 0 12px #D4AF3788",
          }}
        />
      </div>
    </div>
  );
}
