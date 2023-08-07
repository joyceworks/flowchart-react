import React from "react";
import { Direction, NodeData } from "../schema";

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
const Controller = function ({
  data,
  onMouseDown,
}: {
  data: NodeData;
  onMouseDown: (direction: Direction) => void;
}) {
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
      {/* Top left */}
      <rect
        className={"cursor-nw-resize"}
        x={data.x - 3}
        y={data.y - 3}
        {...props}
        onMouseDown={(event) => {
          event.stopPropagation();
          onMouseDown("lu");
        }}
      />
      {/* Top */}
      <rect
        className={"cursor-n-resize"}
        x={data.x + (data.width || 120) / 2 - 3}
        y={data.y - 3}
        {...props}
        onMouseDown={(event) => {
          event.stopPropagation();
          onMouseDown("u");
        }}
      />
      <rect
        className={"cursor-sw-resize"}
        x={data.x - 3}
        y={data.y + (data.height || 60) - 3}
        {...props}
        onMouseDown={(event) => {
          event.stopPropagation();
          onMouseDown("ld");
        }}
      />
      {/* Right */}
      <rect
        className={"cursor-w-resize"}
        x={data.x - 3}
        y={data.y + (data.height || 60) / 2 - 3}
        {...props}
        onMouseDown={(event) => {
          event.stopPropagation();
          onMouseDown("l");
        }}
      />
      {/* Down */}
      <rect
        className={"cursor-s-resize"}
        x={data.x + (data.width || 120) / 2 - 3}
        y={data.y + (data.height || 60) - 3}
        {...props}
        onMouseDown={(event) => {
          event.stopPropagation();
          onMouseDown("d");
        }}
      />
      {/* Left */}
      <rect
        className={"cursor-e-resize"}
        x={data.x + (data.width || 120) - 3}
        y={data.y + (data.height || 60) / 2 - 3}
        {...props}
        onMouseDown={(event) => {
          event.stopPropagation();
          onMouseDown("r");
        }}
      />
      <rect
        className={"cursor-ne-resize"}
        x={data.x + (data.width || 120) - 3}
        y={data.y - 3}
        {...props}
        onMouseDown={(event) => {
          event.stopPropagation();
          onMouseDown("ru");
        }}
      />
      <rect
        className={"cursor-se-resize"}
        x={data.x + (data.width || 120) - 3}
        y={data.y + (data.height || 60) - 3}
        {...props}
        onMouseDown={(event) => {
          event.stopPropagation();
          onMouseDown("rd");
        }}
      />
    </>
  );
};

export { Controller };
