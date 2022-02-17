import { ConnectionData, ConnectorPosition, Direction, Line, NodeData, Point } from "./schema";
declare function pathing(p1: Point, p2: Point, startPosition: ConnectorPosition, endPosition: ConnectorPosition | null): [number, number][];
declare function calcDirection(p1: Point, p2: Point): Direction;
declare function distanceOfPoint2Point(p1: Point, p2: Point): number;
declare function distanceOfPointToLine(point: Point, line: Line): number;
declare function between(num1: number, num2: number, num: number): boolean;
declare function approximatelyEquals(n: number, m: number): boolean;
declare function calcCorners(points: Point[]): {
    start: Point;
    end: Point;
};
declare function center(nodes: NodeData[], width: number, height: number): NodeData[];
declare function isIntersected(p: Point, rect: {
    start: Point;
    end: Point;
}): boolean;
declare function roundTo20(number: number): number;
declare function roundToNearest10(number: number): number;
declare function locateConnector(node: NodeData): {
    left: Point;
    right: Point;
    top: Point;
    bottom: Point;
};
/**
 * Get angle positions: top-left, top-right, bottom-right, bottom-left
 * @param node
 */
declare function locateAngle(node: NodeData): [Point, Point, Point, Point];
declare function calcIntersectedConnections(internalNodes: NodeData[], internalConnections: ConnectionData[], rect: {
    start: Point;
    end: Point;
}): ConnectionData[];
declare function calcIntersectedNodes(internalNodes: NodeData[], edge: {
    start: Point;
    end: Point;
}): NodeData[];
declare function createConnection(sourceId: number, sourcePosition: ConnectorPosition, destinationId: number, destinationPosition: ConnectorPosition): ConnectionData;
declare function render(data: NodeData): string | undefined;
export { isIntersected, distanceOfPointToLine, distanceOfPoint2Point, calcDirection, calcCorners, between, roundTo20, pathing, approximatelyEquals, locateConnector, locateAngle, calcIntersectedConnections, calcIntersectedNodes, createConnection, render, roundToNearest10, center, };
