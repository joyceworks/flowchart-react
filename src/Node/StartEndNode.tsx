import React from "react";
import { NodeProps } from "./schema";

const FlowchartStartEndNode = function ({
  data,
  isSelected = false,
}: NodeProps): JSX.Element {
  const borderColor = isSelected ? "#666666" : "#bbbbbb";
  const text = (typeof data.title === "function" && data.title()) || data.title;
  const halfWidth = (data.width || 120) / 2;
  const halfHeight = (data.height || 60) / 2;
  return (
    <>
      <ellipse
        cx={data.x + halfWidth}
        cy={data.y + halfHeight}
        rx={halfWidth}
        ry={halfHeight}
        fill={"white"}
        strokeWidth={1}
        stroke={borderColor}
      />
      <text x={data.x + halfWidth} y={data.y + halfHeight + 5} textAnchor={"middle"}>
        {text}
      </text>
    </>
  );
};

export default FlowchartStartEndNode;
