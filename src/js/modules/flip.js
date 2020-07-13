import { dropzone } from 'modules/dropzone'
import { writeDataChunkHeader, writeFmtChunk, writeWavHeader } from 'utils/wav'

const config = {
  stereoTrack: '#flip-drop',
  convertBtn: '[data-convert]'
}

const factory = (el) => {
  // Private vars
  const trackDropzone = dropzone(el.querySelector(config.stereoTrack))
  const convertBtn = el.querySelector(config.convertBtn)
  let stereoChannel

  // Private methods
  const audioValid = (stereo) => stereo.format.numberOfChannels === 2

  const onLoadTrack = (data) => {
    stereoChannel = data

    convertBtn.disabled = !audioValid(stereoChannel)
  }

  const onClick = () => {
    const filename = stereoChannel.filename.match(/(.+)\..+$/)[1]
    const blockAlignStereo = stereoChannel.format.blockAlign
    const fileLength = stereoChannel.samples * stereoChannel.format.numberOfChannels * (stereoChannel.format.bitDepth / 8) + 44 // stereo, 44 bytes for file header
    const arrayBuffer = new ArrayBuffer(fileLength)
    const flippedView = new DataView(arrayBuffer)
    const stereoView = new DataView(stereoChannel.arrayBuffer, stereoChannel.subchunks.data.offset)

    // Write file header
    writeWavHeader(flippedView)

    // Write fmt chunk
    writeFmtChunk(flippedView, stereoChannel.format)

    // Write data chunk
    writeDataChunkHeader(flippedView, stereoChannel.format, stereoChannel.samples)

    // Write audio data
    let offset = 44 // fmt header + data chunk header
    let offset2 = 8 // data chunk header
    let i

    while (offset < fileLength) {
      for (i = 0; i < blockAlignStereo; i++) {
        // Left channel
        if (i < blockAlignStereo / 2) {
          // To right
          flippedView.setInt8(offset + i + (blockAlignStereo / 2), stereoView.getInt8(offset2 + i))
        }

        // Right channel
        if (i >= blockAlignStereo / 2) {
          // To left
          flippedView.setInt8(offset + i - (blockAlignStereo / 2), stereoView.getInt8(offset2 + i))
        }
      }

      offset += blockAlignStereo
      offset2 += blockAlignStereo
    }

    makeDownload(new window.Blob([arrayBuffer], { type: 'audio/wav' }), filename + '_flipped.wav')
  }

  const makeDownload = (blob, filename = 'audio.wav') => {
    const newAudioFile = URL.createObjectURL(blob)
    let link = document.createElement('a')
    link.href = newAudioFile
    link.setAttribute('download', filename)
    link.style.display = 'none'

    link = el.appendChild(link)
    link.click()

    el.removeChild(link)
  }

  const bind = () => {
    convertBtn.addEventListener('click', onClick)

    trackDropzone.on('loaded', onLoadTrack)
  }

  bind()
}

export {
  factory as flip
}
