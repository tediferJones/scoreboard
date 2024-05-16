import { renderOpts } from '@/lib/utils';
import { ServerMsg, StrObj } from '@/types';

const queryParams = [
  ...new URLSearchParams(window.location.search).entries()
].reduce((obj, param) => {
  const [key, val] = param;
  obj[key] = val;
  return obj;
}, {} as StrObj)
console.log(queryParams)

document.body.append(
  renderOpts[queryParams.gameCode ? 'getUsername' : 'home']({} as ServerMsg)
)
