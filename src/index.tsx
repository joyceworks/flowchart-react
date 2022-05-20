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
} from "./util";
import Node from "./Node";
import { Connection } from "./Connection";
import "./index.css";
import StartEndNode from "./Node/StartEndNode";
import OperationNode from "./Node/OperationNode";
import {
  iconAlign,
  iconZoomIn,
  iconZoomOut,
  newNode,
  templateNode,
} from "./constant";
import { GuideLine } from "./GuideLine";
import { PendingConnection } from "./PendingConnection";

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
    }: FlowchartProps,
    ref: Ref<IFlowchart>
  ) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [selectedNodeIds, setSelectedNodeIds] = useState<number[]>([]);
    const [selectedConnIds, setSelectedConnIds] = useState<number[]>([]);
    const [selectingInfo, setSelectingInfo] = useState<SelectingInfo>();
    const [connectingInfo, setConnectingInfo] = useState<DragConnectingInfo>();
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

        if (event.nativeEvent.which !== 1) {
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
              (item) => item.id
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
        }
      },
      [zoom, selectingInfo, movingInfo, nodes, connections, onChange, moveTo]
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
        connections.findIndex((interConn) => interConn.id === currentConn),
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
          connections.findIndex((interConn) => interConn.id === currentConn.id),
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

        // Align dragging node
        if (movingInfo) {
          let result: NodeData[] = nodes;
          for (const t of movingInfo.targetIds) {
            result = update(result, {
              [result.findIndex((item) => item.id === t)]: {
                x: { $apply: (prev) => Math.round(Math.round(prev) / 10) * 10 },
                y: { $apply: (prev) => Math.round(Math.round(prev) / 10) * 10 },
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
          const point = {
            x: (event.nativeEvent.offsetX - defaultNodeSize.width / 2) / zoom,
            y: (event.nativeEvent.offsetY - defaultNodeSize.height / 2) / zoom,
            id: +new Date(),
            title: "New Item",
          };
          let newNode: NodeData;
          if (creatingInfo.type === "start") {
            newNode = {
              type: "start",
              ...point,
            };
          } else if (creatingInfo.type === "end") {
            newNode = {
              type: "end",
              ...point,
            };
          } else {
            newNode = {
              type: "operation",
              ...point,
            };
          }
          onChange?.([...nodes, newNode], connections);
        }
      },
      [
        movingInfo,
        connectingInfo,
        creatingInfo,
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
      }
      return guidelines;
    }, [
      movingInfo,
      creatingInfo,
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
        node.width = node.width || defaultNodeSize.width;
        node.height = node.height || defaultNodeSize.height;
        return (
          <Node
            readonly={readonly}
            key={node.id}
            isSelected={selectedNodeIds.some((item) => item === node.id)}
            isConnecting={!!connectingInfo}
            data={node}
            onDoubleClick={(event) => {
              event.stopPropagation();
              if (readonly) {
                return;
              }
              onNodeDoubleClick?.(node);
            }}
            onMouseDown={(event) => {
              if (event.ctrlKey || event.metaKey) {
                const index = selectedNodeIds.findIndex(
                  (item) => item === node.id
                );
                if (index === -1) {
                  setSelectedNodeIds([...selectedNodeIds, node.id]);
                } else {
                  setSelectedNodeIds(
                    update(selectedNodeIds, { $splice: [[index, 1]] })
                  );
                }
              } else {
                let tempCurrentNodes: number[] = selectedNodeIds;
                if (!selectedNodeIds.some((id) => id === node.id)) {
                  tempCurrentNodes = [node.id];
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
              if (node.type === "end") {
                return;
              }
              setConnectingInfo({ source: node, sourcePosition: position });
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
        connections?.map((conn) => {
          return (
            <Connection
              key={conn.id}
              isSelected={selectedConnIds.some((item) => conn.id === item)}
              onDoubleClick={() => onConnDoubleClick?.(conn)}
              onMouseDown={(event) => {
                if (event.ctrlKey || event.metaKey) {
                  const i = selectedConnIds.findIndex(
                    (item) => item === conn.id
                  );
                  if (i === -1) {
                    setSelectedConnIds((prevState) => [...prevState, conn.id]);
                  } else {
                    setSelectedConnIds((prev) =>
                      update(prev, { $splice: [[i, 1]] })
                    );
                  }
                } else {
                  setSelectedNodeIds([]);
                  setSelectedConnIds([conn.id]);
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
        setCreatingInfo({
          type,
          x: event.clientX - (defaultNodeSize.width * zoom) / 2,
          y: event.clientY - (defaultNodeSize.height * zoom) / 2,
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

        setCreatingInfo({
          ...creatingInfo,
          x: event.clientX - (defaultNodeSize.width * zoom) / 2,
          y: event.clientY - (defaultNodeSize.height * zoom) / 2,
        });
      },
      [defaultNodeSize.height, defaultNodeSize.width, creatingInfo, zoom]
    );

    // TODO: disable right click
    // TODO: resize

    return (
      <>
        <div
          style={style}
          className={"flowchart-container"}
          onMouseUp={handleContainerMouseUp}
          onMouseMove={handleContainerMouseMove}
        >
          <div className={"flowchart-zoom"}>
            <button
              style={{ border: "none", backgroundColor: "transparent" }}
              onClick={zoomIn}
            >
              {iconZoomIn}
            </button>
            <span
              style={{
                display: "inline-block",
                width: 40,
                textAlign: "center",
              }}
            >
              {zoom * 100}%
            </span>
            <button
              style={{ border: "none", backgroundColor: "transparent" }}
              onClick={zoomOut}
            >
              {iconZoomOut}
            </button>
            {!readonly && (
              <button
                style={{ border: "none", backgroundColor: "transparent" }}
                onClick={internalCenter}
              >
                {iconAlign}
              </button>
            )}
          </div>
          <div className={"flowchart-content"}>
            {readonly ? (
              <></>
            ) : (
              <div className={"flowchart-toolbar"}>
                <div
                  onMouseDown={(event) =>
                    handleToolbarMouseDown("start", event)
                  }
                >
                  <svg className={"flowchart-toolbar-item"}>
                    <StartEndNode data={templateNode} />
                  </svg>
                </div>
                <div
                  onMouseDown={(event) =>
                    handleToolbarMouseDown("operation", event)
                  }
                >
                  <svg className={"flowchart-toolbar-item"}>
                    <OperationNode data={templateNode} />
                  </svg>
                </div>
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
              {nodeElements}
              {connectionElements}
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
              className={"flowchart-creation-item"}
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
