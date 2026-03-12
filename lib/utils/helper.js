import { readFile } from 'node:fs/promises'

export const UINT8 = 'UINT8'
export const UINT16 = 'UINT16'
export const UINT32 = 'UINT32'
export const FLOAT = 'FLOAT'

export const defaultParser = async (file, readingMode) => {
  let buffer
  try {
    buffer = await readFile(file)
  } catch (e) {
    throw new Error(`Could not open ${file}.`)
  }

  const ensureReadable = (pointer, byteLength, context) => {
    if (pointer + byteLength > buffer.length) {
      throw new Error(
        `Unexpected end of file while reading ${context} in ${file} ` +
          `(offset ${pointer}, required ${byteLength}, size ${buffer.length}).`
      )
    }
  }

  return (function* defaultParser() {
    let val = null
    let length = 0
    let pointer = 0

    while (pointer < buffer.length) {
      switch (readingMode) {
        case undefined:
        default:
          // Default reading mode: ascii string.
          ensureReadable(pointer, 1, 'ascii')
          length = buffer.readUint8(pointer)
          if (length === 0) {
            val = `<null> (pointer: ${pointer})`
            pointer++
          } else if (length === 1) {
            ensureReadable(pointer, 2 + length, 'ascii')
            val = buffer.readUint16LE(pointer + 1)
            pointer += 2 + length
          } else {
            ensureReadable(pointer, 2 + length, 'ascii')
            val = buffer.subarray(pointer + 2, pointer + 1 + length)
            val = val.toString()
            pointer += 2 + length
          }
          readingMode = yield val
          break

        case UINT8:
          ensureReadable(pointer, 1, UINT8)
          val = buffer.readUint8(pointer)
          pointer += 1
          readingMode = yield val
          break

        case UINT16:
          ensureReadable(pointer, 2, UINT16)
          val = buffer.readUint16LE(pointer)
          pointer += 2
          readingMode = yield val
          break

        case UINT32:
          ensureReadable(pointer, 4, UINT32)
          val = buffer.readUint32LE(pointer)
          pointer += 4
          readingMode = yield val
          break

        case FLOAT:
          ensureReadable(pointer, 4, FLOAT)
          val = buffer.readFloatLE(pointer)
          pointer += 4
          readingMode = yield val
          break
      }
    }
  })()
}
