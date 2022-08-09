import * as THREE from 'three'
import { controls } from 'three-kit'
import * as constants from '../constants'
import { ammo } from '../../src/main'
import { randomColor } from './lib/colors'
import * as physics from '../../src/adapters/three'
import { boxes, halfExtents } from './lib/boxes'
import { player } from './lib/player'
import { Vector3 } from '../../src/types'

const radiusTop = 0.2
const radiusBottom = 0.3
const height = 0.9
const gunMaterial = new THREE.MeshStandardMaterial({ color: 'red' })
const gunGeometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height)
const gun = new THREE.Mesh(gunGeometry, gunMaterial)
player.add(gun)
gun.position.set(0, 0, 1.5)
gun.rotateX(Math.PI / 2)

player.position.z = -10

const color = new THREE.Color()
const matrix = new THREE.Matrix4()
const floorSize = 15

for (let index = 0; index < constants.NUM_MESHES; index += 1) {
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

let raycasting = false

const raycast = async () => {
  raycasting = true

  const { x, y, z } = player.position

  const hit = await ammo.raycast(x, y, z, x, y, 10)

  if (hit[0] > -1) {
    addImpulses(hit[0])
  }

  setTimeout(() => { raycasting = false }, 100)
}

const addImpulses = (id: number) => {
  const impulse = new Float32Array(4) 
  impulse[0] = id
  impulse[1] = 0
  impulse[2] = 0
  impulse[3] = 50
  ammo.applyCentralImpulses(impulse)
}

const playerTransform = new Float32Array(8)
playerTransform[6] = 1

export const update = () => {
  player.position.x += controls.keyboard.x / 5
  player.position.z -= controls.keyboard.y / 5

  playerTransform[0] = playerId
  playerTransform[1] = player.position.x
  playerTransform[3] = player.position.z

  if (controls.keyboard.e > 0 && raycasting === false) {
    raycast()
  }

  if (controls.keyboard.x || controls.keyboard.y) {
    ammo.setTransforms(playerTransform)
  }
}
