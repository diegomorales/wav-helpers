import { dropzone } from 'modules/dropzone'

const config = {
  leftChannel: '#m2st-left',
  rightChannel: '#m2st-right',
  convertBtn: '[data-convert]'
}

const factory = (el) => {
  const instance = {}

  // Private vars
  const leftDropzone = dropzone(el.querySelector(config.leftChannel))
  const rightDropzone = dropzone(el.querySelector(config.rightChannel))

  const convertBtn = el.querySelector(config.convertBtn)

  let leftChannel
  let rightChannel

  // Private methods
  const audioValid = (left, right) => {
    if (!(left && right)) {
      return false
    }

    return left.format.numberOfChannels === 1 &&
      right.format.numberOfChannels === 1 &&
      left.format.sampleRate === right.format.sampleRate &&
      left.format.bitDepth === right.format.bitDepth &&
      left.duration === right.duration
  }

  const onLoadLeft = (data) => {
    leftChannel = data

    convertBtn.disabled = !audioValid(leftChannel, rightChannel)
  }

  const onLoadRight = (data) => {
    rightChannel = data

    convertBtn.disabled = !audioValid(leftChannel, rightChannel)
  }

  const onClick = () => {
    const blockAlignMono = leftChannel.format.blockAlign
    const sampleRate = leftChannel.format.sampleRate
    const bitDepth = leftChannel.format.bitDepth
    const fileLength = leftChannel.samples * 2 * (bitDepth / 8) + 44 // stereo, 44 bytes for file header
    const arrayBuffer = new ArrayBuffer(fileLength)
    const view = new DataView(arrayBuffer)
    const leftView = new DataView(leftChannel.arrayBuffer, leftChannel.subchunks.data.offset)
    const rightView = new DataView(rightChannel.arrayBuffer, rightChannel.subchunks.data.offset)

    // Write file header
    view.setUint32(0, 0x52494646) // "RIFF"
    view.setUint32(4, fileLength - 8, true) // file length - 8
    view.setUint32(8, 0x57415645) // "WAVE"

    // Write fmt chunk
    view.setUint32(12, 0x666d7420) // "fmt "-chunk
    view.setUint32(16, 16, true) // length = 16 bytes
    view.setUint16(20, 1, true) // PCM
    view.setUint16(22, 2, true) // Number of channels
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2 * (bitDepth / 8), true) // ByteRate
    view.setUint16(32, 2 * (bitDepth / 8), true) // block-align
    view.setUint16(34, bitDepth, true)

    // Write data chunk
    view.setUint32(36, 0x64617461) // "data"-chunk
    view.setUint32(40, 2 * leftChannel.samples * (bitDepth / 8), true) // length

    // Write audio data

    let offset = 44 // fmt header + data chunk header
    let offset2 = 8 // data chunk header
    let i
    while (offset < fileLength) {
      for (i = 0; i < blockAlignMono; i++) {
        view.setInt8(offset + i, leftView.getInt8(offset2 + i))
      }

      for (i = blockAlignMono; i < 2 * blockAlignMono; i++) {
        view.setInt8(offset + i, rightView.getInt8(offset2 + i - blockAlignMono))
      }

      offset += 2 * (bitDepth / 8)
      offset2 += (bitDepth / 8)
    }

    makeDownload(new window.Blob([arrayBuffer], { type: 'audio/wav' }))
  }

  const bind = () => {
    convertBtn.addEventListener('click', onClick)

    leftDropzone.on('loaded', onLoadLeft)
    rightDropzone.on('loaded', onLoadRight)
  }

  const makeDownload = (blob) => {
    const newAudioFile = URL.createObjectURL(blob)
    let link = document.createElement('a')
    link.href = newAudioFile
    link.setAttribute('download', 'stereo.wav')
    link.style.display = 'none'

    link = el.appendChild(link)
    link.click()

    el.removeChild(link)
  }

  // Public vars

  // Public methods

  // Initialisation
  bind()

  return instance
}

export {
  factory as mono2Stereo
}
