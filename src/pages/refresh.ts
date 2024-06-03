import { getTag as t } from '@/lib/utils';

export default function refresh() {
  window.location.reload();
  return t('div', { textContent: 'Reload' })
}
