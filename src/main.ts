
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

  events.get('tick')?.(data)
}

const on = (eventName: string, callback: (data: Float32Array) => void) => {
  events.set(eventName, callback)
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
