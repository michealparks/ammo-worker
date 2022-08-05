import * as THREE from 'three'
import * as constants from '../constants'
import { ammo } from '../../src/main'
import { randomColor } from './lib/colors'
import * as physics from '../../src/adapters/three'
import { meshes, indexes, vertices } from './lib/meshes'

const m4 = new THREE.Matrix4()
const matrix = new THREE.Matrix4()

m4.copy(meshes.matrixWorld).invert()

const color = new THREE.Color()

const results = physics.gatherGeometries(meshes)

for (let index = 0; index < constants.NUM_MESHES; index += 1) {
  color.set(randomColor())
  meshes.setColorAt(index, color)
  matrix.setPosition(Math.random(), 1 + index, Math.random())
  meshes.setMatrixAt(index, matrix)
}

meshes.instanceColor!.needsUpdate = true

physics.addInstancedMesh(meshes, {
  type: ammo.BODYTYPE_DYNAMIC,
  shape: ammo.BODYSHAPE_MESH,
  matrix: new Float32Array(m4.elements),
  vertices,
  indexes,
})
