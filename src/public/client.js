// src/client.ts
var t = function(type, props, children) {
  const node = document.createElement(type);
  if (props)
    Object.keys(props).forEach((propKey) => node[propKey] = props[propKey]);
  if (children?.length)
    node.append(...children);
  return node;
};
var renderOpts = {
  waiting: (msg) => {
    console.log(msg);
    return t("div", { className: "showOutline" }, [
      t("h1", { textContent: "hello world 1" }),
      t("h1", { textContent: "hello world 2" }),
      t("h1", {
        textContent: "hello world 3",
        onclick: () => console.log("hello world from 3 UPDATED")
      })
    ]);
  }
};
document.querySelector("#startForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const ws = new WebSocket("ws://localhost:3000");
  ws.onopen = () => {
    console.log("opened NEW TEST");
    ws.send(JSON.stringify({
      action: "start",
      gameType: document.querySelector("#gameType").value,
      username: document.querySelector("#username").value
    }));
  };
  ws.onmessage = (ws2) => {
    const container = document.querySelector("#container");
    if (!container)
      throw Error("Cant find container");
    console.log(ws2.data);
    const msg = JSON.parse(ws2.data);
    container.innerHTML = "";
    container.appendChild(renderOpts[msg.status](msg));
  };
});
