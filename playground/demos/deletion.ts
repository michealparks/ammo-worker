import * as THREE from 'three'
import * as constants from '../constants'
import { ammo } from '../../src/main'
import { randomColor } from './lib/colors'
import * as physics from '../../src/adapters/three'
import * as utils from './lib/utils'
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

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const cycle = async () => {
  
  await ammo.pause()
  await physics.destroyAllRigidBodies()
  await sleep(1000)

  utils.createFloorRigidBody()
  utils.createFloorTrigger()

  physics.addInstancedMesh(mesh, {
    type: ammo.BODYTYPE_DYNAMIC,
    shape: ammo.BODYSHAPE_SPHERE,
    radius,
  })

  await ammo.run()

  setTimeout(cycle, 5000)
}

cycle()
