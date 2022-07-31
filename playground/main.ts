import './index.css'
import App from './App.svelte'
import * as THREE from 'three'
import { createAmmo } from '../src/main'
import { scene, animate } from './renderer'
import * as constants from './constants'
import { Volume } from '../src/types'
import * as boxes from './shapes/boxes'
import * as capsules from './shapes/capsules'
import * as meshes from './shapes/meshes'
import * as spheres from './shapes/spheres'

const shapes = {
  boxes,
  capsules,
  meshes,
  spheres,
}

const ammo = await createAmmo({
  // workerPath: '../dist/worker.js',
  workerPath: '../src/worker.ts',
  wasmPath: import.meta.env.DEV
    ? '/src/ammo.wasm.wasm'
    : '/ammo-worker/ammo.wasm.wasm'
})

const quaternion = new THREE.Quaternion()
const matrix = new THREE.Matrix4()

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

const triggerY = -50
const triggers: Volume[] = [
  {
    id: -2,
    name: 'volume',
    shape: ammo.BODYSHAPE_BOX,
    enter: 'all',
    leave: 'all',
    entity: '',
    transform: new Float32Array([0, triggerY, 0, 0, 0, 0, 1]),
    halfExtents: {
      x: 100,
      y: 1,
      z: 100,
    } 
  }
]

const M = 20

const main = async () => {
  const demo = window.localStorage.getItem('demo') || 'boxes'
  
  const { mesh, bodies } = shapes[demo].init()

  // Add floor
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
    halfExtents: {
      x: floorSize / 2,
      y: floorHeight / 2,
      z: floorSize / 2,
    },
    sprite: false,
  })

  // Add event for random impulses
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

  ammo.on('tick', (data) => {
    const { transforms, triggerEnter } = data
  
    for (let i = 0, s = 0; i < constants.NUM_MESHES; i += 1, s += 7) {
      quaternion.set(transforms[s + 3], transforms[s + 4], transforms[s + 5], transforms[s + 6])
      matrix.makeRotationFromQuaternion(quaternion)
      matrix.setPosition(transforms[s + 0], transforms[s + 1], transforms[s + 2])
      mesh.setMatrixAt(i, matrix)
    }
  
    let resetIds: number[] = []
  
    if (triggerEnter.length > 0) {
      for (let i = 0; i < triggerEnter.length; i += 1) {
        const [, ids] = triggerEnter[i]
  
        for (let j = 0; j < ids.length; j += 1) {
          resetIds.push(ids[j])
        }
      }
      
  
      let transforms = new Float32Array(resetIds.length * 7) 
  
      for (let i = 0; i < resetIds.length * 7; i += 7) {
        transforms[i + 0] = 0
        transforms[i + 1] = Math.random() * 10 + 30
        transforms[i + 2] = 0
        transforms[i + 3] = Math.random() - 0.5
        transforms[i + 4] = Math.random() - 0.5
        transforms[i + 5] = Math.random() - 0.5
        transforms[i + 6] = 1
      }
  
      ammo.setTransforms(new Uint16Array(resetIds), transforms)
    }
  
    mesh.instanceMatrix.needsUpdate = true
  })

  await ammo.createRigidBodies(bodies)
  await ammo.createTriggers(triggers)
  await ammo.run()

  animate()
}

main()

export default new App({
  target: document.querySelector('#app')
})
