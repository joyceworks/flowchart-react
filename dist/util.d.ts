import { ConnectionData, ConnectorPosition, Direction, Line, NodeData, Point } from "./schema";
declare function pathing(p1: Point, p2: Point, startPosition: ConnectorPosition, endPosition: ConnectorPosition | null): [number, number][];
declare function calcDirection(p1: Point, p2: Point): Direction;
declare function distanceOfP2P(p1: Point, p2: Point): number;
declare function distanceOfP2L(point: Point, line: Line): number;
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
declare function roundTo10(number: number): number;
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
declare function locateAngle(node: Pick<NodeData, "width" | "height" | "x" | "y">): [Point, Point, Point, Point];
declare function calcIntersectedConnections(internalNodes: NodeData[], internalConnections: ConnectionData[], rect: {
    start: Point;
    end: Point;
}): ConnectionData[];
declare function calcIntersectedNodes(internalNodes: NodeData[], edge: {
    start: Point;
    end: Point;
}): NodeData[];
declare function createConnection(sourceId: number, sourcePosition: ConnectorPosition, destinationId: number, destinationPosition: ConnectorPosition): ConnectionData;
export declare function calcGuidelines(node: Pick<NodeData, "width" | "height" | "x" | "y" | "id">, nodes: NodeData[]): Line[];
export { isIntersected, distanceOfP2L, distanceOfP2P, calcDirection, calcCorners, between, pathing, approximatelyEquals, locateConnector, locateAngle, calcIntersectedConnections, calcIntersectedNodes, createConnection, roundTo10, center, };
