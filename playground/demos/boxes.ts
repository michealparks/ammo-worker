import * as THREE from 'three'
import { scene } from 'three-kit'
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
  mesh.castShadow = true
  mesh.receiveShadow = true
  scene.add(mesh)

  const color = new THREE.Color()
  const matrix = new THREE.Matrix4()

  for (let index = 0; index < constants.NUM_MESHES; index += 1) {
    color.set(randomColor())
    mesh.setColorAt(index, color)
    matrix.setPosition(Math.random(), 1 + index, Math.random())
    mesh.setMatrixAt(index, matrix)
  }

  mesh.instanceColor!.needsUpdate = true

  await physics.addInstancedMesh(mesh, {
    shape: ammo.BODYSHAPE_BOX,
    type: ammo.BODYTYPE_DYNAMIC,
    restitution: 0.5,
    friction: 0.5,
    linearDamping: 0.1,
    angularDamping: 0.1,
    linkedId: -1,
    halfExtents: {
      x: halfExtents,
      y: halfExtents,
      z: halfExtents,
    },
  })
}
