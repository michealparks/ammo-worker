import * as Comlink from 'comlink'
import type { api as API } from './worker'
import * as constants from './constants'

export { computeShape } from './lib/compute-shape'

type Callback = (data: any) => void

const tickCallbacks = new Set<Callback>()
const collisionCallbacks = new Set<Callback>()

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
  if (data.id) {
    return
  } else if (data.byteLength > 0) {
    const transforms = new Float32Array(data)
    for (const callback of tickCallbacks) {
      callback(transforms)
    }
    return
  } else if (data.event === 'collisions') {
    for (const callback of collisionCallbacks) {
      callback(data)
    }
  } else if (data.event === 'fps') {
    ammo.fps = data.fps
  }
})

const api = Comlink.wrap<typeof API>(worker)

export const on = (eventName: string, callback: Callback) => {
  if (eventName === 'tick') {
    tickCallbacks.add(callback)
  }
  if (eventName === 'collisions') {
    collisionCallbacks.add(callback)
  }
}

const run = async () => {
  await api.run()
  ammo.running = true
}

const pause = async () => {
  await api.pause()
  ammo.running = false
}

const raycastData = new Float32Array(6)
const raycast = (startX: number, startY: number, startZ: number, endX: number, endY: number, endZ: number) => {
  raycastData[0] = startX
  raycastData[1] = startY
  raycastData[2] = startZ
  raycastData[3] = endX
  raycastData[4] = endY
  raycastData[5] = endZ
  return api.raycast(raycastData)
}

export const ammo = {
  fps: 0,
  running: false,
  ...constants,
  on,
  init: api.init,
  run,
  pause,
  setGravity: api.setGravity,
  setFriction: api.setFriction,
  setTransforms: api.setTransforms,
  createRigidBodies: api.createRigidBodies,
  createTriggers: api.createTriggers,
  applyCentralImpulses: api.applyCentralImpulses,
  applyCentralForces: api.applyCentralForces,
  raycast,
}
