import * as THREE from 'three'
import { scene } from 'three-kit'
import * as constants from '../constants'
import { ammo } from '../../src/main'
import { randomColor } from '../lib/colors'
import * as physics from '../../src/adapters/three'

export const init = async () => {
  const radius = 0.5
  const material = new THREE.MeshStandardMaterial()
  const geometry = new THREE.SphereGeometry(radius, 6, 6)
  material.flatShading = true

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
    type: ammo.BODYTYPE_DYNAMIC,
    shape: ammo.BODYSHAPE_SPHERE,
    mass: 1,
    restitution: 0.5,
    friction: 0.5,
    linearDamping: 0.1,
    angularDamping: 0.1,
    linkedId: -1,
    radius,
  })
}
