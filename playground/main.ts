import './index.css'
import * as THREE from 'three'
import { ammo } from '../src/main'
import { animate } from './renderer'
import { mesh, bodies } from './boxes'
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

bodies.push({
  id: -1,
  name: 'floor',
  type: ammo.BODYTYPE_STATIC,
  shape: ammo.BODYSHAPE_BOX,
  mass: 0,
  restitution: 0.5,
  friction: 1,
  linearDamping: 0,
  angularDamping: 0,
  linkedId: -1,
  transform: new Float32Array([0, 0, 0, 0, 0, 0, 1]),
  halfExtends: {
    x: 100,
    y: 0.1,
    z: 100,
  },
  sprite: false,
})

await ammo.init()
await ammo.createRigidBodies(bodies)
await ammo.run()

animate()

const M = 20

document.addEventListener('click', () => {
  const ids = new Uint16Array(constants.NUM_MESHES)
  const impulses = new Float32Array(constants.NUM_MESHES * 3)
  for (let i = 0, j = 0; i < bodies.length; i += 1, j += 3) {
    ids[i] = bodies[i].id
    impulses[j + 0] = (Math.random() - 0.5) * M
    impulses[j + 1] = (Math.random() - 0.5) * M
    impulses[j + 2] = (Math.random() - 0.5) * M
  }

  ammo.applyCentralImpulses(ids, impulses)
})