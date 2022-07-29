
import * as Comlink from 'comlink'
import type { api as API } from './worker'
import * as constants from './constants'

const events = new Map()

const on = (eventName: string, callback: (data: any) => void) => {
  if (events.has(eventName) === false) {
    events.set(eventName, new Set())
  }

  events.get(eventName).add(callback)
} 

export const ammo = {
  ...constants,
  on,
}

export const createAmmo = async (parameters: {
  workerPath: string
  wasmPath: string
}) => {
  const worker = new Worker(new URL(parameters.workerPath, import.meta.url), { type: 'module' })
  const api = Comlink.wrap<typeof API>(worker)
  
  worker.onmessage = ({ data }) => {
    if (data.id) {
      return
    }

    if (events.has('tick') === false) return

    for (const callback of events.get('tick')) {
      callback(data)
    }
  }

  await api.init(parameters)

  return {
    ...ammo,
    setSimulationSpeed: api.setSimulationSpeed,
    setGravity: api.setGravity,
    setTransforms: api.setTransforms,
    createRigidBodies: api.createRigidBodies,
    createTriggers: api.createTriggers,
    applyCentralImpulses: api.applyCentralImpulses,
    run: api.run,
  }
}
