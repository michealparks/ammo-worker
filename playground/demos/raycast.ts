import * as THREE from 'three'
import { scene, controls } from 'three-kit'
import * as constants from '../constants'
import { ammo } from '../../src/main'
import { randomColor } from '../lib/colors'
import * as physics from '../../src/adapters/three'

export const init = async () => {
  const size = 1
  const halfExtents = size / 2
  const geometry = new THREE.BoxGeometry(size, size, size)
  const material = new THREE.MeshStandardMaterial()

  const mesh = new THREE.InstancedMesh(geometry, material, constants.NUM_MESHES)
  mesh.name = 'mesh instances'
  mesh.castShadow = true
  mesh.receiveShadow = true
  scene.add(mesh)

  const color = new THREE.Color()
  const matrix = new THREE.Matrix4()
  const floorSize = 15

  for (let index = 0; index < constants.NUM_MESHES; index += 1) {
    color.set(randomColor())
    mesh.setColorAt(index, color)
    matrix.setPosition(
      (Math.random() * floorSize) - floorSize / 2,
      2,
      (Math.random() * floorSize) - floorSize / 2
    )
    
    mesh.setMatrixAt(index, matrix)
  }

  mesh.instanceColor!.needsUpdate = true

  await physics.addInstancedMesh(mesh, {
    type: ammo.BODYTYPE_DYNAMIC,
    shape: ammo.BODYSHAPE_BOX,
    halfExtents: {
      x: halfExtents,
      y: halfExtents,
      z: halfExtents,
    },
  })

  const playerGeo = new THREE.BoxGeometry(2, 2, 2)
  const playerMat = new THREE.MeshStandardMaterial({ color: 'lightblue' })
  const player = new THREE.Mesh(playerGeo, playerMat)
  player.name = 'player'
  scene.add(player)
  player.position.set(0, 1, 0)

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
  const update = () => {
    player.position.x += controls.keyboard.x / 5
    player.position.z -= controls.keyboard.y / 5

    playerTransform[0] = player.position.x
    playerTransform[2] = player.position.z

    if (controls.keyboard.x || controls.keyboard.y) {
      ammo.setTransform(playerId, playerTransform)
    }
  }

  return { update }
}







