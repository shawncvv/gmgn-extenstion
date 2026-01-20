import { createRoot } from "react-dom/client";
import { FlowPanel } from "./components/FlowPanel";
import "./panel.css";

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(<FlowPanel />);
}
