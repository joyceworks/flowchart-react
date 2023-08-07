import React, {
  forwardRef,
  Ref,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import update from "immutability-helper";
import {
  ConnectorPosition,
  DragConnectingInfo,
  DragCreatingInfo,
  DragMovingInfo,
  ControlInfo,
  FlowchartProps,
  IFlowchart,
  Line,
  NodeData,
  NodeType,
  Point,
  SelectingInfo,
} from "./schema";
import {
  calcCorners,
  calcGuidelines,
  calcIntersectedConnections,
  calcIntersectedNodes,
  center,
  createConnection,
  distanceOfP2P,
  locateConnector,
  pathing,
  roundTo10,
} from "./util";
import Node from "./Node";
import { Connection } from "./Connection";
import "./index.css";
import "./output.css";
import StartEndNode from "./Node/StartEndNode";
import OperationNode from "./Node/OperationNode";
import { iconAlign, newNode, templateNode } from "./constant";
import { GuideLine } from "./GuideLine";
import { PendingConnection } from "./PendingConnection";
import { DecisionNode } from "./Node/DecisionNode";

const Flowchart = forwardRef(
  (
    {
      nodes,
      connections,
      readonly = false,
      onNodeDoubleClick,
      onConnectionDoubleClick: onConnDoubleClick,
      onDoubleClick,
      onChange,
      onMouseUp,
      style,
      defaultNodeSize = { width: 120, height: 60 },
      showToolbar,
      connectionPosition = "top",
      className,
    }: FlowchartProps,
    ref: Ref<IFlowchart>
  ) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedNodeIds, setSelectedNodeIds] = useState<number[]>([]);
    const [selectedConnIds, setSelectedConnIds] = useState<number[]>([]);
    const [selectingInfo, setSelectingInfo] = useState<SelectingInfo>();
    const [connectingInfo, setConnectingInfo] = useState<DragConnectingInfo>();
    const [controlInfo, setControlInfo] = useState<ControlInfo>();
    const [movingInfo, setMovingInfo] = useState<DragMovingInfo>();
    const [creatingInfo, setCreatingInfo] = useState<DragCreatingInfo>();
    const [zoom, setZoom] = useState<number>(1);
    const internalCenter = useCallback(() => {
      if (!svgRef.current) {
        return;
      }

      onChange?.(
        center(nodes, svgRef.current.clientWidth, svgRef.current.clientHeight),
        connections
      );
    }, [connections, nodes, onChange]);
    const zoomIn = useCallback(() => {
      setZoom((prevState) => {
        const number = Number((prevState - 0.1).toFixed(1));
        return number < 0.1 ? 0.1 : number;
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
        if (event.ctrlKey || event.metaKey) {
          if (event.deltaY > 0 && zoom === 0.1) {
            return;
          }

          setZoom((prev) => {
            const number = Number((prev - event.deltaY / 100 / 10).toFixed(1));
            return number < 0.6 ? 0.6 : number > 1 ? 1 : number;
          });
        }
      },
      [zoom]
    );
    const handleSVGDoubleClick = useCallback(
      (event) => onDoubleClick?.(event, zoom),
      [onDoubleClick, zoom]
    );
    const handleSVGMouseDown = useCallback(
      (event) => {
        if (event.ctrlKey || event.metaKey || event.target.tagName !== "svg") {
          // ignore propagation
          return;
        }

        if (event.nativeEvent.button !== 0) {
          return;
        }

        const point = {
          x: event.nativeEvent.offsetX / zoom,
          y: event.nativeEvent.offsetY / zoom,
        };
        setSelectingInfo({ start: point, end: point });
        setSelectedNodeIds([]);
        setSelectedConnIds([]);
      },
      [zoom]
    );
    const moveTo = useCallback(
      (nodes: NodeData[], id: number, x: number, y: number): NodeData[] => {
        const index = nodes.findIndex((internalNode) => internalNode.id === id);
        return update(nodes, { [index]: { x: { $set: x }, y: { $set: y } } });
      },
      []
    );
    const move = useCallback(
      (nodeIds: number[], x: number, y: number) => {
        if (readonly) {
          return;
        }

        const indexes = nodeIds.map((currentNode) =>
          nodes.findIndex((internalNode) => internalNode.id === currentNode)
        );

        let tempState = nodes;
        for (const index of indexes) {
          tempState = update(tempState, {
            [index]: {
              x: { $apply: (prev) => prev + x },
              y: { $apply: (prev) => prev + y },
            },
          });
        }
        onChange?.(tempState, connections);
      },
      [connections, nodes, onChange, readonly]
    );
    const handleSVGMouseMove = useCallback(
      (event) => {
        const newOffsetOfCursorToSVG: Point = {
          x: event.nativeEvent.offsetX / zoom,
          y: event.nativeEvent.offsetY / zoom,
        };

        setOffsetOfCursorToSVG(newOffsetOfCursorToSVG);

        if (selectingInfo) {
          setSelectingInfo((prevState) => ({
            start: prevState!.start,
            end: newOffsetOfCursorToSVG,
          }));

          const edge = calcCorners([
            selectingInfo.start,
            newOffsetOfCursorToSVG,
          ]);
          setSelectedNodeIds(
            calcIntersectedNodes(nodes, edge).map((item) => item.id)
          );
          setSelectedConnIds(
            calcIntersectedConnections(nodes, connections, edge).map(
              (item, index) => index
            )
          );
        } else if (movingInfo) {
          let currentNodes: NodeData[] = nodes;
          for (let i = 0; i < movingInfo.targetIds.length; i++) {
            const t = movingInfo.targetIds[i];
            const delta = movingInfo.deltas[i];
            currentNodes = moveTo(
              currentNodes,
              t,
              newOffsetOfCursorToSVG.x - delta.x,
              newOffsetOfCursorToSVG.y - delta.y
            );
          }
          onChange?.(currentNodes, connections);
          setMovingInfo((prevState) => ({ ...prevState!, moved: true }));
        } else if (controlInfo) {
          const index = nodes.findIndex(
            (it) => it.id === controlInfo.targetId
          )!;
          const node = nodes[index]!;
          let patch: { x: number; y: number; width: number; height: number };
          const finalWidth = node.width || 120;
          const finalHeight = node.height || 60;
          const maxX = node.x + finalWidth;
          const maxY = node.y + finalHeight;
          switch (controlInfo.direction) {
            case "u":
              patch = {
                x: node.x,
                y: newOffsetOfCursorToSVG.y,
                width: finalWidth,
                height: maxY - newOffsetOfCursorToSVG.y,
              };
              break;
            case "d":
              patch = {
                x: node.x,
                y: node.y,
                width: finalWidth,
                height: newOffsetOfCursorToSVG.y - node.y,
              };
              break;
            case "l":
              patch = {
                x: newOffsetOfCursorToSVG.x,
                y: node.y,
                width: maxX - newOffsetOfCursorToSVG.x,
                height: finalHeight,
              };
              break;
            case "r":
              patch = {
                x: node.x,
                y: node.y,
                width: newOffsetOfCursorToSVG.x - node.x,
                height: finalHeight,
              };
              break;
            case "lu":
              patch = {
                x: newOffsetOfCursorToSVG.x,
                y: newOffsetOfCursorToSVG.y,
                width: maxX - newOffsetOfCursorToSVG.x,
                height: maxY - newOffsetOfCursorToSVG.y,
              };
              break;
            case "ru":
              patch = {
                x: node.x,
                y: newOffsetOfCursorToSVG.y,
                width: newOffsetOfCursorToSVG.x - node.x,
                height: maxY - newOffsetOfCursorToSVG.y,
              };
              break;
            case "ld":
              patch = {
                x: newOffsetOfCursorToSVG.x,
                y: node.y,
                width: maxX - newOffsetOfCursorToSVG.x,
                height: newOffsetOfCursorToSVG.y - node.y,
              };
              break;
            default:
              patch = {
                x: node.x,
                y: node.y,
                width: newOffsetOfCursorToSVG.x - node.x,
                height: newOffsetOfCursorToSVG.y - node.y,
              };
              break;
          }
          if (patch.x >= maxX) {
            patch.x = maxX - 10;
            patch.width = 10;
          }
          if (patch.y >= maxY) {
            patch.y = maxY - 10;
            patch.height = 10;
          }
          if (patch.width <= 0) {
            patch.width = 10;
          }
          if (patch.height <= 0) {
            patch.height = 10;
          }
          onChange?.(
            update(nodes, {
              [index]: {
                $set: { ...node, ...patch! },
              },
            }),
            connections
          );
        }
      },
      [
        zoom,
        selectingInfo,
        movingInfo,
        controlInfo,
        nodes,
        connections,
        onChange,
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

      // Splice arguments of selected connections
      const list1: [number, number][] = selectedConnIds.map((currentConn) => [
        connections.findIndex((interConn, index) => index === currentConn),
        1,
      ]);
      // Splice arguments of connections of selected nodes
      const list2: [number, number][] = selectedNodeIds
        .map((item) =>
          connections.filter(
            (interConn) =>
              interConn.source.id === item || interConn.destination.id === item
          )
        )
        .flat()
        .map((currentConn) => [
          connections.findIndex((interConn) => interConn === currentConn),
          1,
        ]);
      const restConnections = update(connections, {
        $splice: [...list1, ...list2].sort((a, b) => b[0] - a[0]),
      });

      const restNodes = update(nodes, {
        $splice: selectedNodeIds
          .map((currNode) => [
            nodes.findIndex((interNode) => interNode.id === currNode),
            1,
          ])
          .sort((a, b) => b[0] - a[0]) as [number, number][],
      });

      onChange?.(restNodes, restConnections);
    }, [
      readonly,
      selectedConnIds,
      selectedNodeIds,
      connections,
      nodes,
      onChange,
    ]);
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
            setSelectedConnIds([]);
            break;
          case 65:
            if (
              (event.ctrlKey || event.metaKey) &&
              document.activeElement === document.getElementById("chart")
            ) {
              setSelectedNodeIds([]);
              setSelectedConnIds([]);
              setSelectedNodeIds(nodes.map((item) => item.id));
              setSelectedConnIds([...selectedConnIds]);
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
      [moveSelected, remove, nodes, selectedConnIds]
    );

    const handleSVGMouseUp = useCallback(
      (event: React.MouseEvent<SVGSVGElement>) => {
        setSelectingInfo(undefined);
        setConnectingInfo(undefined);
        setMovingInfo(undefined);
        setControlInfo(undefined);

        // Align dragging node
        if (movingInfo) {
          let result: NodeData[] = nodes;
          for (const t of movingInfo.targetIds) {
            result = update(result, {
              [result.findIndex((item) => item.id === t)]: {
                x: { $apply: roundTo10 },
                y: { $apply: roundTo10 },
              },
            });
          }
          onChange?.(result, connections);
        }

        // Connect nodes
        if (connectingInfo) {
          let node: NodeData | null = null;
          let position: ConnectorPosition | null = null;
          for (const internalNode of nodes) {
            const locations = locateConnector(internalNode);
            for (const prop in locations) {
              const entry = locations[prop as ConnectorPosition];
              if (distanceOfP2P(entry, offsetOfCursorToSVG) < 6) {
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
          if (
            connections.find(
              (item) =>
                item.source.id === connectingInfo.source.id &&
                item.source.position === connectingInfo.sourcePosition &&
                item.destination.id === node!.id &&
                item.destination.position === position
            )
          ) {
            return;
          }
          const newConnection = createConnection(
            connectingInfo.source.id,
            connectingInfo.sourcePosition,
            node.id,
            position
          );
          onChange?.(nodes, [...connections, newConnection]);
          onMouseUp?.(event, zoom);
        }

        if (creatingInfo) {
          const nativeEvent = event.nativeEvent;
          const point = {
            x:
              roundTo10(nativeEvent.offsetX - defaultNodeSize.width / 2) / zoom,
            y:
              roundTo10(nativeEvent.offsetY - defaultNodeSize.height / 2) /
              zoom,
            id: +new Date(),
            title: "New Item",
          };
          onChange?.(
            [...nodes, { type: creatingInfo.type, ...point }],
            connections
          );
        }

        if (controlInfo) {
          const index = nodes.findIndex(
            (it) => it.id === controlInfo.targetId
          )!;
          switch (controlInfo.direction) {
            case "u":
              onChange?.(
                update(nodes, {
                  [index]: {
                    $apply: (it) => {
                      const newY = roundTo10(it.y);
                      const maxY = it.height! + it.y;
                      return {
                        ...it,
                        y: newY,
                        height: maxY - newY,
                      };
                    },
                  },
                }),
                connections
              );
              break;
            case "d":
              onChange?.(
                update(nodes, {
                  [index]: {
                    $apply: (it) => {
                      const maxY = roundTo10(it.height! + it.y);
                      return {
                        ...it,
                        height: maxY - it.y,
                      };
                    },
                  },
                }),
                connections
              );
              break;
            case "l":
              onChange?.(
                update(nodes, {
                  [index]: {
                    $apply: (it) => {
                      const newX = roundTo10(it.x);
                      const maxX = it.width! + it.x;
                      return {
                        ...it,
                        x: newX,
                        width: maxX - newX,
                      };
                    },
                  },
                }),
                connections
              );
              break;
            case "r":
              onChange?.(
                update(nodes, {
                  [index]: {
                    $apply: (it) => {
                      const maxX = roundTo10(it.width! + it.x);
                      return {
                        ...it,
                        width: maxX - it.x,
                      };
                    },
                  },
                }),
                connections
              );
              break;
            case "lu":
              onChange?.(
                update(nodes, {
                  [index]: {
                    $apply: (it) => {
                      const newX = roundTo10(it.x);
                      const newY = roundTo10(it.y);
                      const maxX = it.width! + it.x;
                      const maxY = it.height! + it.y;
                      return {
                        ...it,
                        x: newX,
                        y: newY,
                        width: maxX - newX,
                        height: maxY - newY,
                      };
                    },
                  },
                }),
                connections
              );
              break;
            case "ru":
              onChange?.(
                update(nodes, {
                  [index]: {
                    $apply: (it) => {
                      const newY = roundTo10(it.y);
                      const maxY = it.height! + it.y;
                      return {
                        ...it,
                        y: newY,
                        width: roundTo10(it.width!),
                        height: maxY - newY,
                      };
                    },
                  },
                }),
                connections
              );
              break;
            case "ld":
              onChange?.(
                update(nodes, {
                  [index]: {
                    $apply: (it) => {
                      const newX = roundTo10(it.x);
                      const maxX = it.width! + it.x;
                      return {
                        ...it,
                        x: newX,
                        width: maxX - newX,
                        height: roundTo10(it.height!),
                      };
                    },
                  },
                }),
                connections
              );
              break;
            case "rd":
              onChange?.(
                update(nodes, {
                  [index]: {
                    $apply: (it) => {
                      return {
                        ...it,
                        width: roundTo10(it.width!),
                        height: roundTo10(it.height!),
                      };
                    },
                  },
                }),
                connections
              );
              break;
          }
        }
      },
      [
        movingInfo,
        connectingInfo,
        creatingInfo,
        controlInfo,
        nodes,
        onChange,
        connections,
        onMouseUp,
        zoom,
        offsetOfCursorToSVG,
        defaultNodeSize.width,
        defaultNodeSize.height,
      ]
    );

    /**
     * Points of connecting line
     */
    const points = useMemo(() => {
      let points: [number, number][] = [];
      if (connectingInfo) {
        let endPosition: ConnectorPosition | null = null;
        for (const internalNode of nodes) {
          const locations = locateConnector(internalNode);
          for (const prop in locations) {
            const entry = locations[prop as ConnectorPosition];
            if (distanceOfP2P(entry, offsetOfCursorToSVG) < 6) {
              endPosition = prop as ConnectorPosition;
            }
          }
        }

        points = pathing(
          locateConnector(connectingInfo.source)[connectingInfo.sourcePosition],
          offsetOfCursorToSVG!,
          connectingInfo.sourcePosition,
          endPosition
        );
      }
      return points;
    }, [nodes, connectingInfo, offsetOfCursorToSVG]);

    const guidelines = useMemo(() => {
      const guidelines: Line[] = [];
      if (movingInfo) {
        for (const source of movingInfo.targetIds) {
          guidelines.push(
            ...calcGuidelines(nodes.find((item) => item.id === source)!, nodes)
          );
        }
      } else if (creatingInfo) {
        guidelines.push(
          ...calcGuidelines(
            {
              id: +new Date(),
              x: offsetOfCursorToSVG.x - defaultNodeSize.width / 2,
              y: offsetOfCursorToSVG.y - defaultNodeSize.height / 2,
            },
            nodes
          )
        );
      } else if (controlInfo) {
        guidelines.push(
          ...calcGuidelines(
            nodes.find((item) => item.id === controlInfo.targetId)!,
            nodes
          )
        );
      }
      return guidelines;
    }, [
      movingInfo,
      creatingInfo,
      controlInfo,
      nodes,
      offsetOfCursorToSVG.x,
      offsetOfCursorToSVG.y,
      defaultNodeSize.width,
      defaultNodeSize.height,
    ]);

    useImperativeHandle(ref, () => ({
      getData() {
        return { nodes, connections };
      },
    }));

    const selectionAreaCorners = useMemo(
      () =>
        selectingInfo
          ? calcCorners([selectingInfo.start, selectingInfo.end])
          : undefined,
      [selectingInfo]
    );
    const zoomStyle = useMemo(
      () => ({
        zoom,
      }),
      [zoom]
    );

    const nodeElements = useMemo(() => {
      return nodes?.map((node) => {
        const formattedNode: NodeData = {
          ...node,
          width: node.width || defaultNodeSize.width,
          height: node.height || defaultNodeSize.height,
        };
        return (
          <Node
            readonly={readonly}
            key={formattedNode.id}
            isSelected={selectedNodeIds.some(
              (item) => item === formattedNode.id
            )}
            isConnecting={!!connectingInfo}
            data={formattedNode}
            onDoubleClick={(event) => {
              event.stopPropagation();
              if (readonly) {
                return;
              }
              onNodeDoubleClick?.(formattedNode);
            }}
            onMouseDown={(event) => {
              if (event.nativeEvent.button !== 0) {
                return;
              }
              if (event.ctrlKey || event.metaKey) {
                const index = selectedNodeIds.findIndex(
                  (item) => item === formattedNode.id
                );
                if (index === -1) {
                  setSelectedNodeIds([...selectedNodeIds, formattedNode.id]);
                } else {
                  setSelectedNodeIds(
                    update(selectedNodeIds, { $splice: [[index, 1]] })
                  );
                }
              } else {
                let tempCurrentNodes: number[] = selectedNodeIds;
                if (!selectedNodeIds.some((id) => id === formattedNode.id)) {
                  tempCurrentNodes = [formattedNode.id];
                  setSelectedNodeIds(tempCurrentNodes);
                }
                setSelectedConnIds([]);
                if (readonly) {
                  return;
                }
                setMovingInfo({
                  targetIds: tempCurrentNodes,
                  deltas: tempCurrentNodes.map((tempCurrentNode) => {
                    const find = nodes.find(
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
              if (formattedNode.type === "end") {
                return;
              }
              setConnectingInfo({
                source: formattedNode,
                sourcePosition: position,
              });
            }}
            onControllerMouseDown={(direction) => {
              setControlInfo({
                direction,
                targetId: formattedNode.id,
              });
            }}
          />
        );
      });
    }, [
      nodes,
      defaultNodeSize.width,
      defaultNodeSize.height,
      readonly,
      selectedNodeIds,
      connectingInfo,
      onNodeDoubleClick,
      offsetOfCursorToSVG.x,
      offsetOfCursorToSVG.y,
    ]);

    const connectionElements = useMemo(
      () =>
        connections?.map((conn, index) => {
          return (
            <Connection
              key={
                conn.source.id +
                conn.source.position +
                conn.destination.id +
                conn.destination.position
              }
              isSelected={selectedConnIds.some((item) => index === item)}
              onDoubleClick={() => onConnDoubleClick?.(conn)}
              onMouseDown={(event) => {
                if (event.ctrlKey || event.metaKey) {
                  const i = selectedConnIds.findIndex((item) => item === index);
                  if (i === -1) {
                    setSelectedConnIds((prevState) => [...prevState, index]);
                  } else {
                    setSelectedConnIds((prev) =>
                      update(prev, { $splice: [[i, 1]] })
                    );
                  }
                } else {
                  setSelectedNodeIds([]);
                  setSelectedConnIds([index]);
                }
              }}
              data={conn}
              nodes={nodes}
            />
          );
        }),
      [connections, selectedConnIds, nodes, onConnDoubleClick]
    );

    const handleToolbarMouseDown = useCallback(
      (type: NodeType, event: React.MouseEvent<HTMLDivElement>) => {
        const rect = containerRef.current!.getBoundingClientRect();
        setCreatingInfo({
          type,
          x: event.clientX - rect.x - (defaultNodeSize.width * zoom) / 2,
          y: event.clientY - rect.y - (defaultNodeSize.height * zoom) / 2,
        });
      },
      [defaultNodeSize.height, defaultNodeSize.width, zoom]
    );

    const handleContainerMouseUp = useCallback(() => {
      setCreatingInfo(undefined);
    }, []);

    const handleContainerMouseMove = useCallback(
      (event: React.MouseEvent<HTMLDivElement> | undefined) => {
        if (!event || !creatingInfo) {
          return;
        }

        const rect = containerRef.current!.getBoundingClientRect();
        setCreatingInfo({
          ...creatingInfo,
          x: event.clientX - rect.x - (defaultNodeSize.width * zoom) / 2,
          y: event.clientY - rect.y - (defaultNodeSize.height * zoom) / 2,
        });
      },
      [defaultNodeSize.height, defaultNodeSize.width, creatingInfo, zoom]
    );

    return (
      <>
        <div
          style={style}
          ref={containerRef}
          className={"flowchart-container " + (className || "")}
          onMouseUp={handleContainerMouseUp}
          onMouseMove={handleContainerMouseMove}
        >
          <div
            className={
              "absolute top-2 right-2 flex items-center justify-center"
            }
          >
            <button className={"border-none bg-transparent"} onClick={zoomIn}>
              -
            </button>
            <button className={"border-none bg-transparent"}>
              {zoom * 100}%
            </button>
            <button className={"border-none bg-transparent"} onClick={zoomOut}>
              +
            </button>
            {!readonly && (
              <button
                className={"border-none bg-transparent"}
                onClick={internalCenter}
              >
                {iconAlign}
              </button>
            )}
          </div>
          <div className={"w-full h-full inline-flex"}>
            {readonly || showToolbar === false ? (
              <></>
            ) : (
              <div className={"flowchart-toolbar"}>
                {showToolbar === true ||
                (Array.isArray(showToolbar) &&
                  showToolbar.includes("start-end")) ? (
                  <div
                    onMouseDown={(event) =>
                      handleToolbarMouseDown("start", event)
                    }
                  >
                    <svg className={"flowchart-toolbar-item"}>
                      <StartEndNode data={templateNode} />
                    </svg>
                  </div>
                ) : (
                  <></>
                )}
                {showToolbar === true ||
                (Array.isArray(showToolbar) &&
                  showToolbar.includes("operation")) ? (
                  <div
                    onMouseDown={(event) =>
                      handleToolbarMouseDown("operation", event)
                    }
                  >
                    <svg className={"flowchart-toolbar-item"}>
                      <OperationNode data={templateNode} />
                    </svg>
                  </div>
                ) : (
                  <></>
                )}
                {showToolbar === true ||
                (Array.isArray(showToolbar) &&
                  showToolbar.includes("decision")) ? (
                  <div
                    onMouseDown={(event) =>
                      handleToolbarMouseDown("decision", event)
                    }
                  >
                    <svg className={"flowchart-toolbar-item"}>
                      <DecisionNode data={templateNode} />
                    </svg>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            )}
            <svg
              ref={svgRef}
              className={"flowchart-svg"}
              style={zoomStyle}
              id={"chart"}
              tabIndex={0}
              onKeyDown={handleSVGKeyDown}
              onWheel={handleWheel}
              onDoubleClick={handleSVGDoubleClick}
              onMouseUp={handleSVGMouseUp}
              onMouseDown={handleSVGMouseDown}
              onMouseMove={handleSVGMouseMove}
            >
              {connectionPosition === "bottom" ? connectionElements : <></>}
              {nodeElements}
              {connectionPosition === "top" || !connectionPosition ? (
                connectionElements
              ) : (
                <></>
              )}
              {selectionAreaCorners && (
                <rect
                  stroke={"lightblue"}
                  fill={"lightblue"}
                  fillOpacity={0.8}
                  x={selectionAreaCorners.start.x}
                  y={selectionAreaCorners.start.y}
                  width={
                    selectionAreaCorners.end.x - selectionAreaCorners.start.x
                  }
                  height={
                    selectionAreaCorners.end.y - selectionAreaCorners.start.y
                  }
                />
              )}
              <PendingConnection points={points} />
              {guidelines.map((guideline, index) => (
                <GuideLine line={guideline} key={index} />
              ))}
            </svg>
          </div>
          {creatingInfo ? (
            <div
              className={"pointer-events-none absolute"}
              style={{
                left: creatingInfo.x,
                top: creatingInfo.y,
                width: defaultNodeSize.width * zoom,
                height: defaultNodeSize.height * zoom,
              }}
            >
              <svg style={zoomStyle}>
                {creatingInfo.type === "start" ? (
                  <StartEndNode data={newNode} />
                ) : creatingInfo.type === "decision" ? (
                  <DecisionNode data={newNode} />
                ) : (
                  <OperationNode data={newNode} />
                )}
              </svg>
            </div>
          ) : (
            <></>
          )}
        </div>
      </>
    );
  }
);
export default Flowchart;
