import * as THREE from 'three'
import { scene } from 'three-kit'
import * as constants from '../constants'
import { ammo } from '../../src/main'
import { randomColor } from '../lib/colors'
import * as physics from '../../src/adapters/three'

export const init = () => {
  const m4 = new THREE.Matrix4()
  const matrix = new THREE.Matrix4()

  const radius = 0.5
  const geometry = new THREE.IcosahedronGeometry(radius)
  const material = new THREE.MeshStandardMaterial()

  const mesh = new THREE.InstancedMesh(geometry, material, constants.NUM_MESHES)
  mesh.castShadow = true
  mesh.receiveShadow = true
  scene.add(mesh)

  m4.copy(mesh.matrixWorld).invert()

  const color = new THREE.Color()
  const vertices = new Float32Array(geometry.attributes.position.array)
  const indexes = mesh.geometry.index ? new Float32Array(mesh.geometry.index.array) : undefined

  const results = physics.gatherGeometries(mesh)

  for (let index = 0; index < constants.NUM_MESHES; index += 1) {
    color.set(randomColor())
    mesh.setColorAt(index, color)
    matrix.setPosition(Math.random(), 1 + index, Math.random())
    mesh.setMatrixAt(index, matrix)
  }

  mesh.instanceColor!.needsUpdate = true

  physics.addInstancedMesh(mesh, {
    type: ammo.BODYTYPE_DYNAMIC,
    shape: ammo.BODYSHAPE_MESH,
    matrix: new Float32Array(m4.elements),
    vertices,
    indexes,
  })
}
