// src/client.ts
document.querySelector("#startForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const ws = new WebSocket("ws://localhost:3000");
  ws.onopen = () => {
    console.log("opened");
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
    container.innerHTML = ws2.data;
  };
});
