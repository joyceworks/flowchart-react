import React, { CSSProperties, useMemo } from "react";

export default function Circle(
  props: {
    isConnecting: boolean;
  } & React.SVGAttributes<SVGCircleElement>
): JSX.Element {
  const style = useMemo<CSSProperties>(() => {
    if (!props.isConnecting) {
      return {};
    }
    return {
      opacity: 1,
    };
  }, [props.isConnecting]);
  return (
    <circle
      className={"circle"}
      style={Object.assign(style, props.style)}
      {...props}
    />
  );
}
