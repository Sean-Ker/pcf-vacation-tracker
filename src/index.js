// File imports
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-calendar-timeline/lib/Timeline.css";

// ReactDOM.render(
//     <React.StrictMode>
//         {/* <App fn={"Sean"} ln={"Kuznetsov"} /> */}
//         <App />
//     </React.StrictMode>,
//     document.getElementById("root")
// );

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App tab="home" />);
