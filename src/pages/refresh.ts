import { getTag as t } from '@/lib/utils';
import { ServerMsg } from '@/types';

export default function refresh(msg: ServerMsg) {
  window.location.reload();
  return t('div', { textContent: 'Reload' })
}
