import * as debug from 'three-kit/debug'

const parameters = {
  demo: localStorage.getItem('demo') ?? 'boxes'
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
