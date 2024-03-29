import * as THREE from 'three'
import { controls } from 'three-kit'
import { ammo } from '../../src/main'
import * as physics from '../../src/adapters/three'
import { boxes, halfExtents } from './lib/boxes'
import { player } from './lib/player'
import { randomColor } from './lib/colors'
import { NUM_MESHES } from '../constants'

const color = new THREE.Color()
const matrix = new THREE.Matrix4()
const floorSize = 15

for (let index = 0; index < NUM_MESHES; index += 1) {
  color.set(randomColor())
  boxes.setColorAt(index, color)
  matrix.setPosition(
    (Math.random() * floorSize) - floorSize / 2,
    2,
    (Math.random() * floorSize) - floorSize / 2
  )
  
  boxes.setMatrixAt(index, matrix)
}

boxes.instanceColor!.needsUpdate = true

physics.addInstancedMesh(boxes, {
  type: ammo.BODYTYPE_DYNAMIC,
  shape: ammo.BODYSHAPE_BOX,
  halfExtents: {
    x: halfExtents,
    y: halfExtents,
    z: halfExtents,
  },
})

const playerId = physics.addMesh(player, {
  type: ammo.BODYTYPE_KINEMATIC,
  shape: ammo.BODYSHAPE_BOX,
  halfExtents: {
    x: 1,
    y: 1,
    z: 1,
  }
})

export const update = () => {
  player.position.x += controls.keyboard.x / 5
  player.position.z -= controls.keyboard.y / 5

  if (controls.keyboard.x || controls.keyboard.y) {
    ammo.setPosition(playerId, player.position.x, player.position.y, player.position.z)
  }
}
