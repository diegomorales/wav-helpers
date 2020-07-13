import { mono2Stereo } from 'modules/m2st'
import { stereo2mono } from 'modules/st2m'
import { flip } from 'modules/flip'

mono2Stereo(document.querySelector('[data-module="m2st"]'))
stereo2mono(document.querySelector('[data-module="st2m"'))
flip(document.querySelector('[data-module=flip]'))
