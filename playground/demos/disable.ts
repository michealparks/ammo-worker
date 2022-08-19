import * as THREE from 'three'
import * as constants from '../constants'
import { ammo } from '../../src/main'
import { randomColor } from './lib/colors'
import * as physics from '../../src/adapters/three'
import { mesh, radius } from './lib/spheres'

const color = new THREE.Color()
const matrix = new THREE.Matrix4()

for (let index = 0; index < constants.NUM_MESHES; index += 1) {
  color.set(randomColor())
  mesh.setColorAt(index, color)
  matrix.setPosition(Math.random(), 1 + index, Math.random())
  mesh.setMatrixAt(index, matrix)
}

mesh.instanceColor!.needsUpdate = true

const ids = physics.addInstancedMesh(mesh, {
  type: ammo.BODYTYPE_DYNAMIC,
  shape: ammo.BODYSHAPE_SPHERE,
  radius,
})

let enabled = true
setInterval(() => {
  for (const id of ids) {
    if (enabled) {
      ammo.disableBody(id)
    } else {
      ammo.enableBody(id)
    }
  }

  enabled = !enabled
  
}, 2000)
