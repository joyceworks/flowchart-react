/// <reference types="react" />
import { Direction, NodeData } from "../schema";
declare const Controller: ({ data, onMouseDown, }: {
    data: NodeData;
    onMouseDown: (direction: Direction) => void;
}) => JSX.Element;
export { Controller };
