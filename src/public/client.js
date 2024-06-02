function G(){return D("form",{className:"showOutline grid grid-cols-3 gap-4",id:"initForm"},[D("label",{textContent:"Username:",htmlFor:"username"}),D("input",{className:"col-span-2",id:"username",type:"text",maxLength:"8",required:!0,value:E(8)}),D("hr",{className:"col-span-3"}),D("label",{textContent:"Game Type:",htmlFor:"gameType"}),D("select",{id:"gameType"},[D("option",{textContent:"3-5-8",value:"threeFiveEight"}),D("option",{textContent:"Shanghai",value:"shanghai"}),D("option",{textContent:"Thousand",value:"thousand"})]),D("button",{textContent:"Create",id:"startGame",className:"secondary",onclick:(N)=>{if(N.preventDefault(),f("initForm",["username","gameType"]))X({action:"start",gameType:H("gameType"),username:H("username"),gameCode:""})}}),D("label",{textContent:"Game Code:",htmlFor:"gameCode"}),D("input",{id:"gameCode",type:"text",maxLength:"5"}),D("button",{textContent:"Join",id:"joinGame",className:"secondary",onclick:(N)=>{if(N.preventDefault(),f("initForm",["gameCode","username"]))X({action:"join",gameCode:H("gameCode"),username:H("username")})}})])}function x(N){const $=new URL(window.location.href).searchParams.get("gameCode");return D("form",{className:"showOutline flex flex-col gap-4"},[D("p",{textContent:`Game Code: ${$}`,className:"text-center"}),D("p",{className:`text-center text-red-500 ${N.errorMsg?"block":"hidden"}`,textContent:N.errorMsg}),D("form",{className:"flex flex-wrap gap-4"},[D("label",{textContent:"Username:",htmlFor:"username",className:"flex-1"}),D("input",{className:"flex-1",id:"username",type:"text",maxLength:"8",required:!0,value:E(8)}),D("button",{textContent:"Join",className:"flex-1",onclick:(F)=>{F.preventDefault(),X({action:"join",gameCode:$,username:H("username")})}})])])}function K(N){const{minPlayers:$,maxPlayers:F}=N.gameInfo,L=$===F?$:`${$} - ${F}`;console.log("Ordered players:",N.players);const q=new URL(window.location.href);return q.searchParams.delete("username"),D("div",{className:"showOutline flex flex-col gap-4 col-span-3 items-center"},[D("h1",{textContent:"Waiting...",className:"text-xl"}),D("h1",{textContent:`${v(N.gameType)} requires ${L} players`}),D("h1",{textContent:"Game Code:",className:"flex flex-wrap gap-2"},[D("a",{textContent:N.gameCode,href:q.toString(),className:"underline",target:"_blank",rel:"noopener noreferrer"})]),...N.players.map((A)=>D("div",{className:`showOutline flex gap-4 w-full ${A.username!==N.username?"":"secondary"}`},[D("p",{textContent:A.username,className:"text-center my-auto flex-1"}),D("div",{className:"flex flex-col"},A.username!==N.username?[]:[D("button",{textContent:"\u21A5",className:"py-0 bg-transparent border-2 border-b-0 rounded-b-none",onclick:()=>J({action:"position",position:-1})}),D("button",{textContent:"\u21A7",className:"py-0 bg-transparent border-2 rounded-t-none",onclick:()=>J({action:"position",position:1})})]),D("button",{textContent:A.ready?"\u2713":"\u2718",className:`text-xl ${A.ready?"bg-green-500":"bg-red-500"}`,onclick:()=>A.username===N.username&&J({action:"ready"})})]))])}function O({orderedPlayers:N,currentUser:$,currentRound:F,maxRound:L}){return D("div",{className:"w-full overflow-x-auto"},[D("table",{className:"w-full table-auto"},[D("tr",{},[D("td",{textContent:""}),...N.map((q)=>{return D("td",{textContent:q.username,className:`text-sm ${$!==q.username?"":"secondary"} ${q.isConnected?"":"text-red-500"}`})})]),...[...Array(F>L?L:F).keys()].map((q)=>{return D("tr",{},[D("td",{textContent:`${q+1}`,className:"font-semibold w-1/6"}),...N.map((A)=>{return D("td",{textContent:A.score[q]!==void 0?`${A.score[q]}`:"X",className:`border text-center ${$!==A.username?"":"secondary"}`})})])}),D("tr",{},[D("td",{textContent:"Total",className:"font-semibold"}),...N.map((q)=>{return D("td",{textContent:`${q.score.reduce((A,j)=>A+=j,0)}`,className:`font-semibold ${$!==q.username?"":"secondary"}`})})])])])}function Q({currentRound:N,gameType:$,rules:F}){return D("div",{className:"flex flex-wrap gap-4 justify-center showOutline"},[D("p",{textContent:`Current Round: ${N}`}),D("h1",{textContent:`Game: ${v($)}`}),D("a",{textContent:"View Rules",href:F,className:"underline"})])}function W(){return D("div",{className:"flex flex-wrap gap-4 justify-center"},[D("label",{textContent:"Score:",htmlFor:"score",className:"flex-1"}),D("div",{className:"flex flex-1"},[D("button",{id:"scoreSign",textContent:"+",className:"flex justify-center items-center text-2xl aspect-square w-8 rounded-r-none secondary font-bold",type:"button",onclick:(N)=>{const $=N.currentTarget;$.textContent=$.textContent==="+"?"-":"+"}}),D("input",{type:"number",id:"score",className:"w-16 rounded-l-none border-l-0",inputMode:"numeric",min:"0"})]),D("button",{type:"button",textContent:"Submit",className:"flex-1",onclick:()=>{J({action:"score",score:Number(H("score"))*(document.querySelector("#scoreSign")?.textContent==="+"?1:-1)})}})])}function w(N){const $=N.players.find((z)=>z.username===N.username),F=N.players,L=[8,5,3],q=(N.currentRound-1)%3,A=F.slice(q).concat(F.slice(0,q)),j=N.players.map((z)=>z.chosenTrumps.length).reduce((z,_)=>z+_)<N.currentRound;if(!N.gameInfo.extraData.trumpOpts)throw Error("cant find trump options");if(!N.gameInfo.extraData.maxRound)throw Error("cant find maxRound");return D("div",{className:"showOutline flex flex-col gap-4 items-center"},[Q({currentRound:N.currentRound,gameType:N.gameType,rules:N.gameInfo.rules}),D("div",{className:"flex flex-wrap gap-4 justify-center showOutline"},A.map((z,_)=>{return D("div",{textContent:`${L[_]}: ${z.username}`})})),D("div",{className:"showOutline flex gap-2 items-center"},[D("p",{textContent:"Trump Suit:"}),D("p",{textContent:N.gameInfo.extraData.currentTrump,className:"text-2xl"})]),D("table",{className:"w-full table-auto text-xl"},[D("tr",{},[D("td"),...N.gameInfo.extraData.trumpOpts.map((z)=>D("td",{textContent:z}))]),...F.map((z)=>{return D("tr",{className:N.username!==z.username?"":"secondary"},[D("td",{textContent:z.username,className:"text-sm"}),...N.gameInfo.extraData?.trumpOpts?.map((_)=>{return D("td",{textContent:"\u2718",className:`text-red-500 px-0 ${z.chosenTrumps.includes(_)?"":"text-transparent"}`})})||[]])})]),O({orderedPlayers:F,currentRound:N.currentRound,currentUser:$.username,maxRound:N.gameInfo.extraData.maxRound}),D("div",{className:"showOutline"},[N.currentRound>N.gameInfo.extraData.maxRound?D("h1",{textContent:"GAME OVER",className:"font-bold text-xl"}):j&&A[0].username===N.username?D("div",{className:"grid grid-cols-2 gap-4"},[D("div",{textContent:"Choose trump suit for this round",className:"col-span-2"}),...N.gameInfo.extraData?.trumpOpts.map((z)=>{return D("button",{textContent:z,disabled:$?.chosenTrumps.includes(z),className:`text-3xl ${$?.chosenTrumps.includes(z)?"blur-sm":"secondary"}`,onclick:()=>J({action:"trump",suit:z})})})]):j&&A[0].username!==N.username?D("div",{textContent:"Waiting for trump to be chosen"}):$&&$.score.length===N.currentRound?D("p",{textContent:"Waiting for other players to add their score for this round",className:"text-center"}):W()])])}function B(N){const $=N.players.find((F)=>F.username===N.username);if(!N.gameInfo.extraData.maxRound)throw Error("Cant find maxRound");return D("div",{className:"showOutline flex flex-col gap-4 items-center"},[Q({currentRound:N.currentRound,gameType:N.gameType,rules:N.gameInfo.rules}),D("div",{textContent:`Goal: ${N.gameInfo.extraData?.roundGoal?.[N.currentRound-1]}`,className:`showOutline ${N.currentRound>N.gameInfo.extraData.maxRound?"hidden":"block"}`}),O({orderedPlayers:N.players,currentUser:N.username,currentRound:N.currentRound,maxRound:N.gameInfo.extraData.maxRound}),D("div",{className:"showOutline"},[N.currentRound>N.gameInfo.extraData.maxRound?D("h1",{textContent:"GAME OVER",className:"font-bold text-xl"}):$.score.length===N.currentRound?D("p",{textContent:"Waiting for other players to add their score for this round",className:"text-center"}):D("div",{className:"flex gap-4 justify-center"},[D("label",{textContent:"Score:",htmlFor:"score",className:"w-1/3"}),D("input",{type:"number",id:"score",value:"0",className:"w-1/3"}),D("button",{textContent:"Submit",className:"w-1/3",onclick:()=>{console.log("submit score"),J({action:"score",score:Number(H("score"))})}})])])])}function C(N){return D("div",{textContent:"Thousand game is running"})}function V(N){const $=new URL(window.location.href);return $.searchParams.delete("username"),window.history.replaceState(null,"",`/${$.search}`),x(N)}function M(N){return window.location.reload(),D("div",{textContent:"Reload"})}function Z(N){let $;return window.addEventListener("mousedown",()=>{console.log("down"),$=setTimeout(()=>{console.log("held down for 5 seconds")},5000)}),window.addEventListener("mouseup",()=>{console.log("up"),clearTimeout($)}),D("div",{className:"min-h-screen flex flex-col"},[D("div",{className:"flex justify-between items-center px-8 py-4 border-b"},[D("a",{textContent:"Scoreboard",className:"text-xl font-semibold",href:"/"}),D("button",{textContent:"\uD83C\uDF17\uFE0E",className:"secondary",onclick:(F)=>{F.preventDefault();const L=window.localStorage.getItem("theme"),q=L==="dark"?"light":"dark";if(L)document.documentElement.classList.remove(L);document.documentElement.classList.add(q),window.localStorage.setItem("theme",q)}})]),D("div",{className:"flex-1 flex justify-center items-center sm:w-4/5 w-11/12 mx-auto my-8"},[N])])}function D(N,$,F){const L=document.createElement(N);if($)Object.keys($).forEach((q)=>L[q]=$[q]);if(F?.length)L.append(...F);return L}function E(N){return[...Array(N).keys()].map(()=>{return"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random()*"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".length)]}).join("")}function H(N){return document.querySelector(`#${N}`).value}function f(N,$){return $.every((L)=>{return H(L)||document.querySelector(`#${L}`).setCustomValidity(`${L} is required`)})||document.querySelector(`#${N}`).reportValidity()}function R(N){const $=new URL(window.location.toString());Object.keys(N).forEach((F)=>{$.searchParams.set(F,N[F])}),window.history.pushState({},"",$)}function v(N,$){return N.split("").reduce((F,L,q)=>{if(q===0)return L.toUpperCase();if("A"<=L&&L<="Z")return`${F} ${L}`;return F+L},"")+($?"s":"")}function J(N){Y.send(JSON.stringify(N))}function X(N){if(Y)Y.close();Y=new WebSocket(`${window.location.protocol==="http:"?"ws:":"wss:"}//${window.location.host}`),Y.onopen=()=>{console.log("opened",N),Y.send(JSON.stringify(N))},Y.onmessage=($)=>{const F=JSON.parse($.data);console.log("NEW MESSAGE",F);const L=new URLSearchParams(window.location.toString());if(!L.get("username")||!L.get("gameCode"))R({username:F.username,gameCode:F.gameCode});document.body.innerHTML="",document.body.appendChild(Z(S[F.status](F)))}}var S={home:G,getUsername:x,waiting:K,threeFiveEight:w,shanghai:B,thousand:C,badUsername:V,refresh:M},Y;var T=function(){return[...new URL(window.location.href).searchParams.entries()].reduce((N,$)=>{return $[0],N[$[0]]=$[1],N},{})},k=function(){const{gameCode:N,username:$}=T();if(N&&$)X({action:"join",username:$,gameCode:N});else if(N)document.body.append(Z(S.getUsername({})));else document.body.append(Z(S.home({})))};k();document.documentElement.classList.add(window.localStorage.getItem("theme")||"light");document.addEventListener("visibilitychange",()=>{if(!document.hidden)k()});window.addEventListener("popstate",()=>{k()});
