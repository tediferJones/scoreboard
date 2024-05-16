import { ServerMsg } from '@/types';
import { getTag as t } from '@/lib/utils';

export default function running(msg: ServerMsg) {
  return t('h1', { textContent: 'game is running' })
}
