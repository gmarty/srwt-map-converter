import { readFile } from 'node:fs/promises'
import assert from 'node:assert'
import { Xml } from './xml.js'
import pkg from '../package.json' with { type: 'json' }

const UINT8 = 'UINT8'
const UINT16 = 'UINT16'
const UINT32 = 'UINT32'
const FLOAT = 'FLOAT'

export default async (file, colladaVersion = '1.5.0') => {
  const xml = new Xml().openNode('COLLADA')

  if (colladaVersion === '1.4.1') {
    xml
      .setAttribute('xmlns', 'http://www.collada.org/2005/11/COLLADASchema')
      .setAttribute('version', '1.4.1')
  } else {
    xml
      .setAttribute('xmlns', 'http://www.collada.org/2008/03/COLLADASchema')
      .setAttribute('version', '1.5.0')
  }

  await parseAssets(file, xml)
  await parseAnimations(file, xml)
  await parseControllers(file, xml)
  await parseEffects(file, xml)
  await parseImages(file, xml)
  await parseMaterials(file, xml)
  await parseGeometries(file, xml)
  await parseVisualScenes(file, xml)
  await parseScene(file, xml)

  return xml.getString()
}

const parseAssets = async (file, xml) => {
  const parser = await defaultParser(`${file}.dae.asset`)
  const { name, version } = pkg
  const date = new Date().toISOString()

  xml
    .openNode('asset')
    .openNode('contributor')
    .openNode('author')
    .setContent(`${name} contributors`)
    .closeNode()
    .openNode('authoring_tool')
    .setContent(`${name} (version ${version})`)
    .closeNode()
    .closeNode()
    .openNode('created')
    .setContent(date)
    .closeNode()
    .openNode('modified')
    .setContent(date)
    .closeNode()

    .openNode('up_axis')

  const upAxis = parser.next()

  xml
    .setContent(upAxis.value)

    .closeNode()
    .closeNode()
}

const parseAnimations = async (file, xml) => {
  const parser = await defaultParser(`${file}.dae.animations`, UINT16)

  xml.openNode('library_animations')

  const { value: animationsCount } = parser.next()
  console.log('animationsCount', animationsCount)
  // assert.equal(animationsCount, 0)
  for (let effect = 0; effect < animationsCount; effect++) {
    xml.openNode('animation')
    xml.closeNode()
  }

  xml.closeNode()
}

const parseControllers = async (file, xml) => {
  const parser = await defaultParser(`${file}.dae.controllers`, UINT16)

  xml.openNode('library_controllers')

  const { value: controllersCount } = parser.next()
  console.log('controllersCount', controllersCount)
  assert.equal(controllersCount, 0)
  for (let effect = 0; effect < controllersCount; effect++) {
    xml.openNode('controller')
    xml.closeNode()
  }

  xml.closeNode()
}

