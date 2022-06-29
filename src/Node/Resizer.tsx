import React from "react";
import { NodeData } from "../schema";

const strokeProps: React.SVGProps<SVGRectElement> = {
  strokeWidth: 1,
  stroke: "lightblue",
};
const props: React.SVGProps<SVGRectElement> = {
  width: 6,
  height: 6,
  fill: "white",
  ...strokeProps,
};
const Resizer = function ({ data }: { data: NodeData }) {
  return (
    <>
      <rect
        x={data.x}
        y={data.y}
        width={data.width}
        height={data.height}
        fill={"transparent"}
        {...strokeProps}
      />
      <rect
        className={"cursor-nw-resize"}
        x={data.x - 3}
        y={data.y - 3}
        {...props}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      />
      <rect
        className={"cursor-sw-resize"}
        x={data.x - 3}
        y={data.y + (data.height || 60) - 3}
        {...props}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      />
      <rect
        className={"cursor-ne-resize"}
        x={data.x + (data.width || 120) - 3}
        y={data.y - 3}
        {...props}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      />
      <rect
        className={"cursor-se-resize"}
        x={data.x + (data.width || 120) - 3}
        y={data.y + (data.height || 60) - 3}
        {...props}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      />
    </>
  );
};

export { Resizer };
