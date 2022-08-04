import * as THREE from 'three'
import { scene } from 'three-kit'
import * as debug from 'three-kit/debug'
import * as constants from '../constants'
import { ammo } from '../main'

const material = new THREE.LineBasicMaterial({ color: 0x0000ff })
const geometry = new THREE.BufferGeometry()
const line = new THREE.LineSegments(geometry, material)
line.frustumCulled = false

const parameters = {
  draw: false
}

const add = scene.add.bind(scene)
scene.add = (...args) => {
  add(...args)
  console.log(args)
  return scene
}

console.log(debug)

const pane = debug.addPane('physics')
pane.addInput(parameters, 'draw').on('change', () => {

  console.log(parameters.draw)
})

const statsParams = {
  physics: 0
}

debug.stats.addMonitor(statsParams, 'physics', {
  view: 'graph',
  min: 0,
  max: 60,
});

ammo.on('tick', ({ fps }) => {
  statsParams.physics = fps
})
