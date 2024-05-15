// src/client.ts
var t = function(type, props, children) {
  const node = document.createElement(type);
  if (props)
    Object.keys(props).forEach((propKey) => node[propKey] = props[propKey]);
  if (children?.length)
    node.append(...children);
  return node;
};
var validateInputs = function(formId, inputIds) {
  const validity = inputIds.every((inputId) => {
    return getValById(inputId) || document.querySelector(`#${inputId}`).setCustomValidity(`${inputId} is required`);
  });
  return validity || document.querySelector(`#${formId}`).reportValidity();
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
    const container = document.body;
    console.log(ws2.data);
    const msg = JSON.parse(ws2.data);
    container.innerHTML = "";
    container.appendChild(renderOpts[msg.status](msg));
  };
};
var renderOpts = {
  home() {
    return t("form", { className: "showOutline w-4/5 grid grid-cols-3 gap-4", id: "initForm" }, [
      t("h1", { textContent: "Scoreboard", className: "text-xl text-center col-span-3" }),
      t("label", { textContent: "Username:", for: "username" }),
      t("input", {
        className: "col-span-2",
        id: "username",
        type: "text",
        maxLength: "32",
        required: true,
        value: "testUser"
      }),
      t("hr", { className: "col-span-3" }),
      t("label", { textContent: "Game Type:", for: "gameType" }),
      t("select", { id: "gameType", value: "" }, [
        t("option", { textContent: "3-5-8", value: "3-5-8" }),
        t("option", { textContent: "Shanghai", value: "shanghai" })
      ]),
      t("button", {
        textContent: "Create Game",
        id: "startGame",
        onclick: (e) => {
          e.preventDefault();
          if (validateInputs("initForm", ["username", "gameType"])) {
            startWebSocket({
              action: "start",
              gameType: getValById("gameType"),
              username: getValById("username")
            });
          }
        }
      }),
      t("label", { textContent: "Join Code:", for: "joinCode" }),
      t("input", { id: "joinCode", type: "text", maxLength: "5" }),
      t("button", {
        textContent: "Join Game",
        id: "joinGame",
        onclick: (e) => {
          e.preventDefault();
          if (validateInputs("initForm", ["joinCode", "username"])) {
            startWebSocket({
              action: "join",
              gameCode: getValById("joinCode"),
              username: getValById("username")
            });
          }
        }
      })
    ]);
  },
  waiting(msg) {
    console.log(msg.status);
    const { minPlayers, maxPlayers } = msg.gameInfo;
    const requiredPlayers = minPlayers === maxPlayers ? minPlayers : `${minPlayers} - ${maxPlayers}`;
    return t("div", { className: "flex flex-col gap-4 col-span-3 items-center" }, [
      t("h1", { textContent: "Waiting...", className: "text-xl" }),
      t("h1", { textContent: `${msg.gameType} requires ${requiredPlayers} players` }),
      t("h1", { textContent: `Game Code: ${msg.gameCode}` }),
      ...msg.players.map((player) => t("p", { textContent: player.username }))
    ]);
  },
  error() {
    return t("h1", { textContent: "Display error msg" });
  }
};
document.body.append(renderOpts.home({}));
