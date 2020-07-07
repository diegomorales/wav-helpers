import { dropzone } from 'modules/dropzone'
import { writeDataChunkHeader, writeFmtChunk, writeWavHeader } from 'utils/wav'

const config = {
  stereoTrack: '#st2m-st',
  convertBtn: '[data-convert]',
  downloads: '[data-downloads]',
  downloadItem: (url, filename) => `
<div class="helper-module__download">
    <audio src="${url}" controls controlsList="nodownload" title="${filename}"></audio>
    <a href="${url}" download="${filename}">Download <strong>${filename}</strong></a>
</div>
  `
}

const factory = (el) => {
  const instance = {}

  // Private vars
  const trackDropzone = dropzone(el.querySelector(config.stereoTrack))
  const convertBtn = el.querySelector(config.convertBtn)
  const downloadsContainer = el.querySelector(config.downloads)

  let stereoChannel

  // Private methods
  const audioValid = (stereo) => stereo.format.numberOfChannels === 2

  const onLoadTrack = (data) => {
    stereoChannel = data

    convertBtn.disabled = !audioValid(stereoChannel)
  }

  const onClick = () => {
    // Clear downloads
    downloadsContainer.innerHTML = ''
    const filename = stereoChannel.filename.match(/(.+)\..+$/)[1]

    const blockAlignStereo = stereoChannel.format.blockAlign
    const bitDepth = stereoChannel.format.bitDepth
    const fileLength = stereoChannel.samples * 1 * (bitDepth / 8) + 44 // mono, 44 bytes for file header
    const arrayBufferL = new ArrayBuffer(fileLength)
    const arrayBufferR = new ArrayBuffer(fileLength)
    const viewL = new DataView(arrayBufferL)
    const viewR = new DataView(arrayBufferR)
    const stereoView = new DataView(stereoChannel.arrayBuffer, stereoChannel.subchunks.data.offset)

    // Write file header
    writeWavHeader(viewL)
    writeWavHeader(viewR)

    // Write fmt chunk
    const fmtData = {
      bitDepth: stereoChannel.format.bitDepth,
      sampleRate: stereoChannel.format.sampleRate,
      numberOfChannels: 1
    }

    writeFmtChunk(viewL, fmtData)
    writeFmtChunk(viewR, fmtData)

    // Write data chunk
    writeDataChunkHeader(viewL, fmtData, stereoChannel.samples)
    writeDataChunkHeader(viewR, fmtData, stereoChannel.samples)

    // Write audio data
    let offset = 44 // fmt header + data chunk header
    let offset2 = 8 // data chunk header
    let i

    while (offset < fileLength) {
      for (i = 0; i < blockAlignStereo; i++) {
        // Left channel
        if (i < blockAlignStereo / 2) {
          viewL.setInt8(offset + i, stereoView.getInt8(offset2 + i))
        }

        // Right channel
        if (i >= blockAlignStereo / 2) {
          viewR.setInt8(offset + i - (blockAlignStereo / 2), stereoView.getInt8(offset2 + i))
        }
      }

      offset += blockAlignStereo / 2
      offset2 += blockAlignStereo
    }

    makeDownload(new window.Blob([arrayBufferL], { type: 'audio/wav' }), filename + '_L.wav')
    makeDownload(new window.Blob([arrayBufferR], { type: 'audio/wav' }), filename + '_R.wav')
  }

  const bind = () => {
    convertBtn.addEventListener('click', onClick)

    trackDropzone.on('loaded', onLoadTrack)
  }

  const makeDownload = (blob, filename = 'audio.wav') => {
    const newAudioFile = URL.createObjectURL(blob)
    const tmp = document.createElement('div')

    tmp.innerHTML = config.downloadItem(newAudioFile, filename)

    downloadsContainer.appendChild(tmp.firstElementChild)
    downloadsContainer.setAttribute('data-state', 'has-files')
    downloadsContainer.scrollIntoView()
  }

  // Public vars

  // Public methods

  // Initialisation
  bind()

  return instance
}

export {
  factory as stereo2mono
}
