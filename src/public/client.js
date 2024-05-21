// src/render/shangha
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
      value: randStr(8)
    }),
    getTag("hr", { className: "col-span-3" }),
    getTag("label", { textContent: "Game Type:", for: "gameType" }),
    getTag("select", { id: "gameType", value: "" }, [
      getTag("option", { textContent: "3-5-8", value: "threeFiveEight" }),
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

// src/render/shanghai.tsght
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
        value: randStr(8)
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

// src/render/shanghai.t
function waiting(msg) {
  const { minPlayers, maxPlayers } = msg.gameInfo;
  const requiredPlayers = minPlayers === maxPlayers ? minPlayers : `${minPlayers} - ${maxPlayers}`;
  setQueryParam({ gameCode: msg.gameCode });
  const joinUrl = window.location.href;
  const orderedPlayers = msg.players.reduce((ordered, playerData) => {
    ordered[playerData.position - 1] = playerData;
    return ordered;
  }, []);
  console.log("Ordered players:", orderedPlayers);
  return getTag("div", { className: "showOutline flex flex-col gap-4 col-span-3 items-center" }, [
    getTag("h1", { textContent: "Waiting...", className: "text-xl" }),
    getTag("h1", { textContent: `${msg.gameType} requires ${requiredPlayers} players` }),
    getTag("h1", { textContent: "Game Code:", className: "flex flex-wrap gap-2" }, [
      getTag("a", { textContent: msg.gameCode, href: joinUrl, className: "underline" })
    ]),
    ...orderedPlayers.map((player) => getTag("div", { className: `showOutline flex gap-4 w-full ${player.username !== msg.username ? "" : "bg-gray-100"}` }, [
      getTag("p", { textContent: player.username, className: "text-center my-auto flex-1" }),
      getTag("div", { className: "flex flex-col" }, player.username !== msg.username ? [] : [
        getTag("button", {
          textContent: "\u21A5",
          className: "py-0 bg-transparent border-2 rounded-b-none",
          onclick: player.username !== msg.username ? undefined : () => {
            sendMsg({
              action: "position",
              gameCode: msg.gameCode,
              username: player.username,
              userId: msg.userId,
              position: -1
            });
          }
        }),
        getTag("button", {
          textContent: "\u21A7",
          className: "py-0 bg-transparent border-2 rounded-t-none",
          onclick: player.username !== msg.username ? undefined : () => {
            sendMsg({
              action: "position",
              gameCode: msg.gameCode,
              username: player.username,
              userId: msg.userId,
              position: 1
            });
          }
        })
      ]),
      getTag("button", {
        textContent: player.ready ? "\u2713" : "\u2718",
        className: `text-xl ${player.ready ? "bg-green-500" : "bg-red-500"}`,
        onclick: player.username !== msg.username ? undefined : (e) => {
          sendMsg({
            action: "ready",
            gameCode: msg.gameCode,
            username: player.username,
            userId: msg.userId
          });
        }
      })
    ]))
  ]);
}

// src/render/shanghai
function error(msg) {
  setQueryParam({ gameCode: msg.gameCode });
  return getUsername(msg);
}

// src/render/shanghai.tsght.ts
function threeFiveEight(msg) {
  const currentPlayer = msg.players.find((player) => player.username === msg.username);
  const orderedPlayers = msg.players.reduce((ordered, playerData) => {
    ordered[playerData.position - 1] = playerData;
    return ordered;
  }, []);
  const handCount = [8, 5, 3];
  const offset = (msg.currentRound - 1) % 3;
  const currentRoundOrder = orderedPlayers.slice(offset).concat(orderedPlayers.slice(0, offset));
  const needToPickTrump = msg.players.map((player) => player.chosenTrumps.length).reduce((total, count) => total + count) < msg.currentRound;
  console.log("need to pick trump?:", needToPickTrump);
  if (!msg.gameInfo.extraData?.trumpOpts)
    throw Error("cant find trump options");
  return getTag("div", { className: "showOutline flex flex-col gap-4 items-center w-11/12 sm:w-4/5 mx-auto" }, [
    getTag("h1", { textContent: "Playing:" + msg.gameType }),
    getTag("a", {
      textContent: "View Rules",
      href: msg.gameInfo.rules,
      className: "underline"
    }),
    getTag("p", { textContent: `Current Round: ${msg.currentRound}` }),
    getTag("div", { className: "flex flex-col gap-4" }, currentRoundOrder.map((player, i) => {
      return getTag("div", { textContent: `${handCount[i]}: ${player.username}` });
    })),
    getTag("table", { className: "w-full" }, [
      getTag("tr", {}, [
        getTag("th", { className: "w-1/3" }),
        ...msg.gameInfo.extraData?.trumpOpts.map((suit) => getTag("th", { textContent: suit, className: "text-2xl" })) || []
      ]),
      ...orderedPlayers.map((player) => {
        return getTag("tr", { className: msg.username !== player.username ? "" : "bg-gray-100" }, [
          getTag("td", { textContent: player.username, className: "p-1 text-center truncate max-w-0" }),
          ...msg.gameInfo.extraData?.trumpOpts.map((suit) => {
            return getTag("td", {
              textContent: "\u2718",
              className: `text-center text-red-500 px-2 ${player.chosenTrumps.includes(suit) ? "" : "text-transparent"}`
            });
          }) || []
        ]);
      })
    ]),
    getTag("table", { className: "w-full" }, [
      getTag("tr", {}, [
        getTag("th", { textContent: "Round #", className: "border" }),
        ...orderedPlayers.map((player) => {
          return getTag("th", { className: `border px-4 ${msg.username !== player.username ? "" : "bg-gray-100"}` }, [
            getTag("div", { className: "flex sm:flex-row flex-col justify-center items-center" }, [
              getTag("p", { textContent: player.username, className: "text-center flex-1 break-all" }),
              getTag("div", { className: `my-auto rounded-full h-4 w-4 ${player.isConnected ? "bg-green-500" : "bg-red-500"}` })
            ])
          ]);
        })
      ]),
      ...[...Array(msg.currentRound - 1).keys()].map((i) => {
        return getTag("tr", {}, [
          getTag("td", { textContent: `Round ${i + 1}`, className: "border text-center font-semibold" }),
          ...orderedPlayers.map((player) => {
            return getTag("td", {
              textContent: player.score[i] !== undefined ? player.score[i] : "X",
              className: `border text-center ${msg.username !== player.username ? "" : "bg-gray-100"}`
            });
          })
        ]);
      }),
      getTag("tr", {}, [
        getTag("td", { textContent: "Total", className: "border text-center font-semibold" }),
        ...orderedPlayers.map((player) => {
          return getTag("td", {
            textContent: player.score.slice(0, msg.currentRound - 1).reduce((total, round) => total += round, 0),
            className: `border text-center font-semibold ${msg.username !== player.username ? "" : "bg-gray-100"}`
          });
        })
      ])
    ]),
    needToPickTrump && currentRoundOrder[0].username === msg.username ? getTag("div", { className: "grid grid-cols-2 gap-4" }, [
      getTag("div", { textContent: "Choose trump suit for this round", className: "col-span-2" }),
      ...msg.gameInfo.extraData?.trumpOpts.map((suit) => {
        return getTag("button", {
          textContent: suit,
          disabled: currentPlayer?.chosenTrumps.includes(suit),
          className: `text-3xl ${currentPlayer?.chosenTrumps.includes(suit) ? "bg-gray-400" : ""}`,
          onclick: () => {
            sendMsg({
              action: "trump",
              suit,
              username: msg.username,
              userId: msg.userId,
              gameCode: msg.gameCode
            });
          }
        });
      })
    ]) : needToPickTrump && currentRoundOrder[0].username !== msg.username ? getTag("div", { textContent: "Waiting for trump to be chosen" }) : currentPlayer && currentPlayer.score.length === msg.currentRound ? getTag("p", { textContent: "Waiting for other players to add their score for this round" }) : getTag("div", { className: "flex flew-wrap gap-4" }, [
      getTag("label", { textContent: "Score:", for: "score" }),
      getTag("input", { type: "number", id: "score", value: "0" }),
      getTag("button", { textContent: "Submit", onclick: () => {
        console.log("submit score");
        sendMsg({
          action: "score",
          score: getValById("score"),
          username: msg.username,
          userId: msg.userId,
          gameCode: msg.gameCode
        });
      } })
    ])
  ]);
}

// src/render/shanghai.ts
function shanghai(msg) {
  return getTag("h1", { textContent: "Shanghai game is running" });
}

// src/render/shang
function getTag(type, props, children) {
  const node = document.createElement(type);
  if (props)
    Object.keys(props).forEach((propKey) => node[propKey] = props[propKey]);
  if (children?.length)
    node.append(...children);
  return node;
}
function randStr(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return [...Array(length).keys()].map(() => {
    return chars[Math.floor(Math.random() * chars.length)];
  }).join("");
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
function sendMsg(msg) {
  ws.send(JSON.stringify(msg));
}
function startWebSocket(initMsg) {
  ws = new WebSocket("ws://localhost:3000");
  ws.onopen = () => {
    console.log("opened", initMsg);
    ws.send(JSON.stringify(initMsg));
  };
  ws.onmessage = (ws) => {
    const msg = JSON.parse(ws.data);
    console.log("NEW MESSAGE", msg);
    document.body.innerHTML = "";
    document.body.appendChild(renderOpts[msg.status](msg));
  };
}
var renderOpts = {
  home,
  getUsername,
  waiting,
  error,
  threeFiveEight,
  shanghai
};
var ws;

// src/render/sh
var queryParams = [
  ...new URLSearchParams(window.location.search).entries()
].reduce((obj, param) => {
  const [key, val] = param;
  obj[key] = val;
  return obj;
}, {});
console.log(queryParams);
document.body.append(renderOpts[queryParams.gameCode ? "getUsername" : "home"]({}));
