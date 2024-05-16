// src/render/running
function home() {
  return getTag("form", { className: "showOutline w-4/5 grid grid-cols-3 gap-4", id: "initForm" }, [
    getTag("h1", { textContent: "Scoreboard", className: "text-xl text-center col-span-3" }),
    getTag("label", { textContent: "Username:", for: "username" }),
    getTag("input", {
      className: "col-span-2",
      id: "username",
      type: "text",
      maxLength: "32",
      required: true,
      value: "testUser-"
    }),
    getTag("hr", { className: "col-span-3" }),
    getTag("label", { textContent: "Game Type:", for: "gameType" }),
    getTag("select", { id: "gameType", value: "" }, [
      getTag("option", { textContent: "3-5-8", value: "3-5-8" }),
      getTag("option", { textContent: "Shanghai", value: "shanghai" })
    ]),
    getTag("button", {
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
    getTag("label", { textContent: "Join Code:", for: "joinCode" }),
    getTag("input", { id: "joinCode", type: "text", maxLength: "5" }),
    getTag("button", {
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
}

// src/render/running.tse.ts
function getUsername(msg) {
  const gameCode = new URL(window.location.href).searchParams.get("gameCode");
  return getTag("form", { className: "showOutline p-4 flex flex-col gap-4" }, [
    getTag("p", { textContent: `Game Code: ${gameCode}`, className: "text-center" }),
    getTag("p", { className: `text-center text-red-500 ${msg.errorMsg ? "block" : "hidden"}`, textContent: msg.errorMsg }),
    getTag("form", { className: "flex flex-wrap gap-4" }, [
      getTag("label", { textContent: "Username:", for: "username" }),
      getTag("input", {
        className: "flex-1",
        id: "username",
        type: "text",
        maxLength: "32",
        required: true,
        value: "testUser-"
      }),
      getTag("button", {
        textContent: "Join Game",
        className: "w-full",
        onclick: (e) => {
          e.preventDefault();
          startWebSocket({
            action: "join",
            gameCode,
            username: getValById("username")
          });
        }
      })
    ])
  ]);
}

// src/render/running.ts
function waiting(msg) {
  const { minPlayers, maxPlayers } = msg.gameInfo;
  const requiredPlayers = minPlayers === maxPlayers ? minPlayers : `${minPlayers} - ${maxPlayers}`;
  setQueryParam({ gameCode: msg.gameCode });
  const joinUrl = window.location.href;
  return getTag("div", { className: "showOutline flex flex-col gap-4 col-span-3 items-center" }, [
    getTag("h1", { textContent: "Waiting...", className: "text-xl" }),
    getTag("h1", { textContent: `${msg.gameType} requires ${requiredPlayers} players` }),
    getTag("h1", { textContent: "Game Code:", className: "flex flex-wrap gap-2" }, [
      getTag("a", { textContent: msg.gameCode, href: joinUrl, className: "underline" })
    ]),
    ...msg.players.map((player) => getTag("p", { textContent: player.username }, [
      getTag("button", {
        textContent: `is ready? ${player.ready}`,
        onclick: (e) => {
          console.log(e, "send ready state");
          sendFunc("hello");
        }
      })
    ]))
  ]);
}

// src/render/running.
function error(msg) {
  setQueryParam({ gameCode: msg.gameCode });
  return getUsername(msg);
}

// src/render/running.ts
function running(msg) {
  return getTag("h1", { textContent: "game is running" });
}

// src/render/runni
function getTag(type, props, children) {
  const node = document.createElement(type);
  if (props)
    Object.keys(props).forEach((propKey) => node[propKey] = props[propKey]);
  if (children?.length)
    node.append(...children);
  return node;
}
function getValById(id) {
  return document.querySelector(`#${id}`).value;
}
function validateInputs(formId, inputIds) {
  const validity = inputIds.every((inputId) => {
    return getValById(inputId) || document.querySelector(`#${inputId}`).setCustomValidity(`${inputId} is required`);
  });
  return validity || document.querySelector(`#${formId}`).reportValidity();
}
function setQueryParam(params) {
  const url = new URL(window.location.toString());
  Object.keys(params).forEach((key) => {
    url.searchParams.set(key, params[key]);
  });
  window.history.pushState({}, "", url);
}
function startWebSocket(initMsg) {
  const ws = new WebSocket("ws://localhost:3000");
  ws.onopen = () => {
    console.log("opened", initMsg);
    ws.send(JSON.stringify(initMsg));
    sendFunc = ws.send.bind(ws);
  };
  ws.onmessage = (ws2) => {
    console.log(ws2.data);
    const msg = JSON.parse(ws2.data);
    document.body.innerHTML = "";
    document.body.appendChild(renderOpts[msg.status](msg));
  };
}
var renderOpts = {
  home,
  getUsername,
  waiting,
  error,
  running
};
var sendFunc;

// src/render/ru
var queryParams = [
  ...new URLSearchParams(window.location.search).entries()
].reduce((obj, param) => {
  const [key, val] = param;
  obj[key] = val;
  return obj;
}, {});
console.log(queryParams);
document.body.append(renderOpts[queryParams.gameCode ? "getUsername" : "home"]({}));
