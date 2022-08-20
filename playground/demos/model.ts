import * as THREE from 'three'
import * as constants from '../constants'
import { ammo } from '../../src/main'
import * as physics from '../../src/adapters/three'
import { scene, assets } from 'three-kit'
import { NUM_MESHES } from '../constants'
import { BODYSHAPE_BOX } from '../../src/constants'
// import { orbitControls } from 'three-kit/debug'

// console.log(orbitControls)

await assets.load('xanax.glb')

console.log('hi')

const modelScene = assets.get<{ scene: THREE.Scene }>('xanax.glb').scene
const model = modelScene.children[0] as THREE.Mesh
console.log(model)

const meshes = new THREE.InstancedMesh(model.geometry, model.material, NUM_MESHES)
meshes.castShadow = true
meshes.receiveShadow = true
scene.add(meshes)

const vertices = new Float32Array(model.geometry.attributes.position.array)
const indexes = model.geometry.index ? new Float32Array(model.geometry.index.array) : undefined

const m4 = new THREE.Matrix4()
const matrix = new THREE.Matrix4()

m4.copy(meshes.matrixWorld).invert()

// const results = physics.gatherGeometries(meshes)

for (let index = 0; index < constants.NUM_MESHES; index += 1) {
  matrix.setPosition(Math.random(), 1 + index, Math.random())
  meshes.setMatrixAt(index, matrix)
}

const results = physics.computeShape(
  [vertices],
  [new Float32Array(m4.elements)],
  [indexes],
  { type: BODYSHAPE_BOX }
)
console.log(results)

physics.addInstancedMesh(meshes, {
  type: ammo.BODYTYPE_DYNAMIC,
  shape: ammo.BODYSHAPE_BOX,
  halfExtents: {
    x: results.x,
    y: results.y,
    z: results.z,
  },
})
