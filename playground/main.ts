import './index.css'
import { run, update } from 'three-kit'
import * as debug from 'three-kit/debug'
import './renderer'
import './lib/pane'
import { ammo } from '../src/main'
import * as physics from '../src/adapters/three'
import * as constants from './constants'
import { floor, floorSize, floorHeight } from './demos/lib/floor'

const demos = import.meta.glob('./demos/*.ts')

const main = async () => {
  await ammo.init()

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
      const ids = new Uint16Array(constants.NUM_MESHES)
      const impulses = new Float32Array(constants.NUM_MESHES * 3)

      for (let i = 0, j = 0; i < count; i += 1, j += 3) {
        ids[i] = i
        impulses[j + 0] = (Math.random() - 0.5) * magnitude
        impulses[j + 1] = (Math.random() - 0.5) * magnitude
        impulses[j + 2] = (Math.random() - 0.5) * magnitude
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

  ammo.createTriggers([
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

  ammo.run()

  update(() => {
    debug.update()
    demoModule.update?.()
  })

  run()

  import('../src/debug')
}

main()
