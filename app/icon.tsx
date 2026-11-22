import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#1d1a16",
          color: "#f4f1ea",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          fontFamily: "Georgia",
        }}
      >
        R
      </div>
    ),
    size,
  );
}
