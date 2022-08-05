import * as THREE from 'three'
import { scene } from 'three-kit'
import { ammo } from '../../src/main'
import { randomColor } from './lib/colors'
import { NUM_MESHES } from '../constants'
import * as constants from '../../src/constants'
import * as physics from '../../src/adapters/three'

const resolution = 8
const radius = 0.5
const length = radius * 2
const geometry = new THREE.CapsuleGeometry(radius, length, resolution, resolution * 2)
const material = new THREE.MeshStandardMaterial()
const mesh = new THREE.InstancedMesh(geometry, material, NUM_MESHES)
mesh.castShadow = true
mesh.receiveShadow = true
scene.add(mesh)

const color = new THREE.Color()
const matrix = new THREE.Matrix4()

for (let index = 0; index < NUM_MESHES; index += 1) {
  color.set(randomColor())
  mesh.setColorAt(index, color)
  matrix.setPosition(Math.random(), 1 + index, Math.random())
  mesh.setMatrixAt(index, matrix)
}

mesh.instanceColor!.needsUpdate = true

physics.addInstancedMesh(mesh, {
  type: ammo.BODYTYPE_DYNAMIC,
  shape: ammo.BODYSHAPE_CAPSULE,
  halfExtents: {
    x: length / 2,
    y: length / 2,
    z: length / 2,
  },
  cylinderAxis: constants.AXIS_Y,
})
