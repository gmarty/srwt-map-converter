import assert from 'node:assert'
import pkg from '../package.json' with { type: 'json' }
import { Xml } from './xml.js'
import { defaultParser, UINT8, UINT16, UINT32, FLOAT } from './utils/helper.js'

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

  await parseAsset(file, xml)
  await parseAnimations(file, xml)
  await parseControllers(file, xml)
  await parseImages(file, xml)
  await parseMaterials(file, xml)
  await parseEffects(file, xml)
  await parseGeometries(file, xml)
  await parseVisualScenes(file, xml)
  await parseScene(file, xml)

  return xml.getString()
}

const parseAsset = async (file, xml) => {
  const assetFile = `${file}.dae.asset`
  const parser = await defaultParser(assetFile)
  const { name, version } = pkg
  const date = new Date().toISOString()
  const upAxis = parser.next()

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
    .setContent(upAxis.value)
    .closeNode()

    .closeNode()
}

const parseAnimations = async (file, xml) => {
  const animationsFile = `${file}.dae.animations`
  const parser = await defaultParser(animationsFile, UINT16)
  const { value: animationsCount } = parser.next()

  if (animationsCount === 0) {
    return
  }

  xml.openNode('library_animations')

  console.log('animationsCount', animationsCount)
  // assert.equal(animationsCount, 0)
  for (let effect = 0; effect < animationsCount; effect++) {
    xml.openNode('animation')
    xml.closeNode()
  }

  xml.closeNode()
}

const parseControllers = async (file, xml) => {
  const controllersFile = `${file}.dae.controllers`
  const parser = await defaultParser(controllersFile, UINT16)
  const { value: controllersCount } = parser.next()

  if (controllersCount === 0) {
    return
  }

  throw new Error(
    `Unsupported non-zero controllers count (${controllersCount}) in ${controllersFile}.`
  )
}

const parseImages = async (file, xml) => {
  const imagesFile = `${file}.dae.images`
  const parser = await defaultParser(imagesFile, UINT16)
  const { value: imagesCount } = parser.next()

  if (imagesCount === 0) {
    return
  }

  xml.openNode('library_images')

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
    xml.setContent(src.value.replace(/\.gnf$/, '.png'))

    xml.closeNode()
    xml.closeNode()

    xml.closeNode()
  }

  xml.closeNode()
}

