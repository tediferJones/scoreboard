import { fromCamelCase, getTag as t } from "@/lib/utils"

export default function basicGameInfo({ currentRound, gameType, rules }: { currentRound: number, gameType: string, rules: string }) {
  return t('div', { className: 'flex flex-wrap gap-4 justify-center showOutline' }, [
    t('p', { textContent: `Current Round: ${currentRound}` }),
    t('h1', { textContent: `Game: ${fromCamelCase(gameType)}` }),
    t('a', {
      textContent: 'View Rules',
      href: rules,
      className: 'underline',
    }),
  ])
}
