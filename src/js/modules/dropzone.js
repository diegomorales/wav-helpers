import { round } from 'zorrojs'
import { getWavInfo } from 'utils/wav'
import { observer } from 'utils/observer'

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

  Object.assign(instance, observer())

  // Private vars
  const fileInput = el.querySelector('input[type=file]')
  const result = el.querySelector('[data-result]')
  let audioFileInfo = {}
  let dragCounter = 0

  // Private methods
  const showResult = () => {
    el.setAttribute('data-state', 'loaded')

    result.innerHTML = config.resultTpl({
      url: audioFileInfo.objectUrl,
      filename: audioFileInfo.filename,
      type: 'WAV' + (audioFileInfo.subchunks.bext ? ' (BWF)' : ''),
      size: getSize(audioFileInfo.size),
      duration: getDuration(audioFileInfo.duration),
      sampleRate: audioFileInfo.format.sampleRate + 'Hz',
      bitDepth: audioFileInfo.format.bitDepth + 'Bit',
      channels: audioFileInfo.format.numberOfChannels === 1 ? 'Mono' : (audioFileInfo.format.numberOfChannels === 2 ? 'Stereo' : audioFileInfo.format.numberOfChannels + 'channels')
    })
  }

  const loadFile = (file) => {
    getWavInfo(file)
      .then(info => {
        audioFileInfo = info
        console.log(info)

        showResult()
        instance.trigger('loaded', audioFileInfo)
      })
  }

  const onClick = () => {
    fileInput.click()
  }

  const onLoadFile = (e) => {
    loadFile(e.target.files[0])
  }

  const onDrop = (e) => {
    e.stopPropagation()
    e.preventDefault()

    dragCounter = 0
    el.setAttribute('data-state', '')

    if (e.dataTransfer.files.length === 1 && e.dataTransfer.items[0].type === 'audio/wav') {
      loadFile(e.dataTransfer.files[0])
    }
  }

  const onDragOver = (e) => {
    e.stopPropagation()
    e.preventDefault()
  }

  const onDragEnter = (e) => {
    dragCounter++

    console.log(e.dataTransfer.items[0].type)

    if (e.dataTransfer.items[0].type !== 'audio/wav') {
      el.setAttribute('data-state', 'no-accept')
    } else {
      el.setAttribute('data-state', 'dragging')
    }
  }

  const onDragLeave = () => {
    dragCounter--

    if (dragCounter === 0) {
      el.setAttribute('data-state', '')
    }
  }

  const bind = () => {
    el.addEventListener('click', onClick)
    fileInput.addEventListener('change', onLoadFile)

    // Drag'n'drop
    el.addEventListener('drop', onDrop, false)
    el.addEventListener('dragover', onDragOver)
    el.addEventListener('dragenter', onDragEnter)
    el.addEventListener('dragleave', onDragLeave)
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
