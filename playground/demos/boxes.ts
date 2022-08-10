import * as THREE from 'three'
import * as constants from '../constants'
import { ammo } from '../../src/main'
import { randomColor } from './lib/colors'
import * as physics from '../../src/adapters/three'
import { boxes, halfExtents } from './lib/boxes'

const color = new THREE.Color()
const matrix = new THREE.Matrix4()

for (let index = 0; index < constants.NUM_MESHES; index += 1) {
  color.set(randomColor())
  boxes.setColorAt(index, color)
  matrix.setPosition(Math.random() * 20 - 10, index, Math.random() * 20 - 10)
  boxes.setMatrixAt(index, matrix)
}

boxes.instanceColor!.needsUpdate = true

physics.addInstancedMesh(boxes, {
  shape: ammo.BODYSHAPE_BOX,
  type: ammo.BODYTYPE_DYNAMIC,
  halfExtents: {
    x: halfExtents,
    y: halfExtents,
    z: halfExtents,
  },
})