const parseMaterials = async (file, xml) => {
  const materialsFile = `${file}.dae.materials`
  const parser = await defaultParser(materialsFile, UINT16)
  const { value: materialsCount } = parser.next()

  if (materialsCount === 0) {
    return
  }

  let id
  let name
  let url

  xml.openNode('library_materials')

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

const parseEffects = async (file, xml) => {
  const effectsFile = `${file}.dae.effects`
  const parser = await defaultParser(effectsFile, UINT16)
  const { value: effectsCount } = parser.next()

  if (effectsCount === 0) {
    return
  }

  let id
  let magic

  xml.openNode('library_effects')

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

const parseGeometries = async (file, xml) => {
  const geometriesFile = `${file}.dae.geometries`
  const parser = await defaultParser(geometriesFile, UINT16)
  const { value: meshesCount } = parser.next()

  if (meshesCount === 0) {
    return
  }

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

  const isOmittedToken = (value) =>
    value === 0 || (typeof value === 'string' && value.startsWith('<null>'))

  const asOptionalAttribute = (value, fieldName) => {
    if (isOmittedToken(value)) {
      return null
    }

    // Collada sid/semantic are string attributes.
    assert.equal(
      typeof value,
      'string',
      `${fieldName} must be a string when present`
    )
    return value
  }

  const asOptionalContent = (value) => (isOmittedToken(value) ? null : value)

  xml.openNode('library_geometries')

  xml.addComment(meshesCount + ' (meshesCount)')
  console.log('meshesCount', meshesCount)
  for (let mesh = 0; mesh < meshesCount; mesh++) {
    console.log('mesh number', mesh)

    const { value: geometryId } = parser.next()
    const { value: geometryName } = parser.next()
    xml
      .openNode('geometry')
      .setAttribute('id', geometryId)
      .setAttribute('name', geometryName)

    const { value: sourcesCount } = parser.next()
    xml.openNode('mesh').addComment(sourcesCount + ' (sourcesCount)')
    console.log('sourcesCount', sourcesCount)
    for (let sourceContent = 0; sourceContent < sourcesCount; sourceContent++) {
      const { value: sourceId } = parser.next()
      const { value: sourceName } = parser.next()
      xml
        .openNode('source')
        .setAttribute('id', sourceId)
        .setAttribute('name', sourceName)

      const { value: sourceRecordCount } = parser.next(UINT16)
      xml.addComment(sourceRecordCount + ' (sourceRecordCount)')
      console.log('sourceRecordCount', sourceRecordCount)
      assert.equal(sourceRecordCount, 1)

      const { value: accessorRecordMarker } = parser.next(UINT16)
      xml.addComment(accessorRecordMarker + ' (accessorRecordMarker)')
      console.log('accessorRecordMarker', accessorRecordMarker)
      assert.equal(accessorRecordMarker, 257)

      const { value: stride0 } = parser.next(UINT16)
      xml.addComment(stride0 + ' (stride)')
      console.log('stride0', stride0 + ' (stride)')
      assert(stride0 === 2 || stride0 === 3)

      const { value: accessorSource } = parser.next()
      console.log('accessorSource', accessorSource)

      const { value: accessorCount } = parser.next(UINT32)
      console.log('count', accessorCount)

      const { value: accessorStride } = parser.next(UINT32)
      console.log('stride', accessorStride)
      assert.equal(stride0, accessorStride)

      const params = []
      for (let i = 0; i < accessorStride; i++) {
        const { value: paramName } = parser.next()
        console.log('name', paramName)

        const { value: paramSidToken } = parser.next()
        xml.addComment(paramSidToken + ' (paramSid)')
        console.log('paramSid', paramSidToken)
        const paramSid = asOptionalAttribute(paramSidToken, 'paramSid')

        const { value: paramType } = parser.next()
        console.log('type', paramType)

        // In <accessor>/<param>, these optional fields are sid, semantic and
        // xs:string content. They are omitted in this dataset and encoded as 0.
        const { value: paramSemanticToken } = parser.next()
        xml.addComment(paramSemanticToken + ' (paramSemantic)')
        console.log('paramSemantic', paramSemanticToken)
        const paramSemantic = asOptionalAttribute(
          paramSemanticToken,
          'paramSemantic'
        )

        const { value: paramValueToken } = parser.next()
        xml.addComment(paramValueToken + ' (paramValue)')
        console.log('paramValue', paramValueToken)
        const paramValue = asOptionalContent(paramValueToken)

        params.push({
          name: paramName,
          type: paramType,
          sid: paramSid,
          semantic: paramSemantic,
          value: paramValue,
        })
      }

      const { value: floatArrayRecordMarker } = parser.next(UINT16)
      console.log('floatArrayRecordMarker', floatArrayRecordMarker)
      assert.equal(floatArrayRecordMarker, 256)

      const { value: floatCount } = parser.next(UINT32)
      const { value: floatArrayId } = parser.next()

      // The accessor metadata is read before the payload in binary order.
      // Collada expects float_array before technique_common in XML.
      assert.equal(floatCount, accessorCount * accessorStride)

      const floatValues = []
      for (let i = 0; i < floatCount; i++) {
        const { value: float } = parser.next(FLOAT)
        floatValues.push(float)
      }

      xml
        .openNode('float_array')
        .addComment(floatArrayRecordMarker + ' (floatArrayRecordMarker)')
        .setAttribute('count', floatCount)
        .setAttribute('id', floatArrayId)
        .setContent(floatValues.join(' '))
        .closeNode()

      xml.openNode('technique_common')

      xml
        .openNode('accessor')
        .setAttribute('source', accessorSource)
        .setAttribute('count', accessorCount)
        .setAttribute('stride', accessorStride)

      for (const param of params) {
        if (param.sid !== null) {
          xml.setAttribute('sid', param.sid)
        }

        if (param.semantic !== null) {
          xml.setAttribute('semantic', param.semantic)
        }

        xml
          .openNode('param')
          .setAttribute('name', param.name)
          .setAttribute('type', param.type)

        if (param.value !== null) {
          xml.setContent(param.value)
        }

        xml.closeNode()
      }

      xml.closeNode()
      xml.closeNode()
      xml.closeNode()
    }

    // This value is a primitive-set count (often 1, sometimes greater).
    const { value: primitiveSetCount } = parser.next(UINT16)
    xml.addComment(primitiveSetCount + ' (primitiveSetCount)')
    console.log('primitiveSetCount', primitiveSetCount)
    assert(primitiveSetCount >= 1)

    const primitiveSets = []
    for (
      let primitiveSet = 0;
      primitiveSet < primitiveSetCount;
      primitiveSet++
    ) {
      const { value: inputCount } = parser.next(UINT16)
      console.log('inputCount', inputCount)
      assert(inputCount >= 1)

      const { value: material } = parser.next()
      console.log('material', material)

      const { value: trianglesCount } = parser.next(UINT16)
      console.log('trianglesCount', trianglesCount)

      const { value: primitiveRecordPadding } = parser.next(UINT16)
      console.log('primitiveRecordPadding', primitiveRecordPadding)
      assert.equal(
        primitiveRecordPadding,
        0,
        'primitiveRecordPadding should be 0 (no Collada equivalent)'
      )

      const { value: indexCount } = parser.next(UINT32)
      console.log('indexCount', indexCount)
      assert.equal(indexCount, trianglesCount * inputCount * 3)

      const indices = []
      for (let i = 0; i < indexCount; i++) {
        const { value: index } = parser.next(UINT16)
        indices.push(index)
      }

      const inputs = []
      for (let i = 0; i < inputCount; i++) {
        console.log('input number', i)

        const { value: offset } = parser.next(UINT32)
        console.log('offset', offset)
        assert(offset >= 0)

        const { value: semantic } = parser.next()
        console.log('semantic', semantic)

        const { value: semanticId } = parser.next(UINT32)
        console.log('semanticId', semanticId)

        console.log(
          'semantic index',
          SEMANTICS.findIndex((s) => semantic.startsWith(s))
        )

        assert.equal(
          semanticId,
          // @todo Use === instead of startsWith when debug is off.
          SEMANTICS.findIndex((s) => semantic.startsWith(s))
        )

        const { value: source } = parser.next()
        console.log('source', source)

        const { value: inputSet } = parser.next(UINT16)
        console.log('inputSet', inputSet)

        const { value: inputPadding } = parser.next(UINT16)
        console.log('inputPadding', inputPadding)
        assert.equal(
          inputPadding,
          0,
          'inputPadding should be 0 (shared-input binary padding)'
        )

        inputs.push({
          offset,
          semantic,
          source,
          set: inputSet,
        })
      }

      primitiveSets.push({
        material,
        trianglesCount,
        indices,
        inputs,
      })
    }

    const { value: verticesSetCount } = parser.next(UINT16)
    xml.addComment(verticesSetCount + ' (verticesSetCount)')
    console.log('verticesSetCount', verticesSetCount)
    // All known files use exactly one vertices block per mesh.
    assert.equal(verticesSetCount, 1)

    for (let verticesSet = 0; verticesSet < verticesSetCount; verticesSet++) {
      const { value: verticesInputCount } = parser.next(UINT16)
      console.log('verticesInputCount', verticesInputCount)
      assert(verticesInputCount >= 1)

      const { value: verticesId } = parser.next()
      console.log('id', verticesId)
      xml.openNode('vertices').setAttribute('id', verticesId)

      for (let i = 0; i < verticesInputCount; i++) {
        console.log('input number', i)

        const { value: vertexInputOffset } = parser.next(UINT32)
        console.log('vertexInputOffset', vertexInputOffset)
        // <vertices>/<input> is unshared in Collada, so offset is implicit.
        assert.equal(
          vertexInputOffset,
          0,
          'vertices/input offset is implicit and must remain 0'
        )

        const { value: vertexSemantic } = parser.next()
        console.log('semantic', vertexSemantic)

        const { value: semanticId } = parser.next(UINT32)
        console.log('semanticId', semanticId)

        console.log(
          'semantic index',
          SEMANTICS.findIndex((s) => vertexSemantic.startsWith(s))
        )

        assert.equal(
          semanticId,
          // @todo Use === instead of startsWith when debug is off.
          SEMANTICS.findIndex((s) => vertexSemantic.startsWith(s))
        )

        const { value: vertexSource } = parser.next()
        console.log('source', vertexSource)

        const { value: vertexInputSet } = parser.next(UINT16)
        console.log('vertexInputSet', vertexInputSet)
        // Same binary layout as shared input records, but always zero here.
        assert.equal(
          vertexInputSet,
          0,
          'vertices/input set is not part of unshared Collada input'
        )

        const { value: vertexInputPadding } = parser.next(UINT16)
        console.log('vertexInputPadding', vertexInputPadding)
        assert.equal(
          vertexInputPadding,
          0,
          'vertices/input padding should be 0'
        )

        xml
          .openNode('input')
          .setAttribute('semantic', vertexSemantic)
          .setAttribute('source', vertexSource)
          .closeNode()
      }

      xml.closeNode()
    }

    for (const primitiveSet of primitiveSets) {
      xml
        .openNode('triangles')
        .setAttribute('material', primitiveSet.material)
        .setAttribute('count', primitiveSet.trianglesCount)

      for (const input of primitiveSet.inputs) {
        xml
          .openNode('input')
          .setAttribute('offset', input.offset)
          .setAttribute('semantic', input.semantic)
          .setAttribute('source', input.source)

        // Keep TEXCOORD set slots explicit to preserve UV channel binding.
        if (input.set !== 0 || input.semantic.startsWith('TEXCOORD')) {
          xml.setAttribute('set', input.set)
        }

        xml.closeNode()
      }

      xml.openNode('p').setContent(primitiveSet.indices.join(' ')).closeNode()

      xml.closeNode()
    }

    xml.closeNode()
    xml.closeNode()
  }

  // Making sure we've exhausted all the data.
  const { value: trailing } = parser.next(UINT16)
  console.log('trailing', trailing)
  assert.equal(trailing, undefined)

  xml.closeNode()
}

const parseVisualScenes = async (file, xml) => {
  const visualScenesFile = `${file}.dae.visual_scenes`
  const parser = await defaultParser(visualScenesFile, UINT16)
  const { value: visualScenesCount } = parser.next()

  if (visualScenesCount === 0) {
    return
  }

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

      const indices = []
      for (let i = 0; i < 16; i++) {
        const float = parser.next(FLOAT)
        indices.push(float.value)
      }
      xml.setContent(indices.join(' '))

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
  const sceneFile = `${file}.dae.scene`
  const parser = await defaultParser(sceneFile, UINT8)
  const { value: scenesCount } = parser.next()

  if (scenesCount === 0) {
    return
  }

  xml.openNode('scene')

  assert.equal(scenesCount, 1)
  for (let scene = 0; scene < scenesCount; scene++) {
    const { value: url } = parser.next()
    xml.openNode('instance_visual_scene').setAttribute('url', url).closeNode()
  }

  xml.closeNode()
}
