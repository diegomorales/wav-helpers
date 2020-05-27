import { round } from 'zorrojs'
import { getSubchunks, isWav, parseFmtChunk } from 'utils/wav'

// const defaults = {}

const config = {
  resultTpl: ({ url, filename, type, size, sampleRate, bitDepth, duration, channels }) => `
<p class="tx-small tx-center"><strong>${filename}</strong></p>
<p class="tx-small tx-center">${type}, ${size}, ${duration}</p>
<p class="tx-small tx-center">${sampleRate}, ${bitDepth}, ${channels}</p>

<audio controls src="${url}" controlsList="nodownload"></audio>
  `
}

const getSize = (bytes) => {
  let size = bytes / Math.pow(1024, 1)
  let val = ' KB'

  if (size > 1024) {
    size = bytes / Math.pow(1024, 2)
    val = ' MB'
  }

  if (size > 1024) {
    size = bytes / Math.pow(1024, 3)
    val = ' GB'
  }

  return round(size, 2) + val
}

const getDuration = (duration) => {
  const minutes = Math.floor(duration / 60)
  const seconds = (Math.floor(duration % 60))

  return [(minutes !== 0 ? minutes + 'm' : ''), (seconds !== 0 ? seconds + 's' : '')].join(' ')
}

const factory = (el, options = {}) => {
  const instance = {}
  // const settings = merge({}, defaults, options)
  const fileInput = el.querySelector('input[type=file]')
  const result = el.querySelector('[data-result]')
  let audioFileInfo = {}

  // Private vars

  // Private methods
  const showResult = () => {
    el.setAttribute('data-state', 'loaded')

    result.innerHTML = config.resultTpl({
      url: audioFileInfo.objectUrl,
      filename: audioFileInfo.filename,
      type: 'WAV' + (audioFileInfo.subchunks.findIndex(s => s.id === 'bext') > -1 ? ' (BWF)' : ''),
      size: getSize(audioFileInfo.size),
      duration: getDuration(audioFileInfo.duration),
      sampleRate: audioFileInfo.format.sampleRate + ' Hz',
      bitDepth: audioFileInfo.format.bitDepth + 'Bit',
      channels: audioFileInfo.format.numberOfChannels === 1 ? 'Mono' : (audioFileInfo.format.numberOfChannels === 2 ? 'Stereo' : audioFileInfo.format.numberOfChannels + 'channels')
    })
  }

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
        const format = parseFmtChunk(fmtChunkView)

        audioFileInfo = {
          objectUrl: window.URL.createObjectURL(file),
          arrayBuffer: result,
          filename: file.name,
          size: file.size,
          format,
          subchunks,
          duration: subchunks.find(c => c.id === 'data').size / (format.sampleRate * format.numberOfChannels * (format.bitDepth / 8))
        }

        showResult()
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
