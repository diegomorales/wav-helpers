import { mono2Stereo } from 'modules/m2st'

if (!window.AudioContext) {
  throw new Error('Your browser has no support for the Web Audio API.')
}

mono2Stereo(document.querySelector('[data-module="m2st"]'))
