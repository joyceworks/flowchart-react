import React from "react";

export function Marker({ id, color }: { id: string; color: string }) {
  return (
    <marker
      id={id}
      markerUnits={"strokeWidth"}
      viewBox={"0 0 12 12"}
      refX={9}
      refY={6}
      markerWidth={12}
      markerHeight={12}
      orient={"auto"}
    >
      <path d={"M2,2 L10,6 L2,10 L6,6 L2,2"} fill={color} />
    </marker>
  );
}
