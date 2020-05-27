const bytesFromUInt32 = (number) => {
  const bytesArray = []
  let arrayLength = 4

  do {
    bytesArray[--arrayLength] = number & 0xff
    number = number >> 8
  } while (arrayLength)

  return bytesArray
}

const isWav = (audioBuffer) => {
  const view = new DataView(audioBuffer)

  // Reference http://soundfile.sapp.org/doc/WaveFormat/
  const chunkId = String.fromCharCode(...bytesFromUInt32(view.getUint32(0)))
  const format = String.fromCharCode(...bytesFromUInt32(view.getUint32(8)))

  return chunkId === 'RIFF' && format === 'WAVE'
}

const getSubchunks = (audioBuffer) => {
  const view = new DataView(audioBuffer)
  const length = audioBuffer.byteLength
  const subchunks = []

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

    subchunks.push({
      id: subchunkId.trim(),
      size: subchunkSize,
      offset: subchunkOffset
    })

    // Set new offset
    offset += 8 + subchunkSize
  } while (offset < length)

  return subchunks
}

const parseFmtChunk = (chunkDataview) => ({
  format: chunkDataview.getUint16(8, true),
  numberOfChannels: chunkDataview.getUint16(10, true),
  sampleRate: chunkDataview.getUint32(12, true),
  byteRate: chunkDataview.getUint32(16, true),
  blockAlign: chunkDataview.getUint16(20, true),
  bitDepth: chunkDataview.getUint16(22, true)
})

export {
  isWav,
  getSubchunks,
  parseFmtChunk
}
