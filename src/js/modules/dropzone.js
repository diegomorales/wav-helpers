// import { merge } from 'zorrojs';
import { getDuration, getSubchunks, isWav, parseFmtChunk } from 'utils/wav'

// const defaults = {}

// const config = {}

const factory = (el, options = {}) => {
  const instance = {}
  // const settings = merge({}, defaults, options)
  const fileInput = el.querySelector('input[type=file]')

  // Private vars

  // Private methods
  const onClick = () => {
    fileInput.click()
  }

  const onLoadFile = (e) => {
    const file = e.target.files[0]

    file.arrayBuffer()
      .then(result => {
        if (!isWav(result)) {
          throw new Error('File is not a WAVE file.')
        }

        const subchunks = getSubchunks(result)
        const fmtChunkView = new DataView(result, subchunks.find(c => c.id === 'fmt').offset)
        const waveFormat = parseFmtChunk(fmtChunkView)

        const fileObject = {
          filename: file.name,
          size: file.size,
          numberOfChannels: waveFormat.numberOfChannels,
          sampleRate: waveFormat.sampleRate,
          bitDepth: waveFormat.bitDepth,
          duration: subchunks.find(c => c.id === 'data').size / (waveFormat.sampleRate * waveFormat.numberOfChannels * (waveFormat.bitDepth / 8))
        }

        console.log(fileObject)
      })
  }

  const bind = () => {
    el.addEventListener('click', onClick)
    fileInput.addEventListener('change', onLoadFile)
  }

  // Public vars

  // Public methods

  // Initialisation
  bind()

  return instance
}

export {
  factory as dropzone
}
