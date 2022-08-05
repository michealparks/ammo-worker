import './index.css'
import { scene, setAnimationLoop } from 'three-kit'
import * as debug from 'three-kit/debug'

import './renderer'
import App from './App.svelte'
import * as THREE from 'three'

import { ammo } from '../src/main'
import * as physics from '../src/adapters/three'
import * as constants from './constants'
import { Volume } from '../src/types'
import * as boxes from './demos/boxes'
import * as capsules from './demos/capsules'
import * as meshes from './demos/meshes'
import * as spheres from './demos/spheres'
import * as translation from './demos/translation'

const demos = {
  boxes,
  capsules,
  meshes,
  spheres,
  translation,
}

const main = async () => {
  await ammo.init()

  // Add floor
  const floorSize = 20
  const floorHeight = 0.3
  const geometry = new THREE.BoxBufferGeometry(floorSize, floorHeight, floorSize, 1, 1)
  const material = new THREE.MeshStandardMaterial({ color: 0xCCCCCC })
  const floor = new THREE.Mesh(geometry, material)
  floor.name = 'floor'
  floor.receiveShadow = true
  scene.add(floor)

  await physics.addMesh(floor, {
    type: ammo.BODYTYPE_STATIC,
    shape: ammo.BODYSHAPE_BOX,
    halfExtents: {
      x: floorSize / 2,
      y: floorHeight / 2,
      z: floorSize / 2,
    },
  })

  // Create demo
  const demo = await demos[window.localStorage.getItem('demo') || 'boxes'].init() ?? {}

  // Add event for random impulses
  document.addEventListener('keydown', (event) => {
    switch (event.key.toLowerCase()) {
    case 'i':
      const count = physics.id
      const M = 20
      const ids = new Uint16Array(constants.NUM_MESHES)
      const impulses = new Float32Array(constants.NUM_MESHES * 3)

      for (let i = 0, j = 0; i < count; i += 1, j += 3) {
        ids[i] = i
        impulses[j + 0] = (Math.random() - 0.5) * M
        impulses[j + 1] = (Math.random() - 0.5) * M
        impulses[j + 2] = (Math.random() - 0.5) * M
      }

      ammo.applyCentralImpulses(ids, impulses)
      break
    case 'p':
      if (ammo.running) {
        ammo.pause()
      } else {
        ammo.run()
      }
    }
  })

  ammo.on('tick', (data) => {
    const { triggerEnter } = data

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
  })

  await ammo.createTriggers([
    {
      id: -2,
      shape: ammo.BODYSHAPE_BOX,
      enter: 'all',
      leave: 'all',
      entity: 0,
      transform: new Float32Array([0, -50, 0, 0, 0, 0, 1]),
      halfExtents: {
        x: 100,
        y: 1,
        z: 100,
      } 
    }
  ])

  await ammo.run()

  setAnimationLoop(() => {
    debug.update()
    demo.update?.()
  })

  import('../src/debug')
}

main()

export default new App({
  target: document.querySelector('#app')
})
