import { setQueryParam } from '@/lib/utils';
import getUsername from '@/render/getUsername';
import { ServerMsg } from '@/types';

export default function error(msg: ServerMsg) {
  setQueryParam({ gameCode: msg.gameCode })
  return getUsername(msg);
}
