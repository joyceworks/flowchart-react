import React, {
  CSSProperties,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import styled from "styled-components";
import update from "immutability-helper";
import {
  ConnectionData,
  ConnectorPosition,
  Line,
  NodeData,
  Point,
  SelectionInfo,
} from "./schema";
import {
  calcDirection,
  calcIntersectedConnections,
  calcIntersectedNodes,
  createConnection,
  distanceOfPoint2Point,
  distanceOfPointToLine,
  getEdgeOfPoints,
  lineGenerator,
  locateAngle,
  locateConnector,
  pathing,
} from "./util";
import Node from "./Node/Node";
import Connection from "./Connection/Connection";
import { defaultConnectionColors } from "./Connection/constant";

const SVG = styled("svg")`
  background-size: 20px 20px, 20px 20px, 10px 10px, 10px 10px;
  background-image: linear-gradient(to right, #dfdfdf 1px, transparent 1px),
    linear-gradient(to bottom, #dfdfdf 1px, transparent 1px),
    linear-gradient(to right, #f1f1f1 1px, transparent 1px),
    linear-gradient(to bottom, #f1f1f1 1px, transparent 1px);
  background-position: left -1px top -1px, left -1px top -1px,
    left -1px top -1px, left -1px top -1px;
  height: 100%;
  width: 100%;
  border: 1px solid #dfdfdf;

  text {
    moz-user-select: -moz-none;
    -moz-user-select: none;
    -o-user-select: none;
    -khtml-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
`;

interface FlowchartProps {
  style?: CSSProperties;
  defaultNodes: NodeData[];
  defaultConnections: ConnectionData[];
  onEditNode?: (
    data: NodeData,
    setNodes: React.Dispatch<React.SetStateAction<NodeData[]>>
  ) => void;
  onCreateNode?: (
    data: NodeData,
    setNodes: React.Dispatch<React.SetStateAction<NodeData[]>>
  ) => void;
  onEditConnection?: (
    data: ConnectionData,
    setConnections: React.Dispatch<React.SetStateAction<ConnectionData[]>>
  ) => void;
  onCreateConnection?: (
    data: ConnectionData,
    setConnections: React.Dispatch<React.SetStateAction<ConnectionData[]>>
  ) => void;
  readonly?: boolean;
}

export default forwardRef(
  (
    {
      defaultNodes,
      defaultConnections,
      readonly = false,
      onEditNode,
      onCreateNode,
      onEditConnection,
      onCreateConnection,
      style,
    }: FlowchartProps,
    ref: any
  ) => {
    const [internalNodes, setInternalNodes] = useState<NodeData[]>(
      defaultNodes
    );
    const [internalConnections, setInternalConnections] = useState<
      ConnectionData[]
    >(defaultConnections);
    useEffect(() => {
      setInternalConnections(defaultConnections);
      setInternalNodes(defaultNodes);
    }, [defaultConnections, defaultNodes]);
    const [currentNodes, setCurrentNodes] = useState<number[]>([]);
    const [currentConnections, setCurrentConnections] = useState<
      ConnectionData[]
    >([]);
    const [selectionInfo, setSelectionInfo] = useState<SelectionInfo>();
    const [connectingInfo, setConnectingInfo] = useState<{
      source: NodeData;
      sourcePosition: ConnectorPosition;
    }>();
    const [draggingInfo, setDraggingInfo] = useState<{
      // todo: rename
      target: number[];
      delta: {
        x: number;
        y: number;
      }[];
    }>();
    const [cursorToChartOffset, setCursorToChartOffset] = useState<Point>({
      x: 0,
      y: 0,
    });
    const handleSVGDoubleClick = useCallback(
      (event) => {
        let point = {
          x: event.nativeEvent.offsetX,
          y: event.nativeEvent.offsetY,
          id: +new Date(),
        };
        let nodeData: NodeData;
        if (!internalNodes.find((item) => item.type === "start")) {
          nodeData = {
            type: "start",
            name: "Start",
            ...point,
          };
        } else if (!internalNodes.find((item) => item.type === "end")) {
          nodeData = {
            type: "end",
            name: "End",
            ...point,
          };
        } else {
          nodeData = {
            ...point,
            name: "New",
            type: "operation",
          };
        }
        return onCreateNode?.(nodeData, setInternalNodes);
      },
      [internalNodes, onCreateNode]
    );
    const handleSVGMouseDown = useCallback((event) => {
      // @ts-ignore: can not access tagName in event.target
      if (event.ctrlKey || event.metaKey || event.target.tagName !== "svg") {
        // ignore propagation
        return;
      }

      const point = {
        x: event.nativeEvent.offsetX,
        y: event.nativeEvent.offsetY,
      };
      setSelectionInfo({
        start: point,
        end: point,
      });
      setCurrentNodes([]);
      setCurrentConnections([]);
    }, []);
    const handleSVGMouseMove = useCallback(
      (event) => {
        const currentCursorToChartOffset: Point = {
          x: event.nativeEvent.offsetX,
          y: event.nativeEvent.offsetY,
        };

        setCursorToChartOffset(currentCursorToChartOffset);

        if (selectionInfo) {
          setSelectionInfo({
            start: selectionInfo.start,
            end: currentCursorToChartOffset,
          });

          const edge = getEdgeOfPoints([
            selectionInfo.start,
            currentCursorToChartOffset,
          ]);
          setCurrentNodes(
            calcIntersectedNodes(internalNodes, edge).map((item) => item.id)
          );
          setCurrentConnections(
            calcIntersectedConnections(internalNodes, internalConnections, edge)
          );
        } else if (draggingInfo) {
          setInternalNodes((prevState) => {
            let result: NodeData[] = prevState;
            for (let i = 0; i < draggingInfo.target.length; i++) {
              let t = draggingInfo.target[i];
              const findIndex = result.findIndex((item) => item.id === t);
              const delta = draggingInfo.delta[i];
              result = update(result, {
                [findIndex]: {
                  x: {
                    $set: currentCursorToChartOffset.x - delta.x,
                  },
                  y: {
                    $set: currentCursorToChartOffset.y - delta.y,
                  },
                },
              });
            }
            return result;
          });
        }
      },
      [draggingInfo, internalConnections, internalNodes, selectionInfo]
    );
    const moveCurrentNodes = useCallback(
      (x, y) => {
        const indexes = currentNodes.map((currentNode) =>
          internalNodes.findIndex(
            (internalNode) => internalNode.id === currentNode
          )
        );
        setInternalNodes((prevState) => {
          let tempState = prevState;
          for (const index of indexes) {
            tempState = update(tempState, {
              [index]: {
                x: {
                  $apply: (prev) => prev + x,
                },
                y: {
                  $apply: (prev) => prev + y,
                },
              },
            });
          }
          return tempState;
        });
      },
      [currentNodes, internalNodes]
    );
    const remove = useCallback(() => {
      if (readonly) return;

      // Delete connections
      setInternalConnections((prevState) => {
        // Splice arguments of selected connections
        const list1: [
          number,
          number
        ][] = currentConnections.map((currentConn) => [
          prevState.findIndex((interConn) => interConn.id === currentConn.id),
          1,
        ]);
        // Splice arguments of connections of selected nodes
        const list2: [number, number][] = currentNodes
          .map((currNode) =>
            internalConnections.filter(
              (interConn) =>
                interConn.source.id === currNode ||
                interConn.destination.id === currNode
            )
          )
          .flat()
          .map((currentConn) => [
            prevState.findIndex((interConn) => interConn.id === currentConn.id),
            1,
          ]);
        return update(prevState, {
          $splice: [...list1, ...list2].sort((a, b) => b[0] - a[0]),
        });
      });

      // Delete nodes
      setInternalNodes((prevState) =>
        update(prevState, {
          $splice: currentNodes
            .map((currNode) => [
              prevState.findIndex((interNode) => interNode.id === currNode),
              1,
            ])
            .sort((a, b) => b[0] - a[0]) as [number, number][],
        })
      );
    }, [currentConnections, currentNodes, internalConnections, readonly]);
    const handleSVGKeyDown = useCallback(
      (event) => {
        switch (event.keyCode) {
          case 37:
            moveCurrentNodes(-10, 0);
            break;
          case 38:
            moveCurrentNodes(0, -10);
            break;
          case 39:
            moveCurrentNodes(10, 0);
            break;
          case 40:
            moveCurrentNodes(0, 10);
            break;
          case 27:
            setCurrentNodes([]);
            setCurrentConnections([]);
            break;
          case 65:
            if (
              (event.ctrlKey || event.metaKey) &&
              document.activeElement === document.getElementById("chart")
            ) {
              setCurrentNodes([]);
              setCurrentConnections([]);
              setCurrentNodes(internalNodes.map((item) => item.id));
              setCurrentConnections([...currentConnections]);
            }
            break;
          case 46:
          case 8:
            remove();
            break;
          default:
            break;
        }
      },
      [currentConnections, internalNodes, moveCurrentNodes, remove]
    );
    const handleSVGMouseUp = useCallback(() => {
      setSelectionInfo(undefined);
      setConnectingInfo(undefined);
      setDraggingInfo(undefined);

      // Align dragging node
      if (draggingInfo) {
        setInternalNodes((prevState) => {
          let result: NodeData[] = prevState;
          for (const t of draggingInfo.target) {
            result = update(result, {
              [result.findIndex((item) => item.id === t)]: {
                x: {
                  $apply: (prevState) =>
                    Math.round(Math.round(prevState) / 10) * 10,
                },
                y: {
                  $apply: (prevState) =>
                    Math.round(Math.round(prevState) / 10) * 10,
                },
              },
            });
          }
          return result!;
        });
      }

      // Connect nodes
      if (!connectingInfo) {
        return;
      }
      let node: NodeData | null = null;
      let position: ConnectorPosition | null = null;
      for (const internalNode of internalNodes) {
        const locations = locateConnector(internalNode);
        for (const prop in locations) {
          const entry = locations[prop as ConnectorPosition];
          if (distanceOfPoint2Point(entry, cursorToChartOffset) < 6) {
            node = internalNode;
            position = prop as ConnectorPosition;
          }
        }
      }
      if (!node || !position) {
        return;
      }
      if (connectingInfo.source.id === node.id) {
        // Node can not connect to itself
        return;
      }
      const newConnection = createConnection(
        connectingInfo.source.id,
        connectingInfo.sourcePosition,
        node.id,
        position
      );
      onCreateConnection?.(newConnection, setInternalConnections);
    }, [
      connectingInfo,
      cursorToChartOffset,
      draggingInfo,
      internalNodes,
      onCreateConnection,
    ]);

    // todo: cache compute result
    let points: [number, number][] | undefined = undefined;
    if (connectingInfo) {
      let endPosition: ConnectorPosition | null = null;
      for (let internalNode of internalNodes) {
        const locations = locateConnector(internalNode);
        for (const prop in locations) {
          let entry = locations[prop as ConnectorPosition];
          if (distanceOfPoint2Point(entry, cursorToChartOffset) < 6) {
            endPosition = prop as ConnectorPosition;
          }
        }
      }

      points = pathing(
        locateConnector(connectingInfo.source)[connectingInfo.sourcePosition],
        cursorToChartOffset!,
        connectingInfo.sourcePosition,
        endPosition
      );
    }
    const guidelines: Line[] = [];
    if (draggingInfo) {
      for (const source of draggingInfo.target) {
        const sourceAnglePoints = locateAngle(
          internalNodes.find((item) => item.id === source)!
        );
        for (let i = 0; i < sourceAnglePoints.length; i++) {
          const sourceAnglePoint = {
            x: Math.round(Math.round(sourceAnglePoints[i].x) / 10) * 10,
            y: Math.round(Math.round(sourceAnglePoints[i].y) / 10) * 10,
          };

          let lines: Line[];
          let directions: ("l" | "r" | "u" | "d" | "lu" | "ru" | "ld" | "rd")[];
          switch (i) {
            case 0: {
              lines = [
                [{ x: sourceAnglePoint.x, y: 0 }, sourceAnglePoint],
                [{ x: 0, y: sourceAnglePoint.y }, sourceAnglePoint],
              ];
              directions = ["lu", "u", "l"];
              break;
            }
            case 1: {
              lines = [
                [{ x: sourceAnglePoint.x, y: 0 }, sourceAnglePoint],
                // todo: replace 10000 with the width of svg
                [{ x: 10000, y: sourceAnglePoint.y }, sourceAnglePoint],
              ];
              directions = ["ru", "u", "r"];
              break;
            }
            case 2: {
              lines = [
                [{ x: sourceAnglePoint.x, y: 10000 }, sourceAnglePoint],
                [{ x: 10000, y: sourceAnglePoint.y }, sourceAnglePoint],
              ];
              directions = ["r", "rd", "d"];
              break;
            }
            default: {
              lines = [
                [{ x: sourceAnglePoint.x, y: 10000 }, sourceAnglePoint],
                [{ x: 0, y: sourceAnglePoint.y }, sourceAnglePoint],
              ];
              directions = ["l", "ld", "d"];
              break;
            }
          }

          for (const destination of internalNodes.filter(
            (internalNode) => internalNode.id !== source
          )) {
            let line: Line | null = null;
            for (const destinationPoint of locateAngle(destination)) {
              const direction = calcDirection(
                sourceAnglePoint,
                destinationPoint
              );
              if (
                directions.indexOf(direction) > -1 &&
                (distanceOfPointToLine(destinationPoint, lines[0]) < 5 ||
                  distanceOfPointToLine(destinationPoint, lines[1]) < 5)
              ) {
                if (
                  line === null ||
                  distanceOfPoint2Point(destinationPoint, sourceAnglePoint) <
                    distanceOfPoint2Point(line[0], line[1])
                ) {
                  line = [destinationPoint, sourceAnglePoint];
                }
              }
            }
            if (line) {
              guidelines.push(line);
            }
          }
        }
      }
    }

    useImperativeHandle(ref, () => ({
      getData() {
        return {
          nodes: internalNodes,
          connections: internalConnections,
        };
      },
    }));

    return (
      <>
        <SVG
          id={"chart"}
          tabIndex={0}
          onKeyDown={handleSVGKeyDown}
          style={style}
          onDoubleClick={handleSVGDoubleClick}
          onMouseUp={handleSVGMouseUp}
          onMouseDown={handleSVGMouseDown}
          onMouseMove={handleSVGMouseMove}
        >
          {internalNodes?.map((node) => (
            <Node
              isSelected={currentNodes.some((item) => item === node.id)}
              isConnecting={connectingInfo !== undefined}
              data={node}
              onDoubleClick={(event) => {
                event.stopPropagation();
                onEditNode?.(node, setInternalNodes);
              }}
              onMouseDown={(event) => {
                if (event.ctrlKey || event.metaKey) {
                  const findIndex = currentNodes.findIndex(
                    (item) => item === node.id
                  );
                  if (findIndex === -1) {
                    setCurrentNodes([...currentNodes, node.id]);
                  } else {
                    setCurrentNodes(
                      update(currentNodes, {
                        $splice: [[findIndex, 1]],
                      })
                    );
                  }
                } else {
                  let tempCurrentNodes: number[] = currentNodes;
                  if (
                    !currentNodes.some((currentNode) => currentNode === node.id)
                  ) {
                    tempCurrentNodes = [node.id];
                    setCurrentNodes(tempCurrentNodes);
                  }
                  setCurrentConnections([]);
                  setDraggingInfo({
                    target: tempCurrentNodes,
                    delta: tempCurrentNodes.map((tempCurrentNode) => {
                      const find = internalNodes.find(
                        (item) => item.id === tempCurrentNode
                      )!;
                      return {
                        x: cursorToChartOffset.x - find.x,
                        y: cursorToChartOffset.y - find.y,
                      };
                    }),
                  });
                }
              }}
              onConnectorMouseDown={(position) => {
                if (node.type === "end") {
                  return;
                }

                setConnectingInfo({
                  source: node,
                  sourcePosition: position,
                });
              }}
            />
          ))}
          {internalConnections?.map((conn) => {
            return (
              <Connection
                isSelected={currentConnections.some(
                  (item) => conn.id === item.id
                )}
                onDoubleClick={() =>
                  onEditConnection?.(conn, setInternalConnections)
                }
                onMouseDown={(event) => {
                  if (event.ctrlKey || event.metaKey) {
                    const findIndex = currentConnections.findIndex(
                      (item) => item.id === conn.id
                    );
                    if (findIndex === -1) {
                      setCurrentConnections([...currentConnections, conn]);
                    } else {
                      setCurrentConnections(
                        update(currentConnections, {
                          $splice: [[findIndex, 1]],
                        })
                      );
                    }
                  } else {
                    setCurrentNodes([]);
                    setCurrentConnections([conn]);
                  }
                }}
                data={conn}
                nodes={internalNodes}
              />
            );
          })}
          {selectionInfo && (
            <rect
              stroke={"lightblue"}
              fill={"lightblue"}
              fillOpacity={0.8}
              x={
                getEdgeOfPoints([selectionInfo.start, selectionInfo.end]).start
                  .x
              }
              y={
                getEdgeOfPoints([selectionInfo.start, selectionInfo.end]).start
                  .y
              }
              width={
                getEdgeOfPoints([selectionInfo.start, selectionInfo.end]).end
                  .x -
                getEdgeOfPoints([selectionInfo.start, selectionInfo.end]).start
                  .x
              }
              height={
                getEdgeOfPoints([selectionInfo.start, selectionInfo.end]).end
                  .y -
                getEdgeOfPoints([selectionInfo.start, selectionInfo.end]).start
                  .y
              }
            />
          )}
          {connectingInfo && (
            <g>
              {points!.map((point, i) => {
                if (i > points!.length - 2) {
                  return <></>;
                }

                let source = points![i];
                let destination = points![i + 1];
                const isLast = i === points!.length - 2;
                const color = defaultConnectionColors.pass;
                const id = `arrow${color.replace("#", "")}`;
                return (
                  <>
                    <path
                      stroke={defaultConnectionColors.pass}
                      strokeWidth={1}
                      fill={"none"}
                      d={lineGenerator([source, destination])}
                      markerEnd={isLast ? `url(#${id})` : undefined}
                    />
                    {isLast && (
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
                    )}
                    <path
                      stroke={"transparent"}
                      strokeWidth={5}
                      fill={"none"}
                      d={lineGenerator([source, destination])}
                    />
                  </>
                );
              })}
            </g>
          )}
          {guidelines.map((guideline) => (
            <g>
              <line
                strokeDasharray={"3 3"}
                stroke={"#666666"}
                strokeWidth={1}
                fill={"none"}
                x1={guideline[0].x}
                y1={guideline[0].y}
                x2={guideline[1].x}
                y2={guideline[1].y}
              />
            </g>
          ))}
        </SVG>
      </>
    );
  }
);
