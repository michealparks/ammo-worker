import AmmoModule from './ammo'
import * as Comlink from 'comlink'
import * as constants from './constants'
import type { AmmoLib, Flag, Body, TriggerVolume } from './types'
import { createBody } from './lib/create-body'
import { createTrigger } from './lib/create-trigger'
import { checkForCollisions, cleanOldCollisions } from './lib/collisions'

let ammo: AmmoLib
let vec: Ammo.btVector3
let quat: Ammo.btQuaternion
let transform: Ammo.btTransform
let world: Ammo.btDiscreteDynamicsWorld

let rayOrigin: Ammo.btVector3
let rayDestination: Ammo.btVector3
let rayCallback: Ammo.ClosestRayResultCallback

let now = 0
let dt = 0
let then = 0
let simSpeed = 1000 / 60
let tickId = -1

const bodies = new Map<number, Ammo.btRigidBody>()
const dynamicBodies = new Set<Ammo.btRigidBody>()

const init = async () => {
  ammo = await AmmoModule({
    locateFile() {
      return import.meta.env.AMMO_WASM_PATH
    }
  })
  vec = new ammo.btVector3()
  quat = new ammo.btQuaternion(0, 0, 0, 1)
  transform = new ammo.btTransform()

  rayOrigin = new ammo.btVector3()
  rayDestination = new ammo.btVector3()
  rayCallback = new ammo.ClosestRayResultCallback(rayOrigin, rayDestination)

  const collisionConfiguration = new ammo.btDefaultCollisionConfiguration()
  const dispatcher = new ammo.btCollisionDispatcher(collisionConfiguration)
  const pairCache = new ammo.btDbvtBroadphase()
  const solver = new ammo.btSequentialImpulseConstraintSolver()

  world = new ammo.btDiscreteDynamicsWorld(
    dispatcher,
    // @ts-ignore WTF?
    pairCache,
    solver,
    collisionConfiguration
  )
  setGravity(0, Number.parseFloat(import.meta.env.AMMO_DEFAULT_GRAVITY), 0)
}

const setSimulationSpeed = (speed: number) => {
  simSpeed = 1000 / speed
}

const setGravity = (x: number, y: number, z: number) => {
  vec.setValue(x, y, z)
  world.setGravity(vec)
}

const setFriction = (id: number, friction: number) => {
  const body = bodies.get(id)!
  body.setFriction(friction)
  body.activate()
}

const setTransform = (id: number, bodyTransform: Float32Array, shift = 0) => {
  const body = bodies.get(id)!

  vec.setValue(0, 0, 0)
  body.setAngularVelocity(vec)
	body.setLinearVelocity(vec)

  vec.setValue(bodyTransform[shift + 0], bodyTransform[shift + 1], bodyTransform[shift + 2])
  quat.setValue(bodyTransform[shift + 3], bodyTransform[shift + 4], bodyTransform[shift + 5], bodyTransform[shift + 6])
  transform.setOrigin(vec)
  transform.setRotation(quat) 
  body.setWorldTransform(transform)

  if (body.type === constants.BODYTYPE_KINEMATIC) {
    body.getMotionState().setWorldTransform(transform)
  }

  body.activate()
}

const setTransforms = (ids: Uint16Array, transforms: Float32Array) => {
  for (let i = 0, shift = 0, l = ids.length; i < l; i += 1, shift += 7) {
    setTransform(ids[i], transforms, shift)
  }
}

const createRigidBodies = (objects: Body[]) => {
  let flag: Flag | undefined
  let body: Ammo.btRigidBody
  let inertia = false

  for (const data of objects) {
    switch (data.type) {
    case constants.BODYTYPE_STATIC: 
      inertia = false
      flag = constants.BODYFLAG_STATIC_OBJECT
      body = createBody(ammo, data, inertia, flag),
      world.addRigidBody(body, constants.BODYGROUP_STATIC, constants.BODYMASK_NOT_STATIC)
      break
    case constants.BODYTYPE_DYNAMIC:
      inertia = true //  data.sprite === false && data.mass !== 0
      flag = undefined
      body = createBody(ammo, data, inertia, flag)
      dynamicBodies.add(body)
      world.addRigidBody(body, constants.BODYGROUP_DYNAMIC, constants.BODYMASK_ALL)
      break
    case constants.BODYTYPE_KINEMATIC:
      inertia = false
      flag = constants.BODYFLAG_KINEMATIC_OBJECT
      body = createBody(ammo, data, inertia, flag)
      body.setActivationState(constants.BODYSTATE_DISABLE_DEACTIVATION)
      world.addRigidBody(body)
      break
    }

    bodies.set(data.id, body!)
  }
}

