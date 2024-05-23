function v(){return N("form",{className:"showOutline w-4/5 grid grid-cols-3 gap-4",id:"initForm"},[N("button",{textContent:"\uD83C\uDF17\uFE0E",onclick:(G)=>{G.preventDefault(),console.log("toggle theme");const A=window.localStorage.getItem("theme"),H=A==="dark"?"light":"dark";if(A)document.documentElement.classList.remove(A);document.documentElement.classList.add(H),window.localStorage.setItem("theme",H)}}),N("h1",{textContent:"Scoreboard",className:"text-xl text-center col-span-3"}),N("label",{textContent:"Username:",htmlFor:"username"}),N("input",{className:"col-span-2",id:"username",type:"text",maxLength:"8",required:!0,value:W(8)}),N("hr",{className:"col-span-3"}),N("label",{textContent:"Game Type:",htmlFor:"gameType"}),N("select",{id:"gameType",value:""},[N("option",{textContent:"3-5-8",value:"threeFiveEight"}),N("option",{textContent:"Shanghai",value:"shanghai"})]),N("button",{textContent:"Create Game",id:"startGame",className:"secondary",onclick:(G)=>{if(G.preventDefault(),q("initForm",["username","gameType"]))x({action:"start",gameType:Y("gameType"),username:Y("username")})}}),N("label",{textContent:"Join Code:",htmlFor:"joinCode"}),N("input",{id:"joinCode",type:"text",maxLength:"5"}),N("button",{textContent:"Join Game",id:"joinGame",className:"secondary",onclick:(G)=>{if(G.preventDefault(),q("initForm",["joinCode","username"]))x({action:"join",gameCode:Y("joinCode"),username:Y("username")})}})])}function E(G){const A=new URL(window.location.href).searchParams.get("gameCode");return N("form",{className:"showOutline p-4 flex flex-col gap-4"},[N("p",{textContent:`Game Code: ${A}`,className:"text-center"}),N("p",{className:`text-center text-red-500 ${G.errorMsg?"block":"hidden"}`,textContent:G.errorMsg}),N("form",{className:"flex flex-wrap gap-4"},[N("label",{textContent:"Username:",htmlFor:"username"}),N("input",{className:"flex-1",id:"username",type:"text",maxLength:"8",required:!0,value:W(8)}),N("button",{textContent:"Join Game",className:"w-full",onclick:(H)=>{H.preventDefault(),x({action:"join",gameCode:A,username:Y("username")})}})])])}function R(G){const{minPlayers:A,maxPlayers:H}=G.gameInfo,J=A===H?A:`${A} - ${H}`;Q({gameCode:G.gameCode});const Z=window.location.href,$=G.players.reduce((L,z)=>{return L[z.position-1]=z,L},[]);return console.log("Ordered players:",$),N("div",{className:"showOutline flex flex-col gap-4 col-span-3 items-center"},[N("h1",{textContent:"Waiting...",className:"text-xl"}),N("h1",{textContent:`${f(G.gameType)} requires ${J} players`}),N("h1",{textContent:"Game Code:",className:"flex flex-wrap gap-2"},[N("a",{textContent:G.gameCode,href:Z,className:"underline"})]),...$.map((L)=>N("div",{className:`showOutline flex gap-4 w-full ${L.username!==G.username?"":"secondary"}`},[N("p",{textContent:L.username,className:"text-center my-auto flex-1"}),N("div",{className:"flex flex-col"},L.username!==G.username?[]:[N("button",{textContent:"\u21A5",className:"py-0 bg-transparent border-2 border-b-0 rounded-b-none",onclick:L.username!==G.username?void 0:()=>{_({action:"position",username:L.username,userId:G.userId,position:-1})}}),N("button",{textContent:"\u21A7",className:"py-0 bg-transparent border-2 rounded-t-none",onclick:L.username!==G.username?void 0:()=>{_({action:"position",username:L.username,userId:G.userId,position:1})}})]),N("button",{textContent:L.ready?"\u2713":"\u2718",className:`text-xl ${L.ready?"bg-green-500":"bg-red-500"}`,onclick:L.username!==G.username?void 0:(z)=>{_({action:"ready",username:L.username,userId:G.userId})}})]))])}function K(G){return Q({gameCode:G.gameCode}),E(G)}function O(G){const A=G.players.find((z)=>z.username===G.username),H=G.players.reduce((z,X)=>{return z[X.position-1]=X,z},[]),J=[8,5,3],Z=(G.currentRound-1)%3,$=H.slice(Z).concat(H.slice(0,Z)),L=G.players.map((z)=>z.chosenTrumps.length).reduce((z,X)=>z+X)<G.currentRound;if(console.log("need to pick trump?:",L),!G.gameInfo.extraData?.trumpOpts)throw Error("cant find trump options");return N("div",{className:"showOutline flex flex-col gap-4 items-center w-11/12 sm:w-4/5 mx-auto my-8"},[N("div",{className:"flex flex-wrap gap-4 justify-center showOutline"},[N("p",{textContent:`Current Round: ${G.currentRound}`}),N("h1",{textContent:`Game: ${f(G.gameType)}`}),N("a",{textContent:"View Rules",href:G.gameInfo.rules,className:"underline"})]),N("div",{className:"flex flex-wrap gap-4 justify-center showOutline"},$.map((z,X)=>{return N("div",{textContent:`${J[X]}: ${z.username}`})})),N("table",{className:"w-full table-auto"},[N("tr",{},[N("td"),...G.gameInfo.extraData.trumpOpts.map((z)=>N("td",{textContent:z}))]),...H.map((z)=>{return N("tr",{className:G.username!==z.username?"":"secondary"},[N("td",{textContent:z.username,className:"text-sm"}),...G.gameInfo.extraData?.trumpOpts.map((X)=>{return N("td",{textContent:"\u2718",className:`text-red-500 px-0 ${z.chosenTrumps.includes(X)?"":"text-transparent"}`})})||[]])})]),N("div",{className:"w-full overflow-x-auto"},[N("table",{className:"w-full table-auto"},[N("tr",{},[N("td",{textContent:""}),...H.map((z)=>{return N("td",{textContent:z.username,className:`text-sm ${G.username!==z.username?"":"secondary"} ${z.isConnected?"":"text-red-500"}`})})]),...[...Array(G.currentRound).keys()].map((z)=>{return N("tr",{},[N("td",{textContent:z+1,className:"font-semibold w-1/6"}),...H.map((X)=>{return N("td",{textContent:X.score[z]!==void 0?X.score[z]:"X",className:`border text-center ${G.username!==X.username?"":"secondary"}`})})])}),N("tr",{},[N("td",{textContent:"Total",className:"font-semibold"}),...H.map((z)=>{return N("td",{textContent:z.score.slice(0,G.currentRound-1).reduce((X,C)=>X+=C,0),className:`font-semibold ${G.username!==z.username?"":"secondary"}`})})])])]),N("div",{className:"showOutline"},[L&&$[0].username===G.username?N("div",{className:"grid grid-cols-2 gap-4"},[N("div",{textContent:"Choose trump suit for this round",className:"col-span-2"}),...G.gameInfo.extraData?.trumpOpts.map((z)=>{return N("button",{textContent:z,disabled:A?.chosenTrumps.includes(z),className:`text-3xl ${A?.chosenTrumps.includes(z)?"blur-sm":"secondary"}`,onclick:()=>{_({action:"trump",suit:z,username:G.username,userId:G.userId})}})})]):L&&$[0].username!==G.username?N("div",{textContent:"Waiting for trump to be chosen"}):A&&A.score.length===G.currentRound?N("p",{textContent:"Waiting for other players to add their score for this round",className:"text-center"}):N("div",{className:"flex gap-4 justify-center"},[N("label",{textContent:"Score:",htmlFor:"score",className:"w-1/3"}),N("input",{type:"number",id:"score",value:"0",className:"w-1/3"}),N("button",{textContent:"Submit",className:"w-1/3",onclick:()=>{console.log("submit score"),_({action:"score",score:Y("score"),username:G.username,userId:G.userId})}})])])])}function S(G){return N("h1",{textContent:"Shanghai game is running"})}function N(G,A,H){const J=document.createElement(G);if(A)Object.keys(A).forEach((Z)=>J[Z]=A[Z]);if(H?.length)J.append(...H);return J}function W(G){return[...Array(G).keys()].map(()=>{return"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random()*"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".length)]}).join("")}function Y(G){return document.querySelector(`#${G}`).value}function q(G,A){return A.every((J)=>{return Y(J)||document.querySelector(`#${J}`).setCustomValidity(`${J} is required`)})||document.querySelector(`#${G}`).reportValidity()}function Q(G){const A=new URL(window.location.toString());Object.keys(G).forEach((H)=>{A.searchParams.set(H,G[H])}),window.history.pushState({},"",A)}function f(G,A){return G.split("").reduce((H,J,Z)=>{if(Z===0)return J.toUpperCase();if("A"<=J&&J<="Z")return`${H} ${J}`;return H+J},"")+(A?"s":"")}function _(G){F.send(JSON.stringify(G))}function x(G){F=new WebSocket("ws://localhost:3000"),F.onopen=()=>{console.log("opened",G),F.send(JSON.stringify(G))},F.onmessage=(A)=>{const H=JSON.parse(A.data);console.log("NEW MESSAGE",H),document.body.innerHTML="",document.body.appendChild(U[H.status](H))}}var U={home:v,getUsername:E,waiting:R,error:K,threeFiveEight:O,shanghai:S},F;var j=[...new URLSearchParams(window.location.search).entries()].reduce((G,A)=>{const[H,J]=A;return G[H]=J,G},{});console.log(j);document.body.append(U[j.gameCode?"getUsername":"home"]({}));document.documentElement.classList.add(window.localStorage.getItem("theme")||"light");
