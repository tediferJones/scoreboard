import { pages, startWebSocket } from '@/lib/utils';
import { ServerMsg } from '@/types';
import layout from '@/layout';

function getParams() {
  return [...new URL(window.location.href).searchParams.entries()]
    .reduce((params, entry) => {
      entry[0]
      params[entry[0]] = entry[1]
      return params
    }, {} as { [key: string]: string })
}

function handleInitialRender() {
  const { gameCode, username } = getParams();
  if (gameCode && username) {
    startWebSocket({ action: 'join', username, gameCode });
  } else if (gameCode) {
    document.body.append(layout(pages.getUsername({} as ServerMsg)));
  } else {
    document.body.append(layout(pages.home({} as ServerMsg)));
  }
}
handleInitialRender();

// Set initial theme
document.documentElement.classList.add(
  window.localStorage.getItem('theme') || 'light'
);

// Handle page going into background
document.addEventListener('visibilitychange', () => {
  // if (!document.hidden) window.location.reload();
  if (!document.hidden) handleInitialRender();
});

// Handle page reload when user goes back or forward
window.addEventListener('popstate', () => {
  // window.location.reload();
  handleInitialRender();
})
