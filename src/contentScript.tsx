import { createRoot } from "react-dom/client";
import { FlowPanel } from "./components/FlowPanel";
import "./panel.css";

const PANEL_ID = "gmgn-top30-flow-panel";

const mountPanel = () => {
  if (document.getElementById(PANEL_ID)) {
    return;
  }

  const container = document.createElement("div");
  container.id = PANEL_ID;
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<FlowPanel />);
};

mountPanel();
