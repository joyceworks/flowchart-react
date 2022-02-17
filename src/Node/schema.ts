import { NodeData, NodeRender } from "../schema";

export interface NodeProps {
  data: NodeData;
  isSelected?: boolean;
  render?: NodeRender;
}
