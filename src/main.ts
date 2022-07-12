
import * as Comlink from 'comlink'
import AmmoWorker from './worker?worker'
import type { api as API } from './worker'
import * as constants from './constants'

const worker = new AmmoWorker()
const api = Comlink.wrap<typeof API>(worker)

const events = new Map()

worker.onmessage = ({ data }) => {
  if (data.id) {
    return
  }

  if (events.has('tick') === false) return

  for (const callback of events.get('tick')) {
    callback(data)
  }
}

const on = (eventName: string, callback: (data: any) => void) => {
  if (events.has(eventName) === false) {
    events.set(eventName, new Set())
  }

  events.get(eventName).add(callback)
}

export const ammo = {
  ...constants,
  on,
  init: api.init,
  setSimulationSpeed: api.setSimulationSpeed,
  setGravity: api.setGravity,
  createRigidBodies: api.createRigidBodies,
  applyCentralImpulses: api.applyCentralImpulses,
  run: api.run,
}
