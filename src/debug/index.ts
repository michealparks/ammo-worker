import * as THREE from 'three'
import { scene } from 'three-kit'
import * as debug from 'three-kit/debug'
import * as constants from '../constants'

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

const pane = debug.addPane('physics')
pane.addInput(parameters, 'draw').on('change', () => {

  console.log(parameters.draw)
})



