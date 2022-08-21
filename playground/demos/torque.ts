import * as THREE from 'three'
import * as constants from '../constants'
import { ammo } from '../../src/main'
import { randomColor } from './lib/colors'
import * as physics from '../../src/adapters/three'
import { meshes, indexes, vertices } from './lib/meshes'

ammo.setGravity(0, 0, 0)

const m4 = new THREE.Matrix4()
const matrix = new THREE.Matrix4()

m4.copy(meshes.matrixWorld).invert()

const color = new THREE.Color()

const results = physics.gatherGeometries(meshes)

const random = () => {
  return Math.random() * 16 - 8
}

for (let index = 0; index < constants.NUM_MESHES; index += 1) {
  color.set(randomColor())
  meshes.setColorAt(index, color)
  matrix.setPosition(random(), random() + 10, random())
  meshes.setMatrixAt(index, matrix)
}

meshes.instanceColor!.needsUpdate = true

const ids = physics.addInstancedMesh(meshes, {
  type: ammo.BODYTYPE_DYNAMIC,
  shape: ammo.BODYSHAPE_MESH,
  matrix: new Float32Array(m4.elements),
  activationState: ammo.BODYSTATE_DISABLE_DEACTIVATION,
  vertices,
  indexes,
})

// {
//   const impulses = new Float32Array(ids.length * 4)

//   const random = () => {
//     return Math.random() - 0.5
//   }

//   for (let i = 0, j = 0, l = ids.length; i < l; i += 1, j += 4) {
//     impulses[j + 0] = ids[i]
//     impulses[j + 1] = random()
//     impulses[j + 2] = random()
//     impulses[j + 3] = random()
//   }
  
//   ammo.applyTorqueImpulses(impulses)
// }

{
  const impulses = new Float32Array(ids.length * 7)

  const random = () => {
    return (Math.random() - 0.5) * 2
  }

  for (let i = 0, j = 0, l = ids.length; i < l; i += 1, j += 7) {
    impulses[j + 0] = ids[i]
    impulses[j + 1] = random()
    impulses[j + 2] = random()
    impulses[j + 3] = random()
    impulses[j + 4] = random()
    impulses[j + 5] = random()
    impulses[j + 6] = random()
  }

  ammo.applyCentralAndTorqueImpulses(impulses)
}
