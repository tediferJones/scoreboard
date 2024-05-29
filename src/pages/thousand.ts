import { ServerMsg } from '@/types';
import { getTag as t } from '@/lib/utils';

export default function thousand(msg: ServerMsg) {
  return t('div', { textContent: 'Thousand game is running' })
}
