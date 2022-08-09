import * as debug from 'three-kit/debug'
import * as constants from '../constants'

const parameters = {
  demo: localStorage.getItem('demo') ?? 'boxes',
  numMeshes: constants.NUM_MESHES,
}
const pane = debug.addPane('demos')

pane.addInput(parameters, 'demo', {
  options: {
    boxes: 'boxes',
    capsules: 'capsules',
    meshes: 'meshes',
    raycast: 'raycast',
    spheres: 'spheres',
    translation: 'translation',
  },
}).on('change', () => {
  window.localStorage.setItem('demo', parameters.demo)
  window.location.reload()
})

pane.addInput(parameters, 'numMeshes').on('change', () => {
  localStorage.setItem('ammo.numCubes', parameters.numMeshes)
  window.location.reload()
})