const createTriggers = (objects: TriggerVolume[]) => {
  for (const data of objects) {
    const trigger = createTrigger(ammo, data)
    bodies.set(data.id, trigger)
    world.addRigidBody(trigger, constants.BODYGROUP_STATIC, constants.BODYMASK_NOT_STATIC)
  }
}

const run = () => {
  now = then = performance.now()
  tickId = self.setInterval(tick, simSpeed)
}

const pause = () => {
  clearInterval(tickId)
}

const transforms = new Float32Array(Number.parseInt(import.meta.env.AMMO_MAX_BODIES, 10) * 7)
const maxSubsteps = Number.parseInt(import.meta.env.AMMO_MAX_SUBSTEPS, 10)
const fixedTimestep = Number.parseFloat(import.meta.env.AMMO_FIXED_TIMESTEP)

const tick = () => {
  now = performance.now()
  dt = (now - then) / 1000
  then = now

  world.stepSimulation(dt, maxSubsteps, fixedTimestep)

  let index = 0
  let shift = 0

  for (let body of dynamicBodies) {
    if (body.isActive() === false) {
      index += 1
      continue
    }

    const motionState = body.getMotionState()
    motionState.getWorldTransform(transform)
    
    const position = transform.getOrigin()
    const rotation = transform.getRotation()

    shift = 7 * index
    transforms[shift + 0] = position.x()
    transforms[shift + 1] = position.y()
    transforms[shift + 2] = position.z()
    transforms[shift + 3] = rotation.x()
    transforms[shift + 4] = rotation.y()
    transforms[shift + 5] = rotation.z()
    transforms[shift + 6] = rotation.w()

    index += 1
  }

  // const globalEvents: any[] = []
  checkForCollisions(ammo, world, /* globalEvents */)
  const data = cleanOldCollisions(/*globalEvents */)

  postMessage({
    ...data,
    fps: 1000 / (dt * 1000),
    transforms,
    // globalEvents
  })
}

const applyCentralImpulse = (id: number, x: number, y: number, z: number) => {
  const body = bodies.get(id)!
  vec.setValue(x, y, z)
  body.applyCentralImpulse(vec)
  body.activate()
}

const applyCentralImpulses = (ids: Uint16Array, impulses: Float32Array) => {
  for (let i = 0, shift = 0, l = ids.length; i < l; i += 1, shift += 3) {
    applyCentralImpulse(ids[i], impulses[shift + 0], impulses[shift + 1], impulses[shift + 2])
  }
}

const applyCentralForce = (id: number, x: number, y: number, z: number) => {
  const body = bodies.get(id)!
  vec.setValue(x, y, z)
  body.applyCentralForce(vec)
  body.activate()
}

const applyCentralForces = (ids: Uint16Array, impulses: Float32Array) => {
  for (let i = 0, shift = 0, l = ids.length; i < l; i += 1, shift += 3) {
    applyCentralForce(ids[i], impulses[shift + 0], impulses[shift + 1], impulses[shift + 2])
  }
}

const raycast = (data: Float32Array) => {
  // @TODO remove ignores
  // @ts-ignore
  const ray = ammo.castObject(rayCallback, ammo.RayResultCallback)
  // @ts-ignore
  ray.set_m_closestHitFraction(1)
  // @ts-ignore
  ray.set_m_collisionObject(null)

  rayOrigin.setValue(data[0], data[1], data[2])
  rayDestination.setValue(data[3], data[4], data[5])
  // @ts-ignore
  rayCallback.get_m_rayFromWorld().setValue(data[0], data[1], data[2])
  // @ts-ignore
  rayCallback.get_m_rayToWorld().setValue(data[3], data[4], data[5])

  world.rayTest(rayOrigin, rayDestination, rayCallback)

  const hits = []
  if (rayCallback.hasHit()) {
    const object = rayCallback.m_collisionObject
    const body = ammo.castObject(object, ammo.btRigidBody)
    const point = rayCallback.m_hitPointWorld // .get_m_hitPointWorld()

    hits.push({
      id: body.id,
      // name: ud0.name,
      position: [point.x(), point.y(), point.z()]
    })
  }

  return hits
}

export const api = {
  init,
  run,
  pause,
  setSimulationSpeed,
  setGravity,
  setFriction,
  setTransform,
  setTransforms,
  createRigidBodies,
  createTriggers,
  applyCentralImpulse,
  applyCentralImpulses,
  applyCentralForce,
  applyCentralForces,
  raycast,
}

Comlink.expose(api)
