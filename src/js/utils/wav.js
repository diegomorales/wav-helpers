const bytesFromUInt32 = (number) => {
  const bytesArray = []
  let arrayLength = 4

  do {
    bytesArray[--arrayLength] = number & 0xff
    number = number >> 8
  } while (arrayLength)

  return bytesArray
}

/**
 * Check if given buffer is a WAV file
 *
 * @param {ArrayBuffer} arrayBuffer
 * @returns {boolean}
 */
const isWav = (arrayBuffer) => {
  const view = new DataView(arrayBuffer)

  // Reference http://soundfile.sapp.org/doc/WaveFormat/
  const chunkId = String.fromCharCode(...bytesFromUInt32(view.getUint32(0)))
  const format = String.fromCharCode(...bytesFromUInt32(view.getUint32(8)))

  return chunkId === 'RIFF' && format === 'WAVE'
}

/**
 * Get all subchunks in a WAV file
 *
 * @param {ArrayBuffer} arrayBuffer
 * @returns {Object} Returns subchunks with ID, offset and size
 */
const getSubchunks = (arrayBuffer) => {
  const view = new DataView(arrayBuffer)
  const length = arrayBuffer.byteLength
  const subchunks = {}

  // Reference http://soundfile.sapp.org/doc/WaveFormat/

  // Subchunks start at offset 12
  let offset = 12
  let subchunkId
  let subchunkOffset
  let subchunkSize

  do {
    // Get subchunk ID
    subchunkId = String.fromCharCode(...bytesFromUInt32(view.getUint32(offset)))
    subchunkOffset = offset
    subchunkSize = view.getUint32(offset + 4, true)

    subchunks[subchunkId.trim()] = {
      size: subchunkSize,
      offset: subchunkOffset
    }

    // Set new offset
    offset += 8 + subchunkSize
  } while (offset < length)

  return subchunks
}

/**
 *
 * @param {DataView} chunkDataview
 * @returns {Object} Object containing data from fmt chunk
 */
const parseFmtChunk = (chunkDataview) => ({
  format: chunkDataview.getUint16(8, true),
  numberOfChannels: chunkDataview.getUint16(10, true),
  sampleRate: chunkDataview.getUint32(12, true),
  byteRate: chunkDataview.getUint32(16, true),
  blockAlign: chunkDataview.getUint16(20, true),
  bitDepth: chunkDataview.getUint16(22, true)
})

/**
 * Get an object with all infos about the wave file.
 *
 * @param {Blob} file
 * @returns {Promise}
 */
const getWavInfo = (file) => new Promise((resolve, reject) => {
  const readWav = (resultBuffer) => {
    if (!isWav(resultBuffer)) {
      reject(new Error('File is not a WAVE file.'))
    }

    const subchunks = getSubchunks(resultBuffer)
    const fmtChunkView = new DataView(resultBuffer, subchunks.fmt.offset)
    const format = parseFmtChunk(fmtChunkView)

    resolve({
      objectUrl: window.URL.createObjectURL(file),
      arrayBuffer: resultBuffer,
      filename: file.name,
      size: file.size,
      format,
      subchunks,
      samples: subchunks.data.size / format.numberOfChannels / (format.bitDepth / 8),
      duration: subchunks.data.size / (format.sampleRate * format.numberOfChannels * (format.bitDepth / 8))
    })
  }

  if (file.arrayBuffer) {
    file.arrayBuffer().then(readWav)
  } else {
    const reader = new window.FileReader()
    reader.addEventListener('loadend', (e) => {
      readWav(e.target.result)
    })
    reader.readAsArrayBuffer(file)
  }

})


export {
  isWav,
  getSubchunks,
  parseFmtChunk,
  getWavInfo
}
