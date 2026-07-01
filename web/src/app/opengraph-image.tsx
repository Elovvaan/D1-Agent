import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MyD1 athlete platform share preview";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #061331 0%, #0A1A3F 55%, #1B3FA0 100%)",
          color: "white",
          padding: "64px",
          fontFamily: "Arial, sans-serif"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "22px" }}>
            <div
              style={{
                width: "96px",
                height: "96px",
                borderRadius: "28px",
                background: "#F2C200",
                color: "#061331",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "34px",
                fontWeight: 900,
                letterSpacing: "-2px",
                boxShadow: "0 24px 60px rgba(242,194,0,0.28)"
              }}
            >
              D1
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "48px", fontWeight: 900, letterSpacing: "-2px" }}>MyD1</div>
              <div style={{ fontSize: "22px", color: "#C7D7FA", fontWeight: 700 }}>D1 Agent Platform</div>
            </div>
          </div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#F2C200" }}>myd1sports.pro</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "880px" }}>
          <div style={{ fontSize: "72px", fontWeight: 900, lineHeight: 0.95, letterSpacing: "-4px" }}>
            The Athlete Profile. The Public Sports Network.
          </div>
          <div style={{ fontSize: "28px", lineHeight: 1.35, color: "#DCE7FF", fontWeight: 700 }}>
            Verified athletic profiles, public sports search, film, recruiting workflows, and career tools powered by the D1 Agent.
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          {["Athletes", "Schools", "Film", "Recruiting", "Search"].map((item) => (
            <div
              key={item}
              style={{
                padding: "14px 22px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.18)",
                fontSize: "22px",
                fontWeight: 800
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
