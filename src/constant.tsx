import { NodeData } from "./schema";
import React from "react";

export const newNode: NodeData = {
  id: 0,
  title: "New Item",
  type: "start",
  x: 0,
  y: 0,
};

export const templateNode: NodeData = {
  id: 0,
  title: "",
  type: "start",
  x: 8,
  y: 8,
  width: 32,
  height: 16,
};

export const iconAlign = (
  <svg className={"mt-[2px]"}
    viewBox="64 64 896 896"
    focusable="false"
    data-icon="align-center"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M264 230h496c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H264c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm496 424c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H264c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h496zm144 140H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0-424H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z" />
  </svg>
);

export const iconZoomOut = <svg
  viewBox="64 64 896 896"
  focusable="false"
  data-icon="plus"
  width="1em"
  height="1em"
  fill="currentColor"
  aria-hidden="true"
>
  <defs>
    <style />
  </defs>
  <path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z" />
  <path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z" />
</svg>

export const iconZoomIn = <svg
  viewBox="64 64 896 896"
  focusable="false"
  data-icon="minus"
  width="1em"
  height="1em"
  fill="currentColor"
  aria-hidden="true"
>
  <path d="M872 474H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h720c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z" />
</svg>