const parseEffects = async (file, xml) => {
  const parser = await defaultParser(`${file}.dae.effects`, UINT16)
  let id
  let sid
  let content
  let magic

  xml.openNode('library_effects')

  const { value: effectsCount } = parser.next()
  console.log('effectsCount', effectsCount)
  for (let effect = 0; effect < effectsCount; effect++) {
    xml.openNode('effect')

    id = parser.next()
    xml.setAttribute('id', id.value)

    magic = parser.next()
    xml.addComment(magic.value)
    console.log('magic', magic.value)
    assert.equal(magic.value, 0)

    magic = parser.next(UINT16)
    xml.addComment(magic.value + ' (0 or 1)')
    console.log('magic', magic.value)
    assert(magic.value === 0 || magic.value === 1)

    magic = parser.next(UINT16)
    xml.addComment(magic.value + ' (0 or 1)')
    console.log('magic', magic.value)
    assert(magic.value === 0 || magic.value === 1)

    const { value: somethingCount } = parser.next(UINT16)
    xml.addComment(somethingCount + ' (somethingCount)')
    console.log('somethingCount', somethingCount)

    return

    // for (let something = 0; something < somethingCount; something++) {
    //   xml.openNode('profile_COMMON')
    //   xml.openNode('newparam')

    //   sid = parser.next()
    //   xml.setAttribute('sid', sid.value)

    //   magic = parser.next(UINT16)
    //   xml.addComment(magic.value)
    //   console.log('magic', magic.value)
    //   // assert.equal(magic.value, 1)

    //   magic = parser.next(UINT16)
    //   xml.addComment(magic.value)
    //   console.log('magic', magic.value)

    //   magic = parser.next(UINT16)
    //   xml.addComment(magic.value)
    //   console.log('magic', magic.value)
    //   // assert.equal(magic.value, 0)

    //   magic = parser.next(UINT16)
    //   xml.addComment(magic.value)
    //   console.log('magic', magic.value)
    //   // assert.equal(magic.value, 0)

    //   magic = parser.next(UINT16)
    //   xml.addComment(magic.value)
    //   console.log('magic', magic.value)
    //   // assert.equal(magic.value, 0)

    //   magic = parser.next(UINT16)
    //   xml.addComment(magic.value)
    //   console.log('magic', magic.value)
    //   // assert.equal(magic.value, 256)

    //   xml.openNode('surface')

    //   content = parser.next()
    //   xml.setContent(content.value)

    //   xml.openNode('format')
    //   xml.openNode('exact')

    //   content = parser.next()
    //   xml.setContent(content.value)

    //   xml.closeNode()
    //   xml.closeNode()

    //   // xml.closeNode()
    //   // xml.closeNode()

    //   magic = parser.next()
    //   xml.addComment(magic.value)
    //   console.log('magic', magic.value)

    //   xml.openNode('newparam')

    //   sid = parser.next()
    //   xml.setAttribute('sid', sid.value)

    //   magic = parser.next()
    //   xml.addComment(magic.value)
    //   console.log('magic', magic.value)

    //   for (let i = 0; i < 5; i++) {
    //     magic = parser.next(UINT16)
    //     xml.addComment(magic.value)
    //     console.log('magic', magic.value)
    //   }

    //   xml.openNode('sampler2D')
    //   xml.openNode('source')

    //   content = parser.next()
    //   xml.setContent(content.value)

    //   xml.closeNode()
    //   xml.closeNode()

    //   xml.openNode('sampler3D')
    //   xml.openNode('source')

    //   const nodes = ['wrap_s', 'wrap_t', 'wrap_p', 'minfilter', 'magfilter']
    //   for (let i = 0; i < nodes.length; i++) {
    //     xml.openNode(nodes[i])

    //     content = parser.next()
    //     xml.setContent(content.value)

    //     xml.closeNode()
    //   }

    //   // UINT8? Is it the only case where it happens?
    //   magic = parser.next(UINT8)
    //   xml.addComment(magic.value)
    //   console.log('magic', magic.value)

    //   xml.closeNode()
    //   xml.closeNode()

    //   xml.closeNode()

    //   xml.closeNode()

    //   xml.closeNode()
    //   xml.closeNode()
    // }

    // xml.openNode('unknown')

    // content = parser.next()
    // xml.setContent(content.value)

    // xml.closeNode()

    // magic = parser.next()
    // xml.addComment(magic.value)
    // console.log('magic', magic.value)

    // magic = parser.next()
    // xml.addComment(magic.value)
    // console.log('magic', magic.value)

    // xml.closeNode()

    // xml.closeNode()
    // xml.closeNode()
    xml.closeNode()
  }

  xml.closeNode()
}

const parseImages = async (file, xml) => {
  const parser = await defaultParser(`${file}.dae.images`, UINT16)

  xml.openNode('library_images')

  const { value: imagesCount } = parser.next()
  for (let image = 0; image < imagesCount; image++) {
    xml.openNode('image')

    const id = parser.next()
    xml.setAttribute('id', id.value)

    const name = parser.next()
    xml.setAttribute('name', name.value)

    xml.openNode('init_from')
    xml.openNode('ref')

    const src = parser.next()
    // Replace image extension.
    xml.setContent(src.value.replace(/.gnf$/, '.png'))

    xml.closeNode()
    xml.closeNode()

    xml.closeNode()
  }

  xml.closeNode()
}

const parseMaterials = async (file, xml) => {
  const parser = await defaultParser(`${file}.dae.materials`, UINT16)
  let id
  let name
  let url

  xml.openNode('library_materials')

  const { value: materialsCount } = parser.next()
  console.log('materialsCount', materialsCount)
  for (let material = 0; material < materialsCount; material++) {
    xml.openNode('material')

    id = parser.next()
    xml.setAttribute('id', id.value)

    name = parser.next()
    xml.setAttribute('name', name.value)

    xml.openNode('instance_effect')

    url = parser.next()
    xml.setAttribute('url', url.value)

    xml.closeNode()
    xml.closeNode()
  }

  xml.closeNode()
}

