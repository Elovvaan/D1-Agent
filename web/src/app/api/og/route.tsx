import { ImageResponse } from "next/og";

export const runtime = "edge";

const size = { width: 1200, height: 630 };

function clean(value: string | null, fallback: string) {
  const text = (value ?? "").trim();
  return text ? text.slice(0, 120) : fallback;
}

function themeValues(theme: string) {
  if (theme === "locked-in") return { primary: "#8CFF00", secondary: "#F2C200", bg1: "#020402", bg2: "#081106", chip: "LOCKED IN" };
  if (theme === "sports") return { primary: "#F2C200", secondary: "#8CFF00", bg1: "#061331", bg2: "#0A1A3F", chip: "MYD1 SPORTS" };
  if (theme === "schools") return { primary: "#F2C200", secondary: "#AFC3FF", bg1: "#061331", bg2: "#122B66", chip: "SCHOOLS" };
  if (theme === "search") return { primary: "#8CFF00", secondary: "#F2C200", bg1: "#061331", bg2: "#10172A", chip: "SEARCH" };
  return { primary: "#F2C200", secondary: "#8CFF00", bg1: "#061331", bg2: "#1B3FA0", chip: "MYD1" };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const title = clean(url.searchParams.get("title"), "MYD1 SPORTS");
  const subtitle = clean(url.searchParams.get("subtitle"), "The Athlete Profile. The Public Sports Network.");
  const theme = url.searchParams.get("theme") ?? "home";
  const colors = themeValues(theme);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", overflow: "hidden", background: `linear-gradient(135deg, ${colors.bg1} 0%, #000 48%, ${colors.bg2} 100%)`, color: "white", fontFamily: "Arial, sans-serif" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 18% 42%, ${colors.primary}30 0, transparent 28%), radial-gradient(circle at 78% 26%, ${colors.secondary}24 0, transparent 24%)` }} />
        <div style={{ position: "absolute", left: -120, bottom: -160, width: 520, height: 520, borderRadius: 999, background: `${colors.primary}22`, filter: "blur(12px)" }} />
        <div style={{ position: "absolute", right: -90, top: -110, width: 430, height: 430, borderRadius: 999, background: `${colors.secondary}1f`, filter: "blur(10px)" }} />
        <div style={{ position: "relative", width: "100%", height: "100%", padding: 64, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
              <div style={{ width: 88, height: 88, borderRadius: 24, background: colors.primary, color: "#061331", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 900, boxShadow: `0 24px 70px ${colors.primary}33` }}>D1</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 46, fontWeight: 900, letterSpacing: -2 }}>MYD1</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#C8D6FF" }}>D1 Agent Platform</div>
              </div>
            </div>
            <div style={{ color: colors.primary, fontSize: 22, fontWeight: 900 }}>myd1sports.pro</div>
          </div>
          <div style={{ maxWidth: 920, display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "inline-flex", alignSelf: "flex-start", border: `2px solid ${colors.primary}`, color: colors.primary, borderRadius: 999, padding: "10px 18px", fontSize: 20, fontWeight: 900, letterSpacing: 4 }}>{colors.chip}</div>
            <div style={{ fontSize: 78, lineHeight: 0.9, fontWeight: 900, letterSpacing: -4, textTransform: "uppercase" }}>{title}</div>
            <div style={{ maxWidth: 820, fontSize: 27, lineHeight: 1.3, fontWeight: 800, color: "#DCE7FF" }}>{subtitle}</div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {["Compete", "Create Profile", "Get Discovered", "Locked In"].map((item) => <div key={item} style={{ padding: "13px 20px", borderRadius: 999, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)", fontSize: 20, fontWeight: 900 }}>{item}</div>)}
          </div>
        </div>
      </div>
    ),
    size
  );
}
