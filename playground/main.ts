import './index.css'
import * as THREE from 'three'
import { ammo } from '../src/main'
import { animate } from './renderer'
import { mesh } from './boxes'
import * as constants from './constants'

const quaternion = new THREE.Quaternion()
const matrix = new THREE.Matrix4()

ammo.on('tick', (data: Float32Array) => {
  for (let i = 0, s = 0; i < constants.NUM_MESHES; i += 1, s += 7) {
    quaternion.set(data[s + 3], data[s + 4], data[s + 5], data[s + 6])
    matrix.makeRotationFromQuaternion(quaternion)
    matrix.setPosition(data[s + 0], data[s + 1], data[s + 2])
    mesh.setMatrixAt(i, matrix)
  }

  mesh.instanceMatrix.needsUpdate = true
})

await ammo.setSimulationSpeed(60)
await ammo.setGravity(0, -9.8, 0)

await ammo.createRigidBodies([
  {
    id: -1,
    name: 'floor',
    type: ammo.BODYTYPE_STATIC,
    shape: ammo.BODYSHAPE_BOX,
    mass: 0,
    restitution: 0,
    friction: 1,
    linearDamping: 0,
    angularDamping: 0,
    linkedId: -1,
    transform: new Float32Array([0, 0, 0, 0, 0, 0, 1]),
    geometry: new Float32Array([100, 0.1, 100]),
    sprite: false,
  }
])

await ammo.run()

animate()
