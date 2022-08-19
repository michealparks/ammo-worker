import * as physics from '../../../src/adapters/three'
import { floor, floorSize, floorHeight } from './floor'
import { ammo } from '../../../src/main'

export const createFloorRigidBody = () => {
  return physics.addMesh(floor, {
    type: ammo.BODYTYPE_STATIC,
    shape: ammo.BODYSHAPE_BOX,
    halfExtents: {
      x: floorSize / 2,
      y: floorHeight / 2,
      z: floorSize / 2,
    },
  })
}

export const createFloorTrigger = () => {
  return ammo.createTriggers([
    {
      id: -2,
      shape: ammo.BODYSHAPE_BOX,
      transform: new Float32Array([0, -2050, 0, 0, 0, 0, 1]),
      halfExtents: {
        x: 2000,
        y: 2000,
        z: 2000,
      }
    }
  ])

}