const parseGeometries = async (file, xml) => {
  const parser = await defaultParser(`${file}.dae.geometries`, UINT16)
  let id
  let name
  let count
  let stride
  let type
  let material
  let semantic
  let source
  let magic

  const SEMANTICS = [
    'COLOR',
    'CONTINUITY',
    'IMAGE',
    'INPUT',
    'IN_TANGENT',
    'INTERPOLATION',
    'INV_BIND_MATRIX',
    'JOINT',
    'LINEAR_STEPS',
    'MORPH_TARGET',
    'MORPH_WEIGHT',
    'NORMAL',
    'OUTPUT',
    'OUT_TANGENT',
    'POSITION',
    'TANGENT',
    'TEXBINORMAL',
    'TEXCOORD',
    'TEXTANGENT',
    'UV',
    'VERTEX',
  ]

  xml.openNode('library_geometries')

  const { value: meshesCount } = parser.next()
  xml.addComment(meshesCount + ' (meshesCount)')
  console.log('meshesCount', meshesCount)
  for (let mesh = 0; mesh < meshesCount; mesh++) {
    console.log('mesh number', mesh)

    xml.openNode('geometry')

    id = parser.next()
    xml.setAttribute('id', id.value)

    name = parser.next()
    xml.setAttribute('name', name.value)

    xml.openNode('mesh')

    const { value: sourcesCount } = parser.next()
    xml.addComment(sourcesCount + ' (sourcesCount)')
    console.log('sourcesCount', sourcesCount)
    for (let sourceContent = 0; sourceContent < sourcesCount; sourceContent++) {
      xml.openNode('source')

      id = parser.next()
      xml.setAttribute('id', id.value)

      name = parser.next()
      xml.setAttribute('name', name.value)

      magic = parser.next(UINT16)
      xml.addComment(magic.value)
      console.log('magic', magic.value)
      assert.equal(magic.value, 1)

      magic = parser.next(UINT16)
      xml.addComment(magic.value)
      console.log('magic', magic.value)
      assert.equal(magic.value, 257) // Means open a <source> element?

      const stride0 = parser.next(UINT16)
      xml.addComment(stride0.value + ' (stride)')
      console.log('stride0', stride0.value + ' (stride)')
      assert(stride0.value === 2 || stride0.value === 3)

      xml.openNode('technique_common')
      xml.openNode('accessor')

      source = parser.next()
      xml.setAttribute('source', source.value)

      count = parser.next(UINT32)
      xml.setAttribute('count', count.value)

      stride = parser.next(UINT32)
      xml.setAttribute('stride', stride.value)
      assert.equal(stride0.value, stride.value)

      for (let i = 0; i < stride.value; i++) {
        xml.openNode('param')

        name = parser.next()
        xml.setAttribute('name', name.value)

        magic = parser.next()
        xml.addComment(magic.value)
        console.log('magic', magic.value)
        assert.equal(magic.value, 0)

        type = parser.next()
        xml.setAttribute('type', type.value)

        // Could also be read as 3 Uint16.
        magic = parser.next()
        xml.addComment(magic.value)
        console.log('magic', magic.value)
        assert.equal(magic.value, 0)

        magic = parser.next()
        xml.addComment(magic.value)
        console.log('magic', magic.value)
        assert.equal(magic.value, 0)

        xml.closeNode()
      }

      xml.closeNode()
      xml.closeNode()

      xml.openNode('float_array')

      magic = parser.next(UINT16)
      xml.addComment(magic.value)
      console.log('magic', magic.value)
      assert.equal(magic.value, 256) // Means open a <float_array> element?

      count = parser.next(UINT32)
      xml.setAttribute('count', count.value)

      id = parser.next()
      xml.setAttribute('id', id.value)

      const content = []
      for (let i = 0; i < count.value; i++) {
        const float = parser.next(FLOAT)
        content.push(float.value)
      }
      xml.setContent(content.join(' '))

      xml.closeNode()
      xml.closeNode()
    }

    xml.openNode('triangles')

    magic = parser.next(UINT16)
    xml.addComment(magic.value + ' (1)')
    console.log('magic', magic.value)
    assert.equal(magic.value, 1)

    let { value: inputCount } = parser.next(UINT16)
    console.log('inputCount', inputCount)
    assert(inputCount === 2 || inputCount === 3 || inputCount === 4)

    material = parser.next()
    xml.setAttribute('material', material.value)
    // lambert16SG

    magic = parser.next(UINT16)
    xml.addComment(magic.value + ' (between 2 and 16630)')
    console.log('magic', magic.value)
    assert(magic.value >= 2 && magic.value <= 16630)

    magic = parser.next(UINT16)
    xml.addComment(magic.value + ' (0)')
    console.log('magic', magic.value)
    assert.equal(magic.value, 0)

    const { value: itemsCount } = parser.next(UINT32)
    xml.setAttribute('count', itemsCount)
    console.log('itemsCount', itemsCount)

    xml.openNode('p')

    const content = []
    for (let i = 0; i < itemsCount; i++) {
      const number = parser.next(UINT16)
      content.push(number.value)
    }
    xml.setContent(content.join(' '))

    xml.closeNode()

    for (let i = 0; i < inputCount; i++) {
      console.log('input number', i)

      xml.openNode('input')

      const offset = parser.next(UINT32)
      xml.setAttribute('offset', offset.value)
      console.log('offset', offset.value)
      assert(offset.value >= 0 && offset.value <= 3)

      semantic = parser.next()
      xml.setAttribute('semantic', semantic.value)
      console.log('semantic', semantic.value)

      const semanticId = parser.next(UINT32)
      console.log('semanticId', semanticId.value)

      console.log(
        'semantic index',
        SEMANTICS.findIndex((s) => semantic.value.startsWith(s))
      )

      assert.equal(
        semanticId.value,
        // @todo Use === instead of startsWith when debug is off.
        SEMANTICS.findIndex((s) => semantic.value.startsWith(s))
      )

      source = parser.next()
      xml.setAttribute('source', source.value)
      console.log('source', source.value)

      const unknown2 = parser.next(UINT16)
      xml.setAttribute('unknown2', unknown2.value)
      console.log('unknown2', unknown2.value)
      assert.equal(unknown2.value, 0)

      const unknown3 = parser.next(UINT16)
      xml.setAttribute('unknown3', unknown3.value)
      console.log('unknown3', unknown3.value)
      assert.equal(unknown3.value, 0)

      xml.closeNode()
    }

    magic = parser.next(UINT16)
    xml.addComment(magic.value + ' (1)')
    console.log('magic', magic.value)
    assert.equal(magic.value, 1)

    let { value: inputCount2 } = parser.next(UINT16)
    console.log('inputCount2', inputCount2)
    assert(inputCount2 === 1 || inputCount2 === 2)

    xml.closeNode()
    xml.openNode('vertices')

    id = parser.next()
    xml.setAttribute('id', id.value)
    console.log('id', id.value)

    for (let i = 0; i < inputCount2; i++) {
      console.log('input number', i)

      xml.openNode('input')

      const unknown1 = parser.next(UINT32)
      xml.setAttribute('unknown1', unknown1.value)
      console.log('unknown1', unknown1.value)
      assert(
        unknown1.value === 0 || unknown1.value === 1 || unknown1.value === 2
      )

      semantic = parser.next()
      xml.setAttribute('semantic', semantic.value)
      console.log('semantic', semantic.value)

      const semanticId = parser.next(UINT32)
      console.log('semanticId', semanticId.value)

      console.log(
        'semantic index',
        SEMANTICS.findIndex((s) => semantic.value.startsWith(s))
      )

      assert.equal(
        semanticId.value,
        // @todo Use === instead of startsWith when debug is off.
        SEMANTICS.findIndex((s) => semantic.value.startsWith(s))
      )

      source = parser.next()
      xml.setAttribute('source', source.value)
      console.log('source', source.value)

      const unknown2 = parser.next(UINT16)
      xml.setAttribute('unknown2', unknown2.value)
      console.log('unknown2', unknown2.value)
      assert.equal(unknown2.value, 0)

      const unknown3 = parser.next(UINT16)
      xml.setAttribute('unknown3', unknown3.value)
      console.log('unknown3', unknown3.value)
      assert.equal(unknown3.value, 0)

      xml.closeNode()
    }

    xml.closeNode()
    xml.closeNode()
    xml.closeNode()
  }

  // Making sure we've exhausted all the data.
  magic = parser.next(UINT16)
  console.log('magic', magic.value)
  assert.equal(magic.value, undefined)

  xml.closeNode()
}

