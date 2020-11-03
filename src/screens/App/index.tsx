import React, { useRef, useState } from "react";
import "./index.css";
import Flowchart from "../../components/Flowchart/Flowchart";
import {
  ConnectionData,
  NodeData,
  NodeType,
} from "../../components/Flowchart/schema";
import update from "immutability-helper";
import { Form, Input, Modal, Select } from "antd";
import "antd/dist/antd.css";

function App() {
  const [nodes, setNodes] = useState<NodeData[]>([
    {
      type: "start",
      name: "Start",
      x: 150,
      y: 190,
      id: 1604410569920,
      approvers: [],
    },
    {
      type: "end",
      name: "End",
      x: 500,
      y: 190,
      id: 1604410572363,
      approvers: [],
    },
    {
      x: 330,
      y: 190,
      id: 1604410575428,
      name: "New",
      type: "operation",
      approvers: [{ name: "Joyce", id: "1" }],
    },
    {
      x: 330,
      y: 300,
      id: 1604410591865,
      name: "New",
      type: "operation",
      approvers: [],
    },
  ]);
  const [connections, setConnections] = useState<ConnectionData[]>([
    {
      source: { id: 1604410569920, position: "right" },
      destination: { id: 1604410575428, position: "left" },
      id: 1604410587907,
      type: "pass",
    },
    {
      source: { id: 1604410575428, position: "right" },
      destination: { id: 1604410572363, position: "left" },
      id: 1604410590524,
      type: "pass",
    },
    {
      source: { id: 1604410569920, position: "bottom" },
      destination: { id: 1604410591865, position: "left" },
      id: 1604410596866,
      type: "pass",
    },
    {
      source: { id: 1604410591865, position: "right" },
      destination: { id: 1604410572363, position: "bottom" },
      id: 1604410599205,
      type: "pass",
    },
  ]);
  const setInternalNodes = useRef<
    React.Dispatch<React.SetStateAction<NodeData[]>>
  >();
  const setInternalConnections = useRef<
    React.Dispatch<React.SetStateAction<ConnectionData[]>>
  >();
  const flowchartRef = useRef<any>();
  const [connectionForm, setConnectionForm] = useState<{
    visible: boolean;
    type: "pass" | "reject";
    id?: number;
  }>({ visible: false, type: "pass" });
  const [nodeForm, setNodeForm] = useState<{
    visible: boolean;
    id?: number;
    name: string;
    type: NodeType;
    approvers?: { name: string; [key: string]: any }[];
  }>({
    visible: false,
    name: "",
    type: "operation",
  });

  return (
    <>
      <div className="container" style={{ height: 500 }}>
        <h1 className="title">Flowchart React</h1>
        <h5 className="subtitle">
          Flowchart & Flowchart designer component for React.js.
        </h5>
        <div id="toolbar">
          <button disabled={true} onClick={() => {}}>
            Add(Double-click canvas)
          </button>
          <button disabled={true}>Delete(Del)</button>
          <button disabled={true}>Edit(Double-click node)</button>
          <button
            onClick={() =>
              alert(JSON.stringify(flowchartRef.current.getData()))
            }
          >
            Save
          </button>
        </div>
        <>
          <Flowchart
            ref={flowchartRef}
            onEditConnection={(data, setConnections) => {
              setInternalConnections.current = setConnections;
              setConnectionForm({
                visible: true,
                id: data.id,
                type: data.type,
              });
            }}
            onCreateConnection={(data, setConnections) => {
              setInternalConnections.current = setConnections;
              setConnections((prevState) => [...prevState, data]);
            }}
            onEditNode={(data, setNodes) => {
              setInternalNodes.current = setNodes;
              setNodeForm({
                approvers: data.approvers,
                name: data.name,
                type: data.type,
                visible: true,
                id: data.id,
              });
            }}
            onCreateNode={(data, setNodes) => {
              setInternalNodes.current = setNodes;
              setNodes((prevState) => [
                ...prevState,
                { ...data, approvers: [] },
              ]);
            }}
            defaultNodes={nodes}
            defaultConnections={connections}
          />
          <Modal
            visible={nodeForm.visible}
            title={"节点"}
            width={400}
            onCancel={() =>
              setNodeForm({
                id: undefined,
                type: "operation",
                visible: false,
                name: "",
                approvers: undefined,
              })
            }
            onOk={() => {
              setNodeForm({
                id: undefined,
                type: "operation",
                visible: false,
                name: "",
                approvers: undefined,
              });
              setInternalNodes.current!((prevState) =>
                update(prevState, {
                  [prevState.findIndex((item) => item.id === nodeForm.id)]: {
                    name: {
                      $set: nodeForm.name,
                    },
                    type: {
                      $set: nodeForm.type,
                    },
                    approvers: {
                      $set: nodeForm.approvers,
                    },
                  },
                })
              );
            }}
          >
            <Form
              labelAlign={"right"}
              labelCol={{
                span: 4,
              }}
            >
              <Form.Item label={"名称"}>
                <Input
                  value={nodeForm.name}
                  onChange={(event) =>
                    setNodeForm((prevState) => ({
                      ...prevState,
                      name: event.target.value,
                    }))
                  }
                />
              </Form.Item>
              <Form.Item label={"类型"}>
                <Select
                  value={nodeForm.type}
                  onChange={(event) => {
                    setNodeForm((prevState) => ({
                      ...prevState,
                      type: event as NodeType,
                    }));
                  }}
                >
                  <Select.Option value={"start"}>开始</Select.Option>
                  <Select.Option value={"end"}>结束</Select.Option>
                  <Select.Option value={"operation"}>审核</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label={"审核人"}>
                <Select
                  value={nodeForm.type}
                  onChange={(event, option: any) => {
                    setNodeForm((prevState) => ({
                      ...prevState,
                      approvers: [{ name: option.children, id: option.value }],
                    }));
                  }}
                >
                  <Select.Option value={"1"}>Joyce</Select.Option>
                  <Select.Option value={"2"}>Tiramisu</Select.Option>
                </Select>
              </Form.Item>
            </Form>
          </Modal>
          <Modal
            visible={connectionForm.visible}
            title={"流转"}
            width={400}
            onCancel={() =>
              setConnectionForm({
                id: undefined,
                type: "pass",
                visible: false,
              })
            }
            onOk={() => {
              setConnectionForm({
                id: undefined,
                type: "pass",
                visible: false,
              });
              setInternalConnections.current!((prevState) =>
                update(prevState, {
                  [prevState.findIndex(
                    (item) => item.id === connectionForm.id
                  )]: {
                    type: {
                      $set: connectionForm.type,
                    },
                  },
                })
              );
            }}
          >
            <Form>
              <Form.Item label={"类型"}>
                <Select
                  value={connectionForm.type}
                  onChange={(event) => {
                    setConnectionForm((prevState) => ({
                      ...prevState,
                      type: event as "pass" | "reject",
                    }));
                  }}
                >
                  <Select.Option value={"pass"}>同意</Select.Option>
                  <Select.Option value={"reject"}>驳回</Select.Option>
                </Select>
              </Form.Item>
            </Form>
          </Modal>
        </>
      </div>
    </>
  );
}

export default App;
