import React from "react";
import { NodeProps } from "./schema";

const FlowchartStartEndNode = function ({
  data,
  isSelected = false,
}: NodeProps): JSX.Element {
  const borderColor = isSelected ? "#666666" : "#bbbbbb";
  const text = (typeof data.title === "function" && data.title()) || data.title;
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
      <text x={data.x + 60} y={data.y + 35} textAnchor={"middle"}>
        {text}
      </text>
    </>
  );
};

export default FlowchartStartEndNode;
