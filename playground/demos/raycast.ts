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

const playerTransform = new Float32Array(7)
playerTransform[6] = 1

let raycasting = false

const raycast = async () => {
  raycasting = true

  const hits = await ammo.raycast(
    { x: player.position.x, y: player.position.y, z: player.position.z },
    { x: player.position.x, y: player.position.y, z: 10 }
  )

  if (hits.length > 0) {
    addImpulses(hits)
  }

  console.log(hits)
  setTimeout(() => { raycasting = false }, 100)
}

const addImpulses = (hits: { id: number, position: Vector3 }[]) => {
  const ids = new Uint16Array(hits.length)
  const transforms = new Float32Array(hits.length * 7) 

  for (let i = 0; i < hits.length; i += 1) {
    ids[i] = hits[i].id
  }
  
  for (let i = 0; i < hits.length * 7; i += 7) {
    transforms[i + 0] = 0
    transforms[i + 1] = 0
    transforms[i + 2] = Math.random() * 50
    transforms[i + 3] = Math.random() - 0.5
    transforms[i + 4] = Math.random() - 0.5
    transforms[i + 5] = Math.random() - 0.5
    transforms[i + 6] = 1
  }

  ammo.applyCentralImpulses(ids, transforms)
}

export const update = () => {
  player.position.x += controls.keyboard.x / 5
  player.position.z -= controls.keyboard.y / 5

  playerTransform[0] = player.position.x
  playerTransform[2] = player.position.z

  if (controls.keyboard.e > 0 && raycasting === false) {
    raycast()
  }

  if (controls.keyboard.x || controls.keyboard.y) {
    ammo.setTransform(playerId, playerTransform)
  }
}
