import React from "react";
import { FlowchartProps, IFlowchart } from "./schema";
import "./index.css";
import "./output.css";
declare const Flowchart: React.ForwardRefExoticComponent<FlowchartProps & React.RefAttributes<IFlowchart>>;
export default Flowchart;
