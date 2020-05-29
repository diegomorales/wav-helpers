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

const parseFmtChunk = (chunkDataview) => ({
  format: chunkDataview.getUint16(8, true),
  numberOfChannels: chunkDataview.getUint16(10, true),
  sampleRate: chunkDataview.getUint32(12, true),
  byteRate: chunkDataview.getUint32(16, true),
  blockAlign: chunkDataview.getUint16(20, true),
  bitDepth: chunkDataview.getUint16(22, true)
})

const getWavInfo = (file) => new Promise((resolve, reject) => {
  file.arrayBuffer()
    .then(result => {
      if (!isWav(result)) {
        reject(new Error('File is not a WAVE file.'))
      }

      const subchunks = getSubchunks(result)
      const fmtChunkView = new DataView(result, subchunks.fmt.offset)
      const format = parseFmtChunk(fmtChunkView)

      resolve({
        objectUrl: window.URL.createObjectURL(file),
        arrayBuffer: result,
        filename: file.name,
        size: file.size,
        format,
        subchunks,
        samples: subchunks.data.size / format.numberOfChannels / (format.bitDepth / 8),
        duration: subchunks.data.size / (format.sampleRate * format.numberOfChannels * (format.bitDepth / 8))
      })
    })
})

const createFile = (abuffer, len) => {
  var numOfChan = abuffer.numberOfChannels
  var length = len * numOfChan * 2 + 44
  var buffer = new ArrayBuffer(length)
  var view = new DataView(buffer)
  var offset = 0
  var channels = []; var i; var sample
  var pos = 0

  // write WAVE header - total offset will be 44 bytes - see chart at http://soundfile.sapp.org/doc/WaveFormat/
  setUint32(0x46464952) // "RIFF"
  setUint32(length - 8) // file length - 8
  setUint32(0x45564157) // "WAVE"

  setUint32(0x20746d66) // "fmt " chunk
  setUint32(16) // length = 16
  setUint16(1) // PCM (uncompressed)
  setUint16(numOfChan)
  setUint32(abuffer.sampleRate)
  setUint32(abuffer.sampleRate * 2 * numOfChan) // avg. bytes/sec
  setUint16(numOfChan * 2) // block-align
  setUint16(16) // 16-bit (hardcoded in this demo)

  setUint32(0x61746164) // "data" - chunk
  setUint32(length - pos - 4) // chunk length

  // write interleaved data
  for (i = 0; i < abuffer.numberOfChannels; i++) { channels.push(abuffer.getChannelData(i)) }

  while (pos < length) {
    for (i = 0; i < numOfChan; i++) { // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][offset])) // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0 // scale to 16-bit signed int
      view.setInt16(pos, sample, true) // update data chunk
      pos += 2
    }
    offset++ // next source sample
  }

  // create Blob
  return new window.Blob([buffer], { type: 'audio/wav' })

  function setUint16 (data) {
    view.setUint16(pos, data, true)
    pos += 2
  }

  function setUint32 (data) {
    view.setUint32(pos, data, true)
    pos += 4
  }
}

export {
  isWav,
  getSubchunks,
  parseFmtChunk,
  getWavInfo,
  createFile
}
