import React from "react";
import { NodeProps } from "./schema";
import { SupportedSVGShapeProps } from "../schema";
import { Text } from "./Text";

const OperationNode = function ({
  data,
  isSelected = false,
}: NodeProps): JSX.Element {
  const borderColor = isSelected ? "#666666" : "#bbbbbb";
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
        {...(data.containerProps as SupportedSVGShapeProps)}
      />
      <Text data={data} />
    </>
  );
};

export default OperationNode;
