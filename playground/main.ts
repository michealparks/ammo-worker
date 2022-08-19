/**
 * This is how debugging should be imported to allow tree-shaking
 */
if (import.meta.env.THREE_DEBUG === 'true') {
  await import('../src/debug')
}

import './index.css'
import { run, update, renderer } from 'three-kit'
import './lib/pane'
import { ammo } from '../src/main'
import * as physics from '../src/adapters/three'
import * as constants from './constants'
import * as utils from './demos/lib/utils'
import { floor, floorSize, floorHeight } from './demos/lib/floor'

const demos = import.meta.glob('./demos/*.ts')

import './renderer'

renderer.xr.addEventListener('sessionstart', () => {
  const camera = renderer.xr.getCamera()
  camera.position.set(0, 1.8, 1)
  camera.scale.setScalar(5)
})

const main = async () => {
  await ammo.init()

  utils.createFloorRigidBody()
  utils.createFloorTrigger()

  physics.addMesh(floor, {
    type: ammo.BODYTYPE_STATIC,
    shape: ammo.BODYSHAPE_BOX,
    halfExtents: {
      x: floorSize / 2,
      y: floorHeight / 2,
      z: floorSize / 2,
    },
  })

  // Create demo
  const savedDemo = window.localStorage.getItem('demo') || 'boxes'
  const demoModule = await demos[`./demos/${savedDemo}.ts`]()

  // Add event for random impulses
  document.addEventListener('keydown', (event) => {
    switch (event.key.toLowerCase()) {
    case 'i':
      const count = physics.id
      const magnitude = 20
      const impulses = new Float32Array(constants.NUM_MESHES * 4)

      for (let i = 0, j = 0; j < count; i += 4, j += 1) {
        impulses[i + 0] = j
        impulses[i + 1] = (Math.random() - 0.5) * magnitude
        impulses[i + 2] = (Math.random() - 0.5) * magnitude
        impulses[i + 3] = (Math.random() - 0.5) * magnitude
      }

      ammo.applyCentralImpulses(impulses)
      break
    case 'p':
      if (ammo.running) {
        ammo.pause()
      } else {
        ammo.run()
      }
    }
  })

  ammo.on('collisions', (data) => {
    const { triggerEnter } = data

    let resetIds: number[] = []
  
    if (triggerEnter.length > 0) {
      for (let i = 0; i < triggerEnter.length; i += 1) {
        const [, ids] = triggerEnter[i]
  
        for (let j = 0; j < ids.length; j += 1) {
          resetIds.push(ids[j])
        }
      }

      const transforms = new Float32Array(resetIds.length * 8) 
  
      for (let i = 0, j = 0, l = resetIds.length; j < l; j += 1, i += 8) {
        transforms[i + 0] = resetIds[j]
        transforms[i + 1] = 0
        transforms[i + 2] = Math.random() * 10 + 30
        transforms[i + 3] = 0
        transforms[i + 4] = Math.random() - 0.5
        transforms[i + 5] = Math.random() - 0.5
        transforms[i + 6] = Math.random() - 0.5
        transforms[i + 7] = 1
      }

      ammo.setTransforms(transforms)
    }
  })

  ammo.run()

  if (demoModule.update) {
    update(() => demoModule.update())
  }

  run()
}

main()