const parseVisualScenes = async (file, xml) => {
  const parser = await defaultParser(`${file}.dae.visual_scenes`, UINT16)
  let val
  let id
  let name
  let type
  let sid
  let url
  let symbol
  let target
  let magic

  xml.openNode('library_visual_scenes')

  const { value: visualScenesCount } = parser.next()
  console.log('visualScenesCount', visualScenesCount)
  assert.equal(visualScenesCount, 1)
  for (let scene = 0; scene < visualScenesCount; scene++) {
    xml.openNode('visual_scene')

    id = parser.next()
    xml.setAttribute('id', id.value)

    name = parser.next()
    xml.setAttribute('name', name.value)

    for (let i = 0; i < 10; i++) {
      magic = parser.next(UINT16)
      xml.addComment(magic.value)
      console.log('magic', magic.value)
    }

    for (let node = 0; node < 2; node++) {
      xml.openNode('node')

      id = parser.next()
      xml.setAttribute('id', id.value)

      magic = parser.next()
      xml.addComment(magic.value + ' (0)')
      console.log('magic', magic.value)
      assert.equal(magic.value, 0)

      type = parser.next()
      xml.setAttribute('type', type.value)

      name = parser.next()
      xml.setAttribute('name', name.value)

      for (let i = 0; i < 5; i++) {
        magic = parser.next(UINT16)
        xml.addComment(magic.value)
        console.log('magic', magic.value)
      }

      xml.openNode('matrix')

      sid = parser.next()
      xml.setAttribute('transform', sid.value)
      console.log('transform', sid.value)

      const content = []
      for (let i = 0; i < 16; i++) {
        const float = parser.next(FLOAT)
        content.push(float.value)
      }
      xml.setContent(content.join(' '))

      xml.closeNode()
      xml.closeNode()
    }

    xml.closeNode()
    xml.closeNode()

    return

    // @todo Move the rest inside the nodes loop.
    // @todo Determine when a node has an instance_geometry.
    xml.openNode('instance_geometry')

    url = parser.next()
    xml.setAttribute('url', url.value)

    magic = parser.next(UINT16)
    xml.addComment(magic.value)
    console.log('magic', magic.value)

    magic = parser.next(UINT16)
    xml.addComment(magic.value)
    console.log('magic', magic.value)

    magic = parser.next()
    xml.addComment(magic.value)
    console.log('magic', magic.value)

    xml.openNode('bind_material')
    xml.openNode('technique_common')
    xml.openNode('instance_material')

    symbol = parser.next()
    xml.setAttribute('symbol', symbol.value)

    target = parser.next()
    xml.setAttribute('target', target.value)

    magic = parser.next(UINT16)
    xml.addComment(magic.value)
    console.log('magic', magic.value)

    magic = parser.next(UINT16)
    xml.addComment(magic.value)
    console.log('magic', magic.value)

    xml.openNode('bind_vertex_input')

    val = parser.next()
    xml.setAttribute('input_semantic', val.value)

    val = parser.next()
    xml.setAttribute('semantic', val.value)

    magic = parser.next()
    xml.addComment(magic.value)
    console.log('magic', magic.value)

    magic = parser.next()
    xml.addComment(magic.value)
    console.log('magic', magic.value)

    magic = parser.next()
    xml.addComment(magic.value)
    console.log('magic', magic.value)

    magic = parser.next()
    xml.addComment(magic.value)
    console.log('magic', magic.value)

    xml.closeNode()
    xml.closeNode()
    xml.closeNode()
    xml.closeNode()
    xml.closeNode()
    xml.closeNode()
    xml.closeNode() // visual_scene
  }

  xml.closeNode() // library_visual_scenes
}

