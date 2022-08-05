import * as Comlink from 'comlink'
import type { api as API } from './worker'
import * as constants from './constants'

export { computeShape } from './lib/compute-shape'

const events = new Map()

const worker = new Worker(
  new URL(import.meta.env.AMMO_WORKER_PATH, import.meta.url),
  { type: 'module' }
)

const api = Comlink.wrap<typeof API>(worker)

export const on = (eventName: string, callback: (data: any) => void) => {
  if (events.has(eventName) === false) {
    events.set(eventName, new Set())
  }

  events.get(eventName).add(callback)
}

const run = async () => {
  await api.run()
  ammo.running = true
}

const pause = async () => {
  await api.pause()
  ammo.running = false
}

worker.onmessage = ({ data }) => {
  if (data.id) {
    return
  }

  if (events.has('tick') === false) return

  for (const callback of events.get('tick')) {
    callback(data)
  }
}

export const ammo = {
  running: false,
  ...constants,
  on,
  init: api.init,
  run,
  pause,
  setSimulationSpeed: api.setSimulationSpeed,
  setGravity: api.setGravity,
  setFriction: api.setFriction,
  setTransform: api.setTransform,
  setTransforms: api.setTransforms,
  createRigidBodies: api.createRigidBodies,
  createTriggers: api.createTriggers,
  applyCentralImpulse: api.applyCentralImpulse,
  applyCentralImpulses: api.applyCentralImpulses,
  applyCentralForce: api.applyCentralForce,
  applyCentralForces: api.applyCentralForces,
  raycast: api.raycast,
}
