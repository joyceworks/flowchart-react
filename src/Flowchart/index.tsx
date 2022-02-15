import {
  forwardRef,
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import update from "immutability-helper";
import {
  ConnectionData,
  ConnectorPosition,
  Direction,
  DragConnectionInfo,
  DragMovingInfo,
  FlowchartProps,
  IFlowchart,
  Line,
  NodeData,
  Point,
  SelectionInfo,
} from "./schema";
import {
  calcCorners,
  calcDirection,
  calcIntersectedConnections,
  calcIntersectedNodes,
  center,
  createConnection,
  distanceOfPoint2Point,
  distanceOfPointToLine,
  locateAngle,
  locateConnector,
  pathing,
  render as defaultRender,
} from "./util";
import FlowchartNode from "./Node";
import FlowchartConnection from "./Connection/Connection";
import {defaultConnectionColors} from "./Connection/constant";
import "./index.css";

const Flowchart = forwardRef(
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
      render = defaultRender,
    }: FlowchartProps,
    ref: Ref<IFlowchart>
  ) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [internalNodes, setInternalNodes] = useState<NodeData[]>(
      defaultNodes
    );
    const [internalConnections, setInternalConnections] = useState<ConnectionData[]>(defaultConnections);
    useEffect(() => {
      setInternalConnections(defaultConnections);
      setInternalNodes(defaultNodes);
    }, [defaultConnections, defaultNodes]);
    const [selectedNodeIds, setSelectedNodeIds] = useState<number[]>([]);
    const [selectedConnections, setSelectedConnections] = useState<ConnectionData[]>([]);
    const [dragSelectionInfo, setDragSelectionInfo] = useState<SelectionInfo>();
    const [
      dragConnectionInfo,
      setDragConnectionInfo,
    ] = useState<DragConnectionInfo>();
    const [dragMovingInfo, setDragMovingInfo] = useState<DragMovingInfo>();
    const [zoom, setZoom] = useState<number>(1);
    const internalCenter = useCallback(() => {
      if (!svgRef.current) {
        return;
      }

      setInternalNodes((prevState) =>
        center(
          prevState,
          svgRef.current!.clientWidth,
          svgRef.current!.clientHeight
        )
      );
    }, []);
    const zoomIn = useCallback(() => {
      setZoom((prevState) => {
        const number = Number((prevState - 0.1).toFixed(1));
        return number < 0.6 ? 0.6 : number;
      });
    }, []);
    const zoomOut = useCallback(() => {
      setZoom((prevState) => {
        const number = Number((prevState + 0.1).toFixed(1));
        return number > 1 ? 1 : number;
      });
    }, []);
    const [offsetOfCursorToSVG, setOffsetOfCursorToSVG] = useState<Point>({
      x: 0,
      y: 0,
    });
    const handleWheel = useCallback(
      (event: React.WheelEvent<SVGSVGElement>) => {
        event.stopPropagation();
        event.preventDefault();
        if (event.ctrlKey || event.metaKey) {
          if (event.deltaY > 0 && zoom === 0.1) {
            return;
          }

          setZoom((prevState) => {
            const number = Number(
              (prevState - event.deltaY / 100 / 10).toFixed(1)
            );
            return number < 0.6 ? 0.6 : number > 1 ? 1 : number;
          });
        }
      },
      [zoom]
    );
    const handleSVGDoubleClick = useCallback(
      (event) => {
        if (readonly) {
          return;
        }
        const point = {
          x: event.nativeEvent.offsetX / zoom,
          y: event.nativeEvent.offsetY / zoom,
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
      [internalNodes, onCreateNode, readonly, zoom]
    );
    const handleSVGMouseDown = useCallback(
      (event) => {
        if (event.ctrlKey || event.metaKey || event.target.tagName !== "svg") {
          // ignore propagation
          return;
        }

        if (event.nativeEvent.which !== 1) {
          return;
        }

        const point = {
          x: event.nativeEvent.offsetX / zoom,
          y: event.nativeEvent.offsetY / zoom,
        };
        setDragSelectionInfo({
          start: point,
          end: point,
        });
        setSelectedNodeIds([]);
        setSelectedConnections([]);
      },
      [zoom]
    );
    const moveTo = useCallback(
      (id: number, x: number, y: number) => {
        const index = internalNodes.findIndex(
          (internalNode) => internalNode.id === id
        );
        setInternalNodes((prevState) =>
          update(prevState, {
            [index]: {
              x: {
                $set: x,
              },
              y: {
                $set: y,
              },
            },
          })
        );
      },
      [internalNodes]
    );
    const move = useCallback(
      (nodeIds: number[], x: number, y: number) => {
        if (readonly) {
          return;
        }

        const indexes = nodeIds.map((currentNode) =>
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
                  $apply: (prev: number) => prev + x,
                },
                y: {
                  $apply: (prev: number) => prev + y,
                },
              },
            });
          }
          return tempState;
        });
      },
      [internalNodes, readonly]
    );
    const handleSVGMouseMove = useCallback(
      (event) => {
        const newOffsetOfCursorToSVG: Point = {
          x: event.nativeEvent.offsetX / zoom,
          y: event.nativeEvent.offsetY / zoom,
        };

        setOffsetOfCursorToSVG(newOffsetOfCursorToSVG);

        if (dragSelectionInfo) {
          setDragSelectionInfo((prevState) => ({
            start: prevState!.start,
            end: newOffsetOfCursorToSVG,
          }));

          const edge = calcCorners([
            dragSelectionInfo.start,
            newOffsetOfCursorToSVG,
          ]);
          setSelectedNodeIds(
            calcIntersectedNodes(internalNodes, edge).map((item) => item.id)
          );
          setSelectedConnections(
            calcIntersectedConnections(internalNodes, internalConnections, edge)
          );
        } else if (dragMovingInfo) {
          for (let i = 0; i < dragMovingInfo.targetIds.length; i++) {
            const t = dragMovingInfo.targetIds[i];
            const delta = dragMovingInfo.deltas[i];
            moveTo(
              t,
              newOffsetOfCursorToSVG.x - delta.x,
              newOffsetOfCursorToSVG.y - delta.y
            );
          }
          setDragMovingInfo((prevState) => ({...prevState!, moved: true}));
        }
      },
      [
        zoom,
        dragSelectionInfo,
        dragMovingInfo,
        internalNodes,
        internalConnections,
        moveTo,
      ]
    );
    const moveSelected = useCallback(
      (x, y) => {
        move(selectedNodeIds, x, y);
      },
      [move, selectedNodeIds]
    );
    const remove = useCallback(() => {
      if (readonly) return;

      // Delete connections
      setInternalConnections((prevState) => {
        // Splice arguments of selected connections
        const list1: [
          number,
          number
        ][] = selectedConnections.map((currentConn) => [
          prevState.findIndex((interConn) => interConn.id === currentConn.id),
          1,
        ]);
        // Splice arguments of connections of selected nodes
        const list2: [number, number][] = selectedNodeIds
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
          $splice: selectedNodeIds
            .map((currNode) => [
              prevState.findIndex((interNode) => interNode.id === currNode),
              1,
            ])
            .sort((a, b) => b[0] - a[0]) as [number, number][],
        })
      );
    }, [selectedConnections, selectedNodeIds, internalConnections, readonly]);
    const handleSVGKeyDown = useCallback(
      (event) => {
        switch (event.keyCode) {
          case 37:
            moveSelected(-10, 0);
            break;
          case 38:
            moveSelected(0, -10);
            break;
          case 39:
            moveSelected(10, 0);
            break;
          case 40:
            moveSelected(0, 10);
            break;
          case 27:
            setSelectedNodeIds([]);
            setSelectedConnections([]);
            break;
          case 65:
            if (
              (event.ctrlKey || event.metaKey) &&
              document.activeElement === document.getElementById("chart")
            ) {
              setSelectedNodeIds([]);
              setSelectedConnections([]);
              setSelectedNodeIds(internalNodes.map((item) => item.id));
              setSelectedConnections([...selectedConnections]);
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
      [selectedConnections, internalNodes, moveSelected, remove]
    );
    const handleSVGMouseUp = useCallback(() => {
      setDragSelectionInfo(undefined);
      setDragConnectionInfo(undefined);
      setDragMovingInfo(undefined);

      // Align dragging node
      if (dragMovingInfo) {
        setInternalNodes((prevState) => {
          let result: NodeData[] = prevState;
          for (const t of dragMovingInfo.targetIds) {
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
      if (!dragConnectionInfo) {
        return;
      }
      let node: NodeData | null = null;
      let position: ConnectorPosition | null = null;
      for (const internalNode of internalNodes) {
        const locations = locateConnector(internalNode);
        for (const prop in locations) {
          const entry = locations[prop as ConnectorPosition];
          if (distanceOfPoint2Point(entry, offsetOfCursorToSVG) < 6) {
            node = internalNode;
            position = prop as ConnectorPosition;
          }
        }
      }
      if (!node || !position) {
        return;
      }
      if (dragConnectionInfo.source.id === node.id) {
        // Node can not connect to itself
        return;
      }
      const newConnection = createConnection(
        dragConnectionInfo.source.id,
        dragConnectionInfo.sourcePosition,
        node.id,
        position
      );
      onCreateConnection?.(newConnection, setInternalConnections);
    }, [
      dragConnectionInfo,
      offsetOfCursorToSVG,
      dragMovingInfo,
      internalNodes,
      onCreateConnection,
    ]);

    const points = useMemo(() => {
      let points: [number, number][] | undefined = undefined;
      if (dragConnectionInfo) {
        let endPosition: ConnectorPosition | null = null;
        for (const internalNode of internalNodes) {
          const locations = locateConnector(internalNode);
          for (const prop in locations) {
            const entry = locations[prop as ConnectorPosition];
            if (distanceOfPoint2Point(entry, offsetOfCursorToSVG) < 6) {
              endPosition = prop as ConnectorPosition;
            }
          }
        }

        points = pathing(
          locateConnector(dragConnectionInfo.source)[
            dragConnectionInfo.sourcePosition
            ],
          offsetOfCursorToSVG!,
          dragConnectionInfo.sourcePosition,
          endPosition
        );
      }
      return points;
    }, [dragConnectionInfo, internalNodes, offsetOfCursorToSVG]);

    const guidelines = useMemo(() => {
      const guidelines: Line[] = [];
      if (dragMovingInfo) {
        for (const source of dragMovingInfo.targetIds) {
          const sourceAnglePoints = locateAngle(
            internalNodes.find((item) => item.id === source)!
          );
          for (let i = 0; i < sourceAnglePoints.length; i++) {
            const sourceAnglePoint = {
              x: Math.round(Math.round(sourceAnglePoints[i].x) / 10) * 10,
              y: Math.round(Math.round(sourceAnglePoints[i].y) / 10) * 10,
            };

            let lines: Line[];
            let directions: Direction[];
            switch (i) {
              case 0: {
                lines = [
                  [{x: sourceAnglePoint.x, y: 0}, sourceAnglePoint],
                  [{x: 0, y: sourceAnglePoint.y}, sourceAnglePoint],
                ];
                directions = ["lu", "u", "l"];
                break;
              }
              case 1: {
                lines = [
                  [{x: sourceAnglePoint.x, y: 0}, sourceAnglePoint],
                  // todo: replace 10000 with the width of svg
                  [{x: 10000, y: sourceAnglePoint.y}, sourceAnglePoint],
                ];
                directions = ["ru", "u", "r"];
                break;
              }
              case 2: {
                lines = [
                  [{x: sourceAnglePoint.x, y: 10000}, sourceAnglePoint],
                  [{x: 10000, y: sourceAnglePoint.y}, sourceAnglePoint],
                ];
                directions = ["r", "rd", "d"];
                break;
              }
              default: {
                lines = [
                  [{x: sourceAnglePoint.x, y: 10000}, sourceAnglePoint],
                  [{x: 0, y: sourceAnglePoint.y}, sourceAnglePoint],
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
      return guidelines;
    }, [dragMovingInfo, internalNodes]);

    useImperativeHandle(ref, () => ({
      getData() {
        return {
          nodes: internalNodes,
          connections: internalConnections,
        };
      },
    }));

    const selectionAreaCorners = useMemo(
      () =>
        dragSelectionInfo
          ? calcCorners([dragSelectionInfo.start, dragSelectionInfo.end])
          : undefined,
      [dragSelectionInfo]
    );
    const svgStyle = useMemo(
      () => ({
        zoom,
      }),
      [zoom]
    );

    const nodeElements = useMemo(() => {
      return internalNodes?.map((node) => (
        <FlowchartNode
          readonly={readonly}
          render={render}
          key={node.id}
          isSelected={selectedNodeIds.some((item) => item === node.id)}
          isConnecting={dragConnectionInfo !== undefined}
          data={node}
          onDoubleClick={(event) => {
            event.stopPropagation();
            if (readonly) {
              return;
            }
            onEditNode?.(node, setInternalNodes);
          }}
          onMouseDown={(event) => {
            if (event.ctrlKey || event.metaKey) {
              const findIndex = selectedNodeIds.findIndex(
                (item) => item === node.id
              );
              if (findIndex === -1) {
                setSelectedNodeIds([...selectedNodeIds, node.id]);
              } else {
                setSelectedNodeIds(
                  update(selectedNodeIds, {
                    $splice: [[findIndex, 1]],
                  })
                );
              }
            } else {
              let tempCurrentNodes: number[] = selectedNodeIds;
              if (
                !selectedNodeIds.some((currentNode) => currentNode === node.id)
              ) {
                tempCurrentNodes = [node.id];
                setSelectedNodeIds(tempCurrentNodes);
              }
              setSelectedConnections([]);
              if (readonly) {
                return;
              }
              setDragMovingInfo({
                targetIds: tempCurrentNodes,
                deltas: tempCurrentNodes.map((tempCurrentNode) => {
                  const find = internalNodes.find(
                    (item) => item.id === tempCurrentNode
                  )!;
                  return {
                    x: offsetOfCursorToSVG.x - find.x,
                    y: offsetOfCursorToSVG.y - find.y,
                  };
                }),
              });
            }
          }}
          onConnectorMouseDown={(position) => {
            if (node.type === "end") {
              return;
            }

            setDragConnectionInfo({
              source: node,
              sourcePosition: position,
            });
          }}
        />
      ));
    }, [
      dragConnectionInfo,
      internalNodes,
      offsetOfCursorToSVG.x,
      offsetOfCursorToSVG.y,
      onEditNode,
      readonly,
      render,
      selectedNodeIds,
    ]);

    const connectionElements = useMemo(
      () =>
        internalConnections?.map((conn) => {
          return (
            <FlowchartConnection
              key={conn.id}
              isSelected={selectedConnections.some(
                (item) => conn.id === item.id
              )}
              onDoubleClick={() =>
                onEditConnection?.(conn, setInternalConnections)
              }
              onMouseDown={(event) => {
                if (event.ctrlKey || event.metaKey) {
                  const findIndex = selectedConnections.findIndex(
                    (item) => item.id === conn.id
                  );
                  if (findIndex === -1) {
                    setSelectedConnections([...selectedConnections, conn]);
                  } else {
                    setSelectedConnections(
                      update(selectedConnections, {
                        $splice: [[findIndex, 1]],
                      })
                    );
                  }
                } else {
                  setSelectedNodeIds([]);
                  setSelectedConnections([conn]);
                }
              }}
              data={conn}
              nodes={internalNodes}
            />
          );
        }),
      [
        internalConnections,
        internalNodes,
        onEditConnection,
        selectedConnections,
      ]
    );

    const guidelineElements = useMemo(
      () =>
        dragMovingInfo &&
        dragMovingInfo.moved &&
        guidelines.map((guideline, index) => (
          <g key={index}>
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
        )),
      [dragMovingInfo, guidelines]
    );

    return (
      <div style={style} className={"flowchart-container"}>
        <div className={"flowchart-zoom"}>
          <button style={{border: "none", backgroundColor: "transparent"}} onClick={zoomIn}>
            <svg viewBox="64 64 896 896" focusable="false" data-icon="minus" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M872 474H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h720c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z"></path></svg>
          </button>
          <span style={{display: "inline-block", width: 40, textAlign: "center"}}>
            {zoom * 100}%
          </span>
          <button style={{border: "none", backgroundColor: "transparent"}} onClick={zoomOut}>
            <svg viewBox="64 64 896 896" focusable="false" data-icon="plus" width="1em" height="1em" fill="currentColor" aria-hidden="true"><defs><style></style></defs><path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"></path><path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z"></path></svg>
          </button>
          {!readonly && (
            <button style={{border: "none", backgroundColor: "transparent"}} onClick={internalCenter}>
              <svg viewBox="64 64 896 896" focusable="false" data-icon="align-center" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M264 230h496c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H264c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm496 424c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H264c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h496zm144 140H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0-424H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z"></path></svg>
            </button>
          )}
        </div>
        <svg
          ref={svgRef}
          className={"flowchart-svg"}
          style={svgStyle}
          id={"chart"}
          tabIndex={0}
          onKeyDown={handleSVGKeyDown}
          onWheel={handleWheel}
          onDoubleClick={handleSVGDoubleClick}
          onMouseUp={handleSVGMouseUp}
          onMouseDown={handleSVGMouseDown}
          onMouseMove={handleSVGMouseMove}
        >
          {nodeElements}
          {connectionElements}
          {selectionAreaCorners && (
            <rect
              stroke={"lightblue"}
              fill={"lightblue"}
              fillOpacity={0.8}
              x={selectionAreaCorners.start.x}
              y={selectionAreaCorners.start.y}
              width={selectionAreaCorners.end.x - selectionAreaCorners.start.x}
              height={selectionAreaCorners.end.y - selectionAreaCorners.start.y}
            />
          )}
          {dragConnectionInfo && (
            <g>
              {points!.map((point, i) => {
                if (i > points!.length - 2) {
                  return <></>;
                }

                const source = points![i];
                const destination = points![i + 1];
                const isLast = i === points!.length - 2;
                const color = defaultConnectionColors.pass;
                const id = `arrow${color.replace("#", "")}`;
                return (
                  <>
                    <path
                      stroke={defaultConnectionColors.pass}
                      strokeWidth={1}
                      fill={"none"}
                      d={`M ${source[0]} ${source[1]} L ${destination[0]} ${destination[1]}`}
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
                        <path d={"M2,2 L10,6 L2,10 L6,6 L2,2"} fill={color}/>
                      </marker>
                    )}
                    <path
                      stroke={"transparent"}
                      strokeWidth={5}
                      fill={"none"}
                      d={`M ${source[0]} ${source[1]} L ${destination[0]} ${destination[1]}`}
                    />
                  </>
                );
              })}
            </g>
          )}
          {guidelineElements}
        </svg>
      </div>
    );
  }
);
export default Flowchart;
