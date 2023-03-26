import "webextension-polyfill";
import * as React from "react";
import * as ReactDom from "react-dom/client";

function Popup() {
  return <>asdf</>;
}

const rootNode = document.getElementById("root");
if (!rootNode) {
  throw new Error();
}

const root = ReactDom.createRoot(rootNode);
root.render(<Popup />);
