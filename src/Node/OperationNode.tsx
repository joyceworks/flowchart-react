import React from "react";
import { NodeProps } from "./schema";

const OperationNode = function ({
  data,
  isSelected = false,
}: NodeProps): JSX.Element {
  const borderColor = isSelected ? "#666666" : "#bbbbbb";
  const text = (typeof data.title === "function" && data.title()) || data.title;
  const halfWidth = (data.width || 120) / 2;
  const halfHeight = (data.height || 60) / 2;
  return (
    <>
      <rect
        width={data.width || 120}
        height={data.height || 60}
        fill={"white"}
        x={data.x}
        y={data.y}
        strokeWidth={1}
        stroke={borderColor}
      />
      <text x={data.x + halfWidth} y={data.y + halfHeight + 5} textAnchor={"middle"}>
        {text}
      </text>
    </>
  );
};

export default OperationNode;
