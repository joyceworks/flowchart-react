import React from "react";
import { NodeProps } from "./schema";

const FlowchartOperationNode = function ({
  data,
  isSelected = false,
}: NodeProps): JSX.Element {
  const borderColor = isSelected ? "#666666" : "#bbbbbb";
  const text = (typeof data.title === "function" && data.title()) || data.title;
  return (
    <>
      <rect
        width={120}
        height={60}
        fill={"white"}
        x={data.x}
        y={data.y}
        strokeWidth={1}
        stroke={borderColor}
      />
      <text x={data.x + 60} y={data.y + 35} textAnchor={"middle"}>
        {text}
      </text>
    </>
  );
};

export default FlowchartOperationNode;