const parseScene = async (file, xml) => {
  const parser = await defaultParser(`${file}.dae.scene`, UINT8)

  xml.openNode('scene')

  const { value: scenesCount } = parser.next()
  assert.equal(scenesCount, 1)
  for (let scene = 0; scene < scenesCount; scene++) {
    xml.openNode('instance_visual_scene')

    const url = parser.next()
    xml.setAttribute('url', url.value)

    xml.closeNode()
  }

  xml.closeNode()
}

const defaultParser = async (file, readingMode) => {
  let buffer
  try {
    buffer = await readFile(file)
  } catch (e) {
    throw new Error(`Could not open ${file}.`)
  }

  return (function* defaultParser() {
    let val = null
    let length = 0
    let pointer = 0

    while (pointer < buffer.length) {
      console.log('-pointer', pointer)

      switch (readingMode) {
        case undefined:
        default:
          // Default reading mode: string.
          length = buffer.readUint8(pointer)
          if (length === 0) {
            val = `<null> (pointer: ${pointer})`
            pointer++
          } else if (length === 1) {
            val = buffer.readUint16LE(pointer + 1)
            pointer += 2 + length
          } else {
            val = buffer.subarray(pointer + 2, pointer + 1 + length)
            val = val.toString()
            pointer += 2 + length
          }
          readingMode = yield val
          break

        case UINT8:
          val = buffer.readUint8(pointer)
          pointer += 1
          readingMode = yield val
          break

        case UINT16:
          val = buffer.readUint16LE(pointer)
          pointer += 2
          readingMode = yield val
          break

        case UINT32:
          val = buffer.readUint32LE(pointer)
          pointer += 4
          readingMode = yield val
          break

        case FLOAT:
          val = buffer.readFloatLE(pointer)
          pointer += 4
          readingMode = yield val
          break
      }
    }
  })()
}
