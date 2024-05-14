// src/client.ts
var t = function(type, props, children) {
  const node = document.createElement(type);
  if (props)
    Object.keys(props).forEach((propKey) => node[propKey] = props[propKey]);
  if (children?.length)
    node.append(...children);
  return node;
};
var getValById = function(id) {
  return document.querySelector(`#${id}`).value;
};
var startWebSocket = function(initMsg) {
  const ws = new WebSocket("ws://localhost:3000");
  ws.onopen = () => {
    console.log("opened NEW TEST");
    ws.send(JSON.stringify(initMsg));
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
};
var renderOpts = {
  waiting: (msg) => {
    console.log(msg);
    const newState = t("div", { className: "flex flex-col gap-4" }, [
      t("h1", { textContent: "Waiting...", className: "text-xl text-center" }),
      t("h1", { textContent: `${msg.gameType} requires ${msg.gameInfo.minPlayers} - ${msg.gameInfo.maxPlayers} players` }),
      t("h1", { textContent: `Game Code: ${msg.gameCode}` }),
      ...msg.players.map((player) => t("p", { textContent: player.username }))
    ]);
    return newState;
  }
};
document.querySelector("#joinGame")?.addEventListener("click", (e) => {
  e.preventDefault();
  startWebSocket({
    action: "join",
    gameCode: getValById("joinCode"),
    username: getValById("username")
  });
});
document.querySelector("#startGame")?.addEventListener("click", (e) => {
  e.preventDefault();
  startWebSocket({
    action: "start",
    gameType: getValById("gameType"),
    username: getValById("username")
  });
});
