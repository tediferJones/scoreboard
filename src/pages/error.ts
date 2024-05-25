import { setQueryParam } from '@/lib/utils';
import getUsername from '@/pages/getUsername';
import { ServerMsg } from '@/types';

export default function error(msg: ServerMsg) {
  setQueryParam({ gameCode: msg.gameCode })
  return getUsername(msg);
}
