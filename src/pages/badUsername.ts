import getUsername from '@/pages/getUsername';
import { ServerMsg } from '@/types';

export default function badUsername(msg: ServerMsg) {
  const url = new URL(window.location.href)
  url.searchParams.delete('username')
  window.history.replaceState(null, '', `/${url.search}`)
  return getUsername(msg);
}
