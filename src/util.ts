import {
  ConnectionData,
  ConnectorPosition,
  Direction,
  Line,
  NodeData,
  Point,
} from "./schema";
import update from "immutability-helper";

function pathing(
  p1: Point,
  p2: Point,
  startPosition: ConnectorPosition,
  endPosition: ConnectorPosition | null
): [number, number][] {
  const points: [number, number][] = [];
  const start: [number, number] = [p1.x, p1.y];
  const end: [number, number] = [p2.x, p2.y];
  const centerX = start[0] + (end[0] - start[0]) / 2;
  const centerY = start[1] + (end[1] - start[1]) / 2;
  let second: [number, number];
  const addVerticalCenterLine = function () {
    const third: [number, number] = [centerX, second[1]];
    const forth: [number, number] = [centerX, penult[1]];
    points.push(third);
    points.push(forth);
  };
  const addHorizontalCenterLine = function () {
    const third: [number, number] = [second[0], centerY];
    const forth: [number, number] = [penult[0], centerY];
    points.push(third);
    points.push(forth);
  };
  const addHorizontalTopLine = function () {
    points.push([second[0], start[1] - 50]);
    points.push([penult[0], start[1] - 50]);
  };
  const addHorizontalBottomLine = function () {
    points.push([second[0], start[1] + 50]);
    points.push([penult[0], start[1] + 50]);
  };
  const addVerticalRightLine = function () {
    points.push([start[0] + 80, second[1]]);
    points.push([start[0] + 80, penult[1]]);
  };
  const addVerticalLeftLine = function () {
    points.push([start[0] - 80, second[1]]);
    points.push([start[0] - 80, penult[1]]);
  };
  const addSecondXPenultY = function () {
    points.push([second[0], penult[1]]);
  };
  const addPenultXSecondY = function () {
    points.push([penult[0], second[1]]);
  };
  switch (startPosition) {
    case "left":
      second = [start[0] - 20, start[1]];
      break;
    case "top":
      second = [start[0], start[1] - 20];
      break;
    case "bottom":
      second = [start[0], start[1] + 20];
      break;
    default:
      second = [start[0] + 20, start[1]];
      break;
  }
  let penult: [number, number];
  switch (endPosition) {
    case "right":
      penult = [end[0] + 20, end[1]];
      break;
    case "top":
      penult = [end[0], end[1] - 20];
      break;
    case "bottom":
      penult = [end[0], end[1] + 20];
      break;
    default:
      penult = [end[0] - 20, end[1]];
      break;
  }
  points.push(start);
  points.push(second);
  startPosition = startPosition || "right";
  endPosition = endPosition || "left";
  const direction = calcDirection(p1, p2);
  if (direction.indexOf("r") > -1) {
    if (startPosition === "right" || endPosition === "left") {
      if (second[0] > centerX) {
        second[0] = centerX;
      }
      if (penult[0] < centerX) {
        penult[0] = centerX;
      }
    }
  }
  if (direction.indexOf("d") > -1) {
    if (startPosition === "bottom" || endPosition === "top") {
      if (second[1] > centerY) {
        second[1] = centerY;
      }
      if (penult[1] < centerY) {
        penult[1] = centerY;
      }
    }
  }
  if (direction.indexOf("l") > -1) {
    if (startPosition === "left" || endPosition === "right") {
      if (second[0] < centerX) {
        second[0] = centerX;
      }
      if (penult[0] > centerX) {
        penult[0] = centerX;
      }
    }
  }
  if (direction.indexOf("u") > -1) {
    if (startPosition === "top" || endPosition === "bottom") {
      if (second[1] < centerY) {
        second[1] = centerY;
      }
      if (penult[1] > centerY) {
        penult[1] = centerY;
      }
    }
  }
  switch (direction) {
    case "lu": {
      if (startPosition === "right") {
        switch (endPosition) {
          case "top":
          case "right":
            addSecondXPenultY();
            break;
          default: {
            addHorizontalCenterLine();
            break;
          }
        }
      } else if (startPosition === "bottom") {
        switch (endPosition) {
          case "top":
            addVerticalCenterLine();
            break;
          default: {
            addPenultXSecondY();
            break;
          }
        }
      } else if (startPosition === "top") {
        switch (endPosition) {
          case "top":
          case "right":
            addSecondXPenultY();
            break;
          default: {
            addHorizontalCenterLine();
            break;
          }
        }
      } else {
        // startPosition is left
        switch (endPosition) {
          case "top":
          case "right":
            addVerticalCenterLine();
            break;
          default: {
            addPenultXSecondY();
            break;
          }
        }
      }
      break;
    }
    case "u":
      if (startPosition === "right") {
        switch (endPosition) {
          case "right": {
            break;
          }
          case "top": {
            addSecondXPenultY();
            break;
          }
          default: {
            addHorizontalCenterLine();
            break;
          }
        }
      } else if (startPosition === "bottom") {
        switch (endPosition) {
          case "left":
          case "right":
            addPenultXSecondY();
            break;
          default: {
            addVerticalRightLine();
            break;
          }
        }
      } else if (startPosition === "top") {
        switch (endPosition) {
          case "left": {
            addPenultXSecondY();
            break;
          }
          case "right": {
            addHorizontalCenterLine();
            break;
          }
          case "top":
            addVerticalRightLine();
            break;
          default: {
            break;
          }
        }
      } else {
        // left
        switch (endPosition) {
          case "left":
          case "right":
            break;
          default: {
            points.push([second[0], penult[1]]);
            break;
          }
        }
      }
      break;
    case "ru":
      if (startPosition === "right") {
        switch (endPosition) {
          case "left": {
            addVerticalCenterLine();
            break;
          }
          case "top": {
            addSecondXPenultY();
            break;
          }
          default: {
            addPenultXSecondY();
            break;
          }
        }
      } else if (startPosition === "bottom") {
        switch (endPosition) {
          case "top": {
            addVerticalCenterLine();
            break;
          }
          default: {
            addPenultXSecondY();
            break;
          }
        }
      } else if (startPosition === "top") {
        switch (endPosition) {
          case "right": {
            addVerticalCenterLine();
            break;
          }
          default: {
            addSecondXPenultY();
            break;
          }
        }
      } else {
        // left
        switch (endPosition) {
          case "left":
          case "top":
            addSecondXPenultY();
            break;
          default: {
            addHorizontalCenterLine();
            break;
          }
        }
      }
      break;
    case "l":
      if (startPosition === "right") {
        switch (endPosition) {
          case "left":
          case "right":
          case "top":
            addHorizontalTopLine();
            break;
          default: {
            addHorizontalBottomLine();
            break;
          }
        }
      } else if (startPosition === "bottom") {
        switch (endPosition) {
          case "left": {
            addHorizontalBottomLine();
            break;
          }
          case "right": {
            addSecondXPenultY();
            break;
          }
          case "top": {
            addVerticalCenterLine();
            break;
          }
          default: {
            break;
          }
        }
      } else if (startPosition === "top") {
        switch (endPosition) {
          case "left": {
            addHorizontalTopLine();
            break;
          }
          case "right": {
            addSecondXPenultY();
            break;
          }
          case "top": {
            break;
          }
          default: {
            addVerticalCenterLine();
            break;
          }
        }
      } else {
        // left
        switch (endPosition) {
          case "left": {
            addHorizontalTopLine();
            break;
          }
          case "right": {
            break;
          }
          default: {
            addSecondXPenultY();
            break;
          }
        }
      }
      break;
    case "r":
      if (startPosition === "right") {
        switch (endPosition) {
          case "left": {
            break;
          }
          case "right": {
            addHorizontalTopLine();
            break;
          }
          default: {
            addSecondXPenultY();
            break;
          }
        }
      } else if (startPosition === "bottom") {
        switch (endPosition) {
          case "left": {
            addSecondXPenultY();
            break;
          }
          case "right": {
            addHorizontalBottomLine();
            break;
          }
          case "top": {
            addVerticalCenterLine();
            break;
          }
          default: {
            break;
          }
        }
      } else if (startPosition === "top") {
        switch (endPosition) {
          case "left": {
            addPenultXSecondY();
            break;
          }
          case "right": {
            addHorizontalTopLine();
            break;
          }
          case "top": {
            break;
          }
          default: {
            addVerticalCenterLine();
            break;
          }
        }
      } else {
        // left
        switch (endPosition) {
          case "left":
          case "right":
          case "top":
            addHorizontalTopLine();
            break;
          default: {
            addHorizontalBottomLine();
            break;
          }
        }
      }
      break;
    case "ld":
      if (startPosition === "right") {
        switch (endPosition) {
          case "left": {
            addHorizontalCenterLine();
            break;
          }
          default: {
            addSecondXPenultY();
            break;
          }
        }
      } else if (startPosition === "bottom") {
        switch (endPosition) {
          case "left": {
            addPenultXSecondY();
            break;
          }
          case "top": {
            addHorizontalCenterLine();
            break;
          }
          default: {
            addSecondXPenultY();
            break;
          }
        }
      } else if (startPosition === "top") {
        switch (endPosition) {
          case "left":
          case "right":
          case "top":
            addPenultXSecondY();
            break;
          default: {
            addVerticalCenterLine();
            break;
          }
        }
      } else {
        // left
        switch (endPosition) {
          case "left":
          case "top":
            addPenultXSecondY();
            break;
          case "right": {
            addVerticalCenterLine();
            break;
          }
          default: {
            addSecondXPenultY();
            break;
          }
        }
      }
      break;
    case "d":
      if (startPosition === "right") {
        switch (endPosition) {
          case "left": {
            addHorizontalCenterLine();
            break;
          }
          case "right": {
            addPenultXSecondY();
            break;
          }
          case "top": {
            addSecondXPenultY();
            break;
          }
          default: {
            addVerticalRightLine();
            break;
          }
        }
      } else if (startPosition === "bottom") {
        switch (endPosition) {
          case "left":
          case "right":
            addPenultXSecondY();
            break;
          case "top": {
            break;
          }
          default: {
            addVerticalRightLine();
            break;
          }
        }
      } else if (startPosition === "top") {
        switch (endPosition) {
          case "left": {
            addVerticalLeftLine();
            break;
          }
          default: {
            addVerticalRightLine();
            break;
          }
        }
      } else {
        // left
        switch (endPosition) {
          case "left": {
            break;
          }
          case "right": {
            addHorizontalCenterLine();
            break;
          }
          case "top": {
            addSecondXPenultY();
            break;
          }
          default: {
            addVerticalLeftLine();
            break;
          }
        }
      }
      break;
    case "rd": {
      if (startPosition === "right" && endPosition === "left") {
        addVerticalCenterLine();
      } else if (startPosition === "right" && endPosition === "bottom") {
        addSecondXPenultY();
      } else if (
        (startPosition === "right" && endPosition === "top") ||
        (startPosition === "right" && endPosition === "right")
      ) {
        addPenultXSecondY();
      } else if (startPosition === "bottom" && endPosition === "left") {
        addSecondXPenultY();
      } else if (startPosition === "bottom" && endPosition === "right") {
        addPenultXSecondY();
      } else if (startPosition === "bottom" && endPosition === "top") {
        addHorizontalCenterLine();
      } else if (startPosition === "bottom" && endPosition === "bottom") {
        addSecondXPenultY();
      } else if (startPosition === "top" && endPosition === "left") {
        addPenultXSecondY();
      } else if (startPosition === "top" && endPosition === "right") {
        addPenultXSecondY();
      } else if (startPosition === "top" && endPosition === "top") {
        addPenultXSecondY();
      } else if (startPosition === "top" && endPosition === "bottom") {
        addVerticalCenterLine();
      } else if (startPosition === "left" && endPosition === "left") {
        addSecondXPenultY();
      } else if (startPosition === "left" && endPosition === "right") {
        addHorizontalCenterLine();
      } else if (startPosition === "left" && endPosition === "top") {
        addHorizontalCenterLine();
      } else if (startPosition === "left" && endPosition === "bottom") {
        addSecondXPenultY();
      }
      break;
    }
  }
  points.push(penult);
  points.push(end);
  return points;
}

