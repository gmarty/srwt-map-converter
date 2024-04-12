import { parseArgs } from 'node:util'
import { basename } from 'node:path'
import { writeFile } from 'node:fs/promises'
import pkg from './package.json' with { type: 'json' }
import parseDae from './lib/parse-dae.js'

const options = {
  version: {
    type: 'boolean',
    short: 'v',
    default: false,
  },
  collada: {
    type: 'string',
    short: 'c',
    default: '1.5.0',
  },
}

const { values, positionals } = parseArgs({
  options,
  allowPositionals: true,
})

if (values.version) {
  const { version } = pkg
  console.log(version)
  process.exit(0)
}

const COLLADA_VERSIONS = ['1.4.1', '1.5.0']
if (!COLLADA_VERSIONS.includes(values['collada'])) {
  const formatter = new Intl.ListFormat('en', {
    style: 'short',
    type: 'disjunction',
  })
  console.error(`
Unknown specified Collada version "${values['collada']}".`)
  console.error(
    `Must be ${formatter.format(COLLADA_VERSIONS.map((s) => `"${s}"`))}.`
  )
  process.exit(0)
}

if (!positionals.length) {
  const { description, version } = pkg
  console.log(`
\x1b[1mDescription:\x1b[0m
  ${description} [version ${version}]

\x1b[1mSynopsis:\x1b[0m
  This tool attemps to parse a binary encoded map 3D model to Collada.
  Pass the path to one of the files containing the .dae.* extension.

  \x1b[33m⚠️ Work in progress: not working yet\x1b[0m

\x1b[1mUsage:\x1b[0m
  node ${basename(import.meta.url)} [options] path/to/map/folder

\x1b[1mOptions:\x1b[0m
  --collada, -c   Specify the Collada version (default: 1.5.0).
  --version, -v   Print the version number.`)
  process.exit(0)
}

const COLLADA_LIBRARIES = [
  'animations',
  'asset',
  'controllers',
  'effects',
  'geometries',
  'images',
  'materials',
  'scene',
  'visual_scenes',
]
const librariesRegexp = new RegExp(`\.dae\.(${COLLADA_LIBRARIES.join('|')})$`)
const modelPath = positionals[0].replace(librariesRegexp, '')

const dae = await parseDae(modelPath)
await writeFile(`./converted-dae/${basename(modelPath)}.dae`, dae, {
  encoding: 'utf-8',
})
