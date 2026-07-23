import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CampusCurrents - Stay Informed, Stay Safe";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F9F9F9",
          position: "relative",
        }}
      >
        {/* Background accent blobs */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: -60,
            width: 400,
            height: 400,
            borderRadius: "50%",
            backgroundColor: "#AF101A",
            opacity: 0.06,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            right: -80,
            width: 450,
            height: 450,
            borderRadius: "50%",
            backgroundColor: "#F89C00",
            opacity: 0.08,
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            zIndex: 1,
          }}
        >
          {/* Brand name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                backgroundColor: "#AF101A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "white", fontSize: 28, fontWeight: 700 }}>
                CC
              </span>
            </div>
            <span style={{ fontSize: 36, fontWeight: 700, color: "#1A1C1C" }}>
              Campus
              <span style={{ color: "#AF101A" }}>Currents</span>
            </span>
          </div>

          {/* Tagline */}
          <h1
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: "#1A1C1C",
              textAlign: "center",
              lineHeight: 1.1,
              margin: 0,
              letterSpacing: -2,
            }}
          >
            Stay Informed. Stay Safe.
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: 22,
              color: "#5B403D",
              textAlign: "center",
              maxWidth: 700,
              lineHeight: 1.4,
              margin: 0,
            }}
          >
            Real-time class suspension alerts, emergency notifications, and
            campus updates for SSC-R Manila students.
          </p>

          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "#FFFBEB",
              border: "1px solid #F89C0050",
              borderRadius: 999,
              padding: "8px 16px",
              marginTop: 8,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#F89C00",
              }}
            />
            <span style={{ fontSize: 14, color: "#5B403D", fontWeight: 500 }}>
              Now in beta at SSC-R Manila
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
