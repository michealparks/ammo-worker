import * as THREE from 'three'
import { scene, controls } from 'three-kit'
import * as constants from '../constants'
import { id } from '../utils'
import { ammo } from '../../src/main'
import { Body } from '../../src/types'
import { randomColor } from '../lib/colors'

export const init = () => {
  const size = 1
  const halfExtents = size / 2
  const geometry = new THREE.BoxGeometry(size, size, size)
  const material = new THREE.MeshStandardMaterial()

  const bodies: Body[] = []

  const playerGeo = new THREE.BoxGeometry(2, 2, 2)
  const playerMat = new THREE.MeshStandardMaterial({ color: 'lightblue' })
  const player = new THREE.Mesh(playerGeo, playerMat)
  player.name = 'player'
  scene.add(player)
  player.position.set(0, 1, 0)

  const mesh = new THREE.InstancedMesh(geometry, material, constants.NUM_MESHES)
  mesh.name = 'mesh instances'
  mesh.castShadow = true
  mesh.receiveShadow = true
  scene.add(mesh)

  const color = new THREE.Color()

  for (let i = 0; i < constants.NUM_MESHES; i += 1) {
    const size = 15
    const transform = new Float32Array([
      (Math.random() * size) - size / 2,
      2,
      (Math.random() * size) - size / 2,
      0, 0, 0, 1
    ])
  
    bodies.push({
      id: id(),
      name: `box_${i}`,
      type: ammo.BODYTYPE_DYNAMIC,
      shape: ammo.BODYSHAPE_BOX,
      restitution: 0.5,
      friction: 0.5,
      linearDamping: 0.1,
      angularDamping: 0.1,
      linkedId: -1,
      transform,
      halfExtents: {
        x: halfExtents,
        y: halfExtents,
        z: halfExtents,
      },
      sprite: false,
    })

    bodies.push({
      id: player.id,
      name: player.name,
      type: ammo.BODYTYPE_KINEMATIC,
      shape: ammo.BODYSHAPE_BOX,
      transform: new Float32Array([0, 1, 0, 0, 0, 0, 1]),
      halfExtents: {
        x: 1,
        y: 1,
        z: 1,
      }
    })
  
    color.set(randomColor())
  
    mesh.setColorAt(i, color)
  }

  mesh.instanceColor!.needsUpdate = true

  const playerTransform = new Float32Array(7)
  playerTransform[6] = 1
  const update = () => {
    player.position.x += controls.keyboard.x / 5
    player.position.z -= controls.keyboard.y / 5

    playerTransform[0] = player.position.x
    playerTransform[2] = player.position.z

    if (controls.keyboard.x || controls.keyboard.y) {
      ammo.setTransform(player.id, playerTransform)
    }

  }

  return { bodies, mesh, update }
}







