import React from "react";
import { NodeProps } from "./schema";
import { SupportedSVGShapeProps } from "../schema";
import { Text } from "./Text";

const DecisionNode = function ({ data, isSelected }: NodeProps) {
  const borderColor = isSelected ? "#666666" : "#bbbbbb";
  const width = data.width || 120;
  const halfWidth = width / 2;
  const height = data.height || 60;
  const halfHeight = height / 2;
  const top = `${data.x + halfWidth},${data.y}`;
  const bottom = `${data.x + halfWidth},${data.y + height}`;
  const left = `${data.x},${data.y + halfHeight}`;
  const right = `${data.x + width},${data.y + halfHeight}`;
  return (
    <>
      <polygon
        points={`${left} ${top} ${right} ${bottom}`}
        fill={"white"}
        strokeWidth={1}
        stroke={borderColor}
        {...(data.containerProps as SupportedSVGShapeProps)}
      />
      <Text data={data} />
    </>
  );
};

export { DecisionNode };
