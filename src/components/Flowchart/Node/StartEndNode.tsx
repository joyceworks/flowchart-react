import React from "react";
import { NodeProps } from "./schema";

export default function ({ data, isSelected = false }: NodeProps) {
  const borderColor = isSelected ? "#666666" : "#bbbbbb";
  const text = data.type === "start" ? "Start" : "End";
  return (
    <>
      <ellipse
        cx={data.x + 60}
        cy={data.y + 30}
        rx={60}
        ry={30}
        fill={"white"}
        strokeWidth={1}
        stroke={borderColor}
      />
      <text x={data.x + 60} y={data.y + 5 + 30} textAnchor={"middle"}>
        {text}
      </text>
    </>
  );
}
