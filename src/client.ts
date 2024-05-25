import { pages, startWebSocket } from '@/lib/utils';
import { ServerMsg } from '@/types';
import layout from '@/layout';

const url = new URL(window.location.href);
const gameCode = url.searchParams.get('gameCode');
const username = url.searchParams.get('username');

if (gameCode && username) {
  startWebSocket({ action: 'join', username, gameCode });
} else if (gameCode) {
  document.body.append(layout(pages.getUsername({} as ServerMsg)));
} else {
  document.body.append(layout(pages.home({} as ServerMsg)));
}

// Set initial theme
document.documentElement.classList.add(
  window.localStorage.getItem('theme') || 'light'
);

// Handle page going into background
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) window.location.reload();
});

// Handle page reload when user goes back or forward
window.addEventListener('popstate', () => {
  window.location.reload();
})
