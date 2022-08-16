import * as constants from './constants'
import * as events from './constants/events'
import type { Body, TriggerVolume } from './types'

export { computeShape } from './lib/compute-shape'

type Callback = (data: any) => void

const tickCallbacks = new Set<Callback>()
const collisionCallbacks = new Set<Callback>()

const promises = new Map<number, any>()

const worker = new Worker(
  new URL(import.meta.env.AMMO_WORKER_PATH, import.meta.url),
  { type: 'module' }
)

worker.addEventListener('error', (event) => {
  console.error('physics worker error:', event)
})

worker.addEventListener('messageerror', (event) => {
  console.error('physics worker message error', event)
})

worker.addEventListener('message', ({ data }) => {
  if (data.byteLength > 0) {
    const transforms = new Float32Array(data)
    for (const callback of tickCallbacks) {
      callback(transforms)
    }
    return
  }

  switch (data.event) {
    case events.COLLISIONS:
      for (const callback of collisionCallbacks) {
        callback(data)
      }
      return
    case events.FPS:
      ammo.fps = data.fps
      return
    case events.RAYCAST:
      return promises.get(events.RAYCAST)(data.hit)
    case events.INIT:
      return promises.get(events.INIT)()
  }
})

export const on = (eventName: string, callback: Callback) => {
  if (eventName === 'tick') {
    tickCallbacks.add(callback)
  }
  if (eventName === 'collisions') {
    collisionCallbacks.add(callback)
  }
}

/**
 * Initializes ammo
 */
const init = async () => {
  worker.postMessage({ event: events.INIT })

  return new Promise((resolve) => promises.set(events.INIT, resolve))
}

const run = async () => {
  worker.postMessage({ event: events.RUN })
  ammo.running = true
}

const pause = async () => {
  worker.postMessage({ event: events.PAUSE })
  ammo.running = false
}

const setGravity = (x: number, y: number, z: number) => {
  worker.postMessage({ event: events.SET_GRAVITY, x, y, z })
}

const setFriction = (id: number, friction: number) => {
  worker.postMessage({ event: events.SET_FRICTION, id, friction })
}

const setMask = (id: number, mask: number) => {
  worker.postMessage({ event: events.SET_MASK, id, mask })
}

const setMass = (id: number, mass: number) => {
  worker.postMessage({ event: events.SET_MASS, id, mass })
}

const setPosition = (id: number, x: number, y: number, z: number) => {
  worker.postMessage({ event: events.SET_POSITION, id, x, y, z })
}

const setTransform = (id: number, x: number, y: number, z: number, qx: number, qy: number, qz: number, qw: number) => {
  worker.postMessage({ event: events.SET_TRANSFORM, id, x, y, z, qx, qy, qz, qw })
}

const setTransforms = (transforms: Float32Array) => {
  worker.postMessage({ event: events.SET_TRANSFORMS, transforms })
}

const createRigidBodies = (bodies: Body[]) => {
  worker.postMessage({ event: events.CREATE_RIGIDBODIES, bodies })
}

const createTriggers = (triggers: TriggerVolume[]) => {
  worker.postMessage({ event: events.CREATE_TRIGGERS, triggers })
}

const applyCentralImpulse = (id: number, x: number, y: number, z: number) => {
  worker.postMessage({ event: events.APPLY_CENTRAL_IMPULSE, id, x, y, z })
}

const applyCentralImpulses = (impulses: Float32Array) => {
  worker.postMessage({ event: events.APPLY_CENTRAL_IMPULSES, impulses })
}

const applyCentralForces = (forces: Float32Array) => {
  worker.postMessage({ event: events.APPLY_CENTRAL_FORCES, forces })
}

interface Hit {
  id: number
  x: number
  y: number
  z: number
  nx: number
  ny: number
  nz: number
}

/**
 * Raycast the world and return the first entity the ray hits. Fire a ray into the world from
 * start to end, if the ray hits an entity with a collision component, it returns a result.
 * 
 * @param x1 - The starting x position.
 * @param y1 - The starting y position.
 * @param z1 - The starting z position.
 * @param x2 - The ending x position.
 * @param y2 - The ending y position.
 * @param z2 - The ending z position.
 * @returns - A promise that resolves into a hit result.
 */
const raycast = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): Promise<Hit> => {
  worker.postMessage({ event: events.RAYCAST, x1, y1, z1, x2, y2, z2 })
  return new Promise((resolve) => promises.set(events.RAYCAST, resolve))
}

export const ammo = {
  fps: 0,
  ready: false,
  running: false,
  ...constants,
  on,
  init,
  run,
  pause,
  setGravity,
  setFriction,
  setMask,
  setMass,
  setPosition,
  setTransform,
  setTransforms,
  createRigidBodies,
  createTriggers,
  applyCentralImpulse,
  applyCentralImpulses,
  applyCentralForces,
  raycast,
}
