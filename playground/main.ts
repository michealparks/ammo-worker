/**
 * This is how debugging should be imported to allow tree-shaking
 */
 if (import.meta.env.THREE_DEBUG === 'true') {
  await import('../src/debug')
}

import './index.css'
import { run, update } from 'three-kit'
import './lib/pane'
import { ammo } from '../src/main'
import * as physics from '../src/adapters/three'
import * as utils from './demos/lib/utils'
import { floor, floorSize, floorHeight } from './demos/lib/floor'
import { resetPositionOnCollisions } from './lib/collisions'
import { giveRandomImpulsesOnKeyDown } from './lib/impulses'
import './renderer'

const demos = import.meta.glob('./demos/*.ts')

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

  resetPositionOnCollisions()
  giveRandomImpulsesOnKeyDown()

  ammo.run()

  update(() => demoModule.update?.())

  run()
}

main()
