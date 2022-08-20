import 'three-kit/debug'
import * as constants from './constants'
import * as events from './constants/events'
import type { Body, TriggerVolume } from './types'

export { computeShape } from './lib/compute-shape'

type Callback = (data: any) => void

let cid = 0

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
    case events.DESTROY_RIGIDBODIES:
    case events.DESTROY_ALL_RIGIDBODIES:
    case events.INIT:
    case events.RUN:
    case events.PAUSE:
      return execPromise(data)
  }
})

const createCid = () => {
  return cid++ % 1_000
}

const createPromise = <Type>(cid: number): Promise<Type> => {
  return new Promise((resolve) => promises.set(cid, resolve))
}

const execPromise = (data: any) => {
  promises.get(data.cid)(data)
  promises.delete(data.cid)
}

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
const init = () => {
  const cid = createCid()
  worker.postMessage({ event: events.INIT, cid })
  return createPromise<void>(cid)
}

const run = () => {
  const cid = createCid()
  worker.postMessage({ event: events.RUN, cid })
  ammo.running = true
  return createPromise<void>(cid)
}

const pause = async () => {
  const cid = createCid()
  worker.postMessage({ event: events.PAUSE, cid })
  ammo.running = false
  return createPromise<void>(cid)
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

const destroyRigidBodies = (ids: Uint16Array) => {
  const cid = createCid()
  worker.postMessage({ event: events.DESTROY_RIGIDBODIES, cid, ids })
  return createPromise<void>(cid)
}

const destroyAllRigidBodies = () => {
  const cid = createCid()
  worker.postMessage({ event: events.DESTROY_ALL_RIGIDBODIES, cid })
  return createPromise<void>(cid)
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

const enableBody = (id: number) => {
  worker.postMessage({ event: events.ENABLE_BODY, id })
}

const disableBody = (id: number) => {
  worker.postMessage({ event: events.DISABLE_BODY, id })
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
  const cid = createCid()
  worker.postMessage({ event: events.RAYCAST, cid, x1, y1, z1, x2, y2, z2 })
  return new Promise((resolve) => promises.set(cid, (data: any) => resolve(data.hit)))
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
  destroyRigidBodies,
  destroyAllRigidBodies,
  createTriggers,
  applyCentralImpulse,
  applyCentralImpulses,
  applyCentralForces,
  enableBody,
  disableBody,
  raycast,
}
