import { ServerMsg } from '@/types';
import home from '@/pages/home';

export default function gameFull(msg: ServerMsg<'gameFull'>) {
  console.log('went through gameFull page')
  return home(msg as any)
}
