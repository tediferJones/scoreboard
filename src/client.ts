import { renderOpts, startWebSocket } from '@/lib/utils';
import { ServerMsg } from '@/types';

const url = new URL(window.location.href);
const gameCode = url.searchParams.get('gameCode');
const username = url.searchParams.get('username');

if (gameCode && username) {
  startWebSocket({ action: 'join', username, gameCode });
} else if (gameCode) {
  document.body.append(renderOpts.getUsername({} as ServerMsg));
} else {
  document.body.append(renderOpts.home({} as ServerMsg));
}

// Set initial theme
document.documentElement.classList.add(
  window.localStorage.getItem('theme') || 'light'
);

// Handle page going into background
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) window.location.reload();
});
