import * as THREE from 'three'
import { scene } from 'three-kit'
import * as debug from 'three-kit/debug'
import * as constants from '../constants'
import { ammo } from '../main'

const material = new THREE.LineBasicMaterial({ color: 0x0000ff })
const geometry = new THREE.BufferGeometry()
const line = new THREE.LineSegments(geometry, material)
line.frustumCulled = false

const add = scene.add.bind(scene)
scene.add = (...args) => {
  add(...args)
  // @TODO
  return scene
}

const pane = debug.addPane('physics')
const parameters = {
  draw: false,
  collisionStart: '',
}

pane.addInput(parameters, 'draw').on('change', () => {

})

const collisionFolder = debug.addFolder(pane, 'collisions')

collisionFolder.addMonitor(parameters, 'collisionStart', {
  label: 'start',
  bufferSize: 30,
  lineCount: 10,
  interval: 30,
})

const statsParams = {
  physics: 0
}

debug.stats.addMonitor(statsParams, 'physics', {
  view: 'graph',
  min: 0,
  max: 60,
});

ammo.on('tick', (data) => {
  statsParams.physics = data.fps

  if (data.collisionStart.length === 0) {
    return
  }

  let output = ''
  for (const [id, others] of data.collisionStart) {
    if (output !== '') output = `${output} | `
    output = `${output}${id}: [${others.join(',')}]`
  }

  if (output.trim() !== '') {
    parameters.collisionStart = output
  }
})