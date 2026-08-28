import type { ReactNode } from "react";
import { FaArrowRightLong } from "react-icons/fa6";

export default function SectionHeading({
  eyebrow,
  title,
  barFrom = "#D4AF37",
  barTo = "#F5C842",
  eyebrowColor = "#D4AF37",
  action,
}: {
  eyebrow: string;
  title: ReactNode;
  barFrom?: string;
  barTo?: string;
  eyebrowColor?: string;
  action?: { label: string; href?: string };
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4 sm:mb-8">
      <div className="flex items-center gap-4">
        {/* accent bar with glow */}
        <div
          className="h-9 w-1.5 shrink-0 rounded-full sm:h-12"
          style={{
            background: `linear-gradient(to bottom, ${barFrom}, ${barTo})`,
            boxShadow: `0 0 14px ${barFrom}70`,
          }}
        />
        <div>
          {eyebrow && (
            <p
              className="mb-0.5 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.3em]"
              style={{ color: eyebrowColor }}
            >
              <span style={{ color: eyebrowColor }}>◆</span>
              {eyebrow}
            </p>
          )}
          <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h2>
        </div>
      </div>

      {action && (
        <a
          href={action.href ?? "#"}
          className="group flex shrink-0 items-center gap-1.5 rounded-full border border-[#D4AF37]/30 px-4 py-1.5 text-xs font-semibold text-[#D4AF37] transition-all hover:border-[#D4AF37]/70 hover:bg-[#D4AF37]/10"
        >
          {action.label}
          <FaArrowRightLong className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
        </a>
      )}
    </div>
  );
}
