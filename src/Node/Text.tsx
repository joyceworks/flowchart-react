import { SupportedSVGTextProps } from "../schema";
import React from "react";
import { NodeProps } from "./schema";

const Text = function ({ data }: NodeProps) {
  const text = (typeof data.title === "function" && data.title()) || data.title;
  return (
    <foreignObject
      className={"pointer-events-none"}
      x={data.x}
      y={data.y}
      width={data.width || 120}
      height={data.height || 60}
      {...(data.textProps as SupportedSVGTextProps)}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          textAlign: "center",
          wordBreak: "break-word",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          lineHeight: "18px",
        }}
      >
        {text}
      </div>
    </foreignObject>
  );
};

export { Text };
