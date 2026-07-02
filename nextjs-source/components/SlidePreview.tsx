import type { Slide, Theme } from "@/types/presentation";

/** A single 16:9 slide, scaled via CSS container query units (cqw). */
export function SlidePreview({
  slide,
  theme,
  total,
  brand = "Presa",
}: {
  slide: Slide;
  theme: Theme;
  total: number;
  brand?: string;
}) {
  const layout = slide.layout ?? (slide.slideNumber === 1 ? "title" : "content");
  const onDark = layout === "cta" ? true : theme.dark;
  const bg = layout === "cta" ? (theme.dark ? theme.bg : theme.title) : theme.bg;

  return (
    <div
      style={{ containerType: "inline-size", background: bg }}
      className="relative aspect-[16/9] w-full overflow-hidden"
    >
      <div className="absolute left-0 top-0 h-full" style={{ width: "1.4cqw", background: theme.accent }} />
      <div className="absolute inset-0 flex flex-col" style={{ padding: "7.2cqw 8cqw", justifyContent: layout === "content" ? "flex-start" : "center" }}>
        <div className="flex items-center gap-[1.2cqw] font-semibold uppercase" style={{ fontSize: "1.5cqw", letterSpacing: ".14em", color: theme.accent }}>
          <span style={{ width: "4cqw", height: ".25cqw", background: theme.accent }} />
          {layout === "title" ? "PRESENTATION" : layout === "cta" ? "LET\u2019S TALK" : String(slide.slideNumber).padStart(2, "0")}
        </div>
        <h2 className="font-extrabold tracking-tight" style={{ fontSize: layout === "content" ? "4.4cqw" : "6cqw", marginTop: "2.4cqw", lineHeight: 1.05, color: onDark ? "#fff" : theme.title, maxWidth: "86%" }}>
          {slide.title}
        </h2>
        {slide.subtitle && layout === "title" && (
          <p style={{ fontSize: "2.7cqw", marginTop: "2.4cqw", color: theme.body, maxWidth: "70%", lineHeight: 1.4 }}>{slide.subtitle}</p>
        )}
        {slide.bullets.length > 0 && layout !== "title" && (
          <ul className="m-0 flex list-none flex-col p-0" style={{ gap: "2.4cqw", marginTop: "3.4cqw", maxWidth: "88%" }}>
            {slide.bullets.map((b, i) => (
              <li key={i} className="flex items-start" style={{ gap: "1.8cqw", fontSize: "2.4cqw", lineHeight: 1.34, color: onDark ? "rgba(255,255,255,.85)" : theme.body }}>
                <span style={{ flex: "0 0 auto", marginTop: ".9cqw", width: "1.3cqw", height: "1.3cqw", borderRadius: ".3cqw", background: theme.accent }} />
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="absolute flex items-center justify-between" style={{ left: "8cqw", right: "8cqw", bottom: "4cqw", fontSize: "1.35cqw", color: onDark ? "rgba(255,255,255,.5)" : "#9AA2AE" }}>
        <span className="flex items-center gap-[1cqw] font-bold" style={{ color: onDark ? "#fff" : theme.title }}>
          <span style={{ width: "2.4cqw", height: "2.4cqw", borderRadius: ".6cqw", background: theme.accent }} />
          {brand}
        </span>
        <span className="font-mono">{String(slide.slideNumber).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
      </div>
    </div>
  );
}
