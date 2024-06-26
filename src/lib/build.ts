export default async function build() {
  await Bun.build({
    entrypoints: ['src/client.ts'],
    outdir: 'src/public',
    minify: true,
  })

  Bun.spawnSync('bunx tailwindcss -i src/globals.css -o src/public/styles.css'.split(' '))
}
