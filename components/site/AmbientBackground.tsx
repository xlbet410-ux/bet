export default function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* primary orbs */}
      <div
        className="absolute -top-48 left-1/4 h-[36rem] w-[36rem] rounded-full"
        style={{
          background: "radial-gradient(circle, #7B2FBE35 0%, transparent 70%)",
          animation: "orbFloat 11s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-1/2 -right-24 h-[28rem] w-[28rem] rounded-full"
        style={{
          background: "radial-gradient(circle, #9B30FF22 0%, transparent 70%)",
          animation: "orbFloat 14s ease-in-out infinite reverse",
        }}
      />
      <div
        className="absolute -bottom-20 left-8 h-96 w-96 rounded-full"
        style={{
          background: "radial-gradient(circle, #D4AF3718 0%, transparent 70%)",
          animation: "orbFloat 17s ease-in-out infinite",
          animationDelay: "-4s",
        }}
      />
      <div
        className="absolute top-1/4 -left-16 h-72 w-72 rounded-full"
        style={{
          background: "radial-gradient(circle, #4A0E8F28 0%, transparent 70%)",
          animation: "orbFloat 13s ease-in-out infinite",
          animationDelay: "-7s",
        }}
      />
      <div
        className="absolute bottom-1/3 right-1/4 h-56 w-56 rounded-full"
        style={{
          background: "radial-gradient(circle, #D4AF3712 0%, transparent 70%)",
          animation: "orbFloat 9s ease-in-out infinite reverse",
          animationDelay: "-2s",
        }}
      />

      {/* fine dot grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(circle, #D4AF37 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* very subtle top-to-bottom vignette to give depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 60% at 50% 0%, rgba(123,47,190,0.08) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}