function calcDirection(p1: Point, p2: Point): Direction {
  // Use approximatelyEquals to fix the problem of css position precision
  if (p2.x < p1.x && p2.y === p1.y) {
    return "l";
  }
  if (p2.x > p1.x && p2.y === p1.y) {
    return "r";
  }
  if (p2.x === p1.x && p2.y < p1.y) {
    return "u";
  }
  if (p2.x === p1.x && p2.y > p1.y) {
    return "d";
  }
  if (p2.x < p1.x && p2.y < p1.y) {
    return "lu";
  }
  if (p2.x > p1.x && p2.y < p1.y) {
    return "ru";
  }
  if (p2.x < p1.x && p2.y > p1.y) {
    return "ld";
  }
  return "rd";
}

function distanceOfP2P(p1: Point, p2: Point): number {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

function distanceOfP2L(point: Point, line: Line): number {
  const start = line[0],
    end = line[1];
  const k = (end.y - start.y || 1) / (end.x - start.x || 1);
  const b = start.y - k * start.x;
  return Math.abs(k * point.x - point.y + b) / Math.sqrt(k * k + 1);
}

function between(num1: number, num2: number, num: number): boolean {
  return (num > num1 && num < num2) || (num > num2 && num < num1);
}

function approximatelyEquals(n: number, m: number): boolean {
  return Math.abs(m - n) <= 3;
}

function calcCorners(points: Point[]): { start: Point; end: Point } {
  const minX = points.reduce((prev, point) => {
    return point.x < prev ? point.x : prev;
  }, Infinity);
  const maxX = points.reduce((prev, point) => {
    return point.x > prev ? point.x : prev;
  }, 0);
  const minY = points.reduce((prev, point) => {
    return point.y < prev ? point.y : prev;
  }, Infinity);
  const maxY = points.reduce((prev, point) => {
    return point.y > prev ? point.y : prev;
  }, 0);
  return { start: { x: minX, y: minY }, end: { x: maxX, y: maxY } };
}

function center(nodes: NodeData[], width: number, height: number): NodeData[] {
  const corners = calcCorners([
    ...nodes,
    ...nodes.map((node) => ({
      x: node.x + (node.width || 120),
      y: node.y + (node.height || 60),
    })),
  ]);

  const offsetX = (width - corners.end.x - corners.start.x) / 2;
  const offsetY = (height - corners.end.y - corners.start.y) / 2;
  return update(nodes, {
    $apply: (state: NodeData[]) =>
      state.map((node) => ({
        ...node,
        x: roundTo10(node.x + offsetX),
        y: roundTo10(node.y + offsetY),
      })),
  });
}

function isIntersected(
  p: Point,
  rect: {
    start: Point;
    end: Point;
  }
): boolean {
  return (
    p.x > rect.start.x &&
    p.x < rect.end.x &&
    p.y > rect.start.y &&
    p.y < rect.end.y
  );
}

function roundTo10(number: number): number {
  return Math.ceil(number / 10) * 10;
}

function locateConnector(node: NodeData): {
  left: Point;
  right: Point;
  top: Point;
  bottom: Point;
} {
  const height = node.height || 60;
  const width = node.width || 120;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const top = { x: node.x + halfWidth, y: node.y };
  const left = { x: node.x, y: node.y + halfHeight };
  const bottom = { x: node.x + halfWidth, y: node.y + height };
  const right = { x: node.x + width, y: node.y + halfHeight };
  return { left, right, top, bottom };
}

/**
 * Get angle positions: top-left, top-right, bottom-right, bottom-left
 * @param node
 */
function locateAngle(
  node: Pick<NodeData, "width" | "height" | "x" | "y">
): [Point, Point, Point, Point] {
  const width = node.width || 120;
  const height = node.height || 60;
  return [
    { x: node.x, y: node.y },
    { x: node.x + width, y: node.y },
    { x: node.x + width, y: node.y + height },
    { x: node.x, y: node.y + height },
  ];
}

function calcIntersectedConnections(
  internalNodes: NodeData[],
  internalConnections: ConnectionData[],
  rect: { start: Point; end: Point }
): ConnectionData[] {
  const result: ConnectionData[] = [];
  for (const internalConnection of internalConnections) {
    const srcNodeData = internalNodes.find(
      (item) => item.id === internalConnection.source.id
    );
    const destNodeData = internalNodes.find(
      (item) => item.id === internalConnection.destination.id
    );
    const points = pathing(
      locateConnector(srcNodeData!)[internalConnection.source.position],
      locateConnector(destNodeData!)[internalConnection.destination.position],
      internalConnection.source.position,
      internalConnection.destination.position
    );
    if (
      points.some((point) => isIntersected({ x: point[0], y: point[1] }, rect))
    ) {
      result.push(internalConnection);
    }
  }
  return result;
}

function calcIntersectedNodes(
  internalNodes: NodeData[],
  edge: { start: Point; end: Point }
): NodeData[] {
  const tempCurrentNodes: NodeData[] = [];
  internalNodes.forEach((item) => {
    if (locateAngle(item).some((point) => isIntersected(point, edge))) {
      tempCurrentNodes.push(item);
    }
  });
  return tempCurrentNodes;
}

function createConnection(
  sourceId: number,
  sourcePosition: ConnectorPosition,
  destinationId: number,
  destinationPosition: ConnectorPosition
): ConnectionData {
  return {
    source: { id: sourceId, position: sourcePosition },
    destination: { id: destinationId, position: destinationPosition },
    type: "success",
  };
}

export function calcGuidelines(
  node: Pick<NodeData, "width" | "height" | "x" | "y" | "id">,
  nodes: NodeData[]
): Line[] {
  const guidelines: Line[] = [];
  const points = locateAngle(node);
  for (let i = 0; i < points.length; i++) {
    const srcAnglePoint = {
      x: roundTo10(points[i].x),
      y: roundTo10(points[i].y),
    };

    let lines: Line[];
    let directions: Direction[];
    switch (i) {
      case 0: {
        lines = [
          [{ x: srcAnglePoint.x, y: 0 }, srcAnglePoint],
          [{ x: 0, y: srcAnglePoint.y }, srcAnglePoint],
        ];
        directions = ["lu", "u", "l"];
        break;
      }
      case 1: {
        lines = [
          [{ x: srcAnglePoint.x, y: 0 }, srcAnglePoint],
          // todo: replace 10000 with the width of svg
          [{ x: 10000, y: srcAnglePoint.y }, srcAnglePoint],
        ];
        directions = ["ru", "u", "r"];
        break;
      }
      case 2: {
        lines = [
          [{ x: srcAnglePoint.x, y: 10000 }, srcAnglePoint],
          [{ x: 10000, y: srcAnglePoint.y }, srcAnglePoint],
        ];
        directions = ["r", "rd", "d"];
        break;
      }
      default: {
        lines = [
          [{ x: srcAnglePoint.x, y: 10000 }, srcAnglePoint],
          [{ x: 0, y: srcAnglePoint.y }, srcAnglePoint],
        ];
        directions = ["l", "ld", "d"];
        break;
      }
    }

    for (const destination of nodes.filter(
      (internalNode) => internalNode.id !== node.id
    )) {
      let line: Line | null = null;
      for (const destPoint of locateAngle(destination)) {
        const direction = calcDirection(srcAnglePoint, destPoint);
        if (
          directions.indexOf(direction) > -1 &&
          (distanceOfP2L(destPoint, lines[0]) < 5 ||
            distanceOfP2L(destPoint, lines[1]) < 5)
        ) {
          if (
            line === null ||
            distanceOfP2P(destPoint, srcAnglePoint) <
              distanceOfP2P(line[0], line[1])
          ) {
            line = [destPoint, srcAnglePoint];
          }
        }
      }
      if (line) {
        guidelines.push(line);
      }
    }
  }
  return guidelines;
}

export {
  isIntersected,
  distanceOfP2L,
  distanceOfP2P,
  calcDirection,
  calcCorners,
  between,
  pathing,
  approximatelyEquals,
  locateConnector,
  locateAngle,
  calcIntersectedConnections,
  calcIntersectedNodes,
  createConnection,
  roundTo10,
  center,
};
