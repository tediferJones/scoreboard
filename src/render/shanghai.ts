import { ServerMsg } from '@/types';
import { getTag as t } from '@/lib/utils';

export default function shanghai(msg: ServerMsg) {
  return t('h1', { textContent: 'Shanghai game is running' })
}
