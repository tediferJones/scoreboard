export default async function build() {
  await Bun.build({
    entrypoints: ['src/client.ts'],
    outdir: 'src/public',
  })

  Bun.spawnSync('bunx tailwindcss -i src/globals.css -o src/public/styles.css'.split(' '))
}
