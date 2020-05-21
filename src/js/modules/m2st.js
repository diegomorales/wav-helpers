import { merge } from 'zorrojs';

const defaults = {}

const config = {
  leftChannel: '[data-left]',
  rightChannel: '[data-right]',
  convertBtn: '[data-convert]'
}

const factory = (el, options = {}) => {
  const instance = {}
  const settings = merge({}, defaults, options)
  const leftChannel = el.querySelector(config.leftChannel)
  const rightChannel = el.querySelector(config.rightChannel)
  const convertBtn = el.querySelector(config.convertBtn);
  let duration = 0
  let leftBuffer
  let rightBuffer
  const audiocontext = new window.AudioContext()

  // Private vars

  // Private methods
  const setDuration = (d) => {
    duration = Math.max(duration, d)
  }

  const onLoadLeft = (e) => {
    let file = e.target.files[0];

    file.arrayBuffer()
      .then(result => audiocontext.decodeAudioData(result))
      .then(buffer => {
        leftBuffer = buffer
        setDuration(leftBuffer.duration)

        if (leftBuffer && rightBuffer) {
          convertBtn.disabled = false
        }
      })
  }

  const onLoadRight = (e) => {
    let file = e.target.files[0];

    file.arrayBuffer()
      .then(result => audiocontext.decodeAudioData(result))
      .then(buffer => {
        rightBuffer = buffer
        setDuration(rightBuffer.duration)

        if (leftBuffer && rightBuffer) {
          convertBtn.disabled = false
        }
      })
  }

  const onClick = () => {
    const offlineContext = new window.OfflineAudioContext(2, duration * 44100, 44100)

    let leftSource = offlineContext.createBufferSource()
    let rightSource = offlineContext.createBufferSource()
    let merger = offlineContext.createChannelMerger(2)
    leftSource.buffer = leftBuffer
    rightSource.buffer = rightBuffer

    // Connections
    leftSource.connect(merger, 0, 0)
    rightSource.connect(merger, 0, 1)
    // leftSource.connect(offlineContext.destination)
    // rightSource.connect(offlineContext.destination)
    merger.connect(offlineContext.destination)

    leftSource.start(0)
    rightSource.start(0)

    // Render
    offlineContext.startRendering()
      .then(buffer => {
        createDownload(buffer, offlineContext.length)
      })
  }

  const bind = () => {
    leftChannel.addEventListener('change', onLoadLeft)
    rightChannel.addEventListener('change', onLoadRight)

    convertBtn.addEventListener('click', onClick);
  }

  const createDownload = (audioBuffer, samples) => {
    let newAudioFile = URL.createObjectURL(bufferToWave(audioBuffer, samples));
    let link = document.createElement('a')
    link.href = newAudioFile
    link.setAttribute('download', 'stereo.wav')
    link.style.display = 'none'

    link = el.appendChild(link);
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

function bufferToWave(abuffer, len) {
  var numOfChan = abuffer.numberOfChannels,
    length = len * numOfChan * 2 + 44,
    buffer = new ArrayBuffer(length),
    view = new DataView(buffer),
    offset = 0,
    channels = [], i, sample,
    pos = 0;

  // write WAVE header - total offset will be 44 bytes - see chart at http://soundfile.sapp.org/doc/WaveFormat/
  setUint32(0x46464952);                         // "RIFF"
  setUint32(length - 8);                         // file length - 8
  setUint32(0x45564157);                         // "WAVE"

  setUint32(0x20746d66);                         // "fmt " chunk
  setUint32(16);                                 // length = 16
  setUint16(1);                                  // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2);                      // block-align
  setUint16(16);                                 // 16-bit (hardcoded in this demo)

  setUint32(0x61746164);                         // "data" - chunk
  setUint32(length - pos - 4);                   // chunk length

  // write interleaved data
  for(i = 0; i < abuffer.numberOfChannels; i++)
    channels.push(abuffer.getChannelData(i));

  while(pos < length) {
    for(i = 0; i < numOfChan; i++) {             // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
      view.setInt16(pos, sample, true);          // update data chunk
      pos += 2;
    }
    offset++                                     // next source sample
  }

  // create Blob
  return new Blob([buffer], {type: "audio/wav"});

  function setUint16(data) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}
