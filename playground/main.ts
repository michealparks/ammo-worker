import './index.css'
import App from './App.svelte'
import * as THREE from 'three'
import { ammo } from '../src/main'
import { scene, animate } from './renderer'
import { mesh, bodies } from './boxes'
import * as constants from './constants'

const quaternion = new THREE.Quaternion()
const matrix = new THREE.Matrix4()

ammo.on('tick', (data) => {
  const { transforms, globalEvents } = data

  for (let i = 0, s = 0; i < constants.NUM_MESHES; i += 1, s += 7) {
    // console.log(transforms[s + 3], transforms[s + 4], transforms[s + 5], transforms[s + 6])
    quaternion.set(transforms[s + 3], transforms[s + 4], transforms[s + 5], transforms[s + 6])
    matrix.makeRotationFromQuaternion(quaternion)
    matrix.setPosition(transforms[s + 0], transforms[s + 1], transforms[s + 2])
    mesh.setMatrixAt(i, matrix)
  }

  mesh.instanceMatrix.needsUpdate = true
})

const floorSize = 20
const floorHeight = 0.3
{
  const geometry = new THREE.BoxBufferGeometry(floorSize, floorHeight, floorSize, 1, 1)
  const material = new THREE.MeshStandardMaterial({ color: 0xCCCCCC })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.updateMatrix()
  mesh.matrixAutoUpdate = false
  mesh.receiveShadow = true
  scene.add(mesh)
}

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
    x: floorSize / 2,
    y: floorHeight / 2,
    z: floorSize / 2,
  },
  sprite: false,
})

await ammo.init()
await ammo.createRigidBodies(bodies)
await ammo.run()

animate()

const M = 20

document.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() !== 'i') return

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

export default new App({
  target: document.querySelector('#app')
})
