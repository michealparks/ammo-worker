import AmmoLib from './ammo'
import * as Comlink from 'comlink'
import * as constants from './constants'
import type { BodyShape, Flag, RigidBody, TriggerVolume } from './types'

let ammo: typeof Ammo
let vec1: Ammo.btVector3
let vec2: Ammo.btVector3
let vec3: Ammo.btVector3
let quat: Ammo.btQuaternion
let transform: Ammo.btTransform
let world: Ammo.btDiscreteDynamicsWorld

let now = 0
let dt = 0
let then = 0
let simSpeed = 1000 / 60

const bodies = new Map<number, Ammo.btRigidBody>()
const dynamicBodies = new Set<Ammo.btRigidBody>()

const init = async () => {
  ammo = await AmmoLib()
  vec1 = new ammo.btVector3()
  vec2 = new ammo.btVector3()
  vec3 = new ammo.btVector3()
  quat = new ammo.btQuaternion(0, 0, 0, 0)
  transform = new ammo.btTransform()

  const collisionConfiguration = new ammo.btDefaultCollisionConfiguration()
  const dispatcher = new ammo.btCollisionDispatcher(collisionConfiguration)
  const pairCache = new ammo.btDbvtBroadphase()
  const solver = new ammo.btSequentialImpulseConstraintSolver()

  world = new ammo.btDiscreteDynamicsWorld(
    dispatcher,
    pairCache,
    solver,
    collisionConfiguration
  )
}

const setSimulationSpeed = (speed: number) => {
  simSpeed = 1000 / speed
}

const setGravity = (x: number, y: number, z: number) => {
  world.setGravity(new ammo.btVector3(x, y, z))
}

const createShape = (shape: BodyShape, geometry: Float32Array) => {
  if (shape === constants.BODYSHAPE_BOX) {

    vec1.setValue(geometry[0], geometry[1], geometry[2])
    return new ammo.btBoxShape(vec1)

  } else if (shape === constants.BODYSHAPE_MESH) {

    const triMesh = new ammo.btTriangleMesh()
    for (let i = 0, l = geometry.length; i < l; i += 9) {
      vec1.setValue(geometry[i + 0], geometry[i + 1], geometry[i + 2])
      vec2.setValue(geometry[i + 3], geometry[i + 4], geometry[i + 5])
      vec3.setValue(geometry[i + 6], geometry[i + 7], geometry[i + 8])
      triMesh.addTriangle(vec1, vec2, vec3)
    }

    const useQuantizedAabbCompression = true
    return new ammo.btBvhTriangleMeshShape(triMesh, useQuantizedAabbCompression)

  } else if (shape === constants.BODYSHAPE_SPHERE) {

    return new ammo.btSphereShape(geometry[0])

  } else {

    throw new Error('Invalid shape.')

  }
}

const createBody = (data: RigidBody, inertia: boolean, flag?: Flag) => {
  const { transform: bodyTransform } = data

  let localInertia: Ammo.btVector3 | undefined

  const shape = createShape(data.shape, data.geometry)
  shape.setMargin(0.0)

  if (inertia) {
    localInertia = new ammo.btVector3(0, 0, 0)
    shape.calculateLocalInertia(data.mass, localInertia)
  }

  vec1.setValue(bodyTransform[0], bodyTransform[1], bodyTransform[2])
  quat.setValue(bodyTransform[3], bodyTransform[4], bodyTransform[5], bodyTransform[6])
  transform.setOrigin(vec1)
  transform.setRotation(quat)

  const motionState = new ammo.btDefaultMotionState(transform)
  const bodyInfo = new ammo.btRigidBodyConstructionInfo(data.mass, motionState, shape, localInertia)
  const rigidbody = new ammo.btRigidBody(bodyInfo)

  rigidbody.type = data.type
  rigidbody.trigger = false
  rigidbody.id = data.id
  rigidbody.name = data.name
  rigidbody.linkedId = data.linkedId

  rigidbody.setRestitution(data.restitution)
  rigidbody.setFriction(data.friction)
  rigidbody.setDamping(data.linearDamping, data.angularDamping)

  if (flag !== undefined) {
    rigidbody.setCollisionFlags(rigidbody.getCollisionFlags() | flag)
  }

  ammo.destroy(bodyInfo)
  
  if (localInertia !== undefined) {
    ammo.destroy(localInertia)
  }

  return rigidbody
}

const createRigidBodies = (objects: RigidBody[]) => {
  let flag: Flag | undefined
  let body: Ammo.btRigidBody
  let inertia = false

  for (const data of objects) {
    switch (data.type) {
    case constants.BODYTYPE_STATIC: 
      inertia = false
      flag = constants.BODYFLAG_STATIC_OBJECT
      body = createBody(data, inertia, flag),
      world.addRigidBody(body, constants.BODYGROUP_STATIC, constants.BODYMASK_NOT_STATIC)
      break
    case constants.BODYTYPE_DYNAMIC:
      inertia = data.sprite === false && data.mass !== 0
      flag = undefined
      body = createBody(data, inertia, flag)
      dynamicBodies.add(body)
      world.addRigidBody(body, constants.BODYGROUP_DYNAMIC, constants.BODYMASK_ALL)
      break
    case constants.BODYTYPE_KINEMATIC:
      inertia = false
      flag = constants.BODYFLAG_KINEMATIC_OBJECT
      body = createBody(data, inertia, flag)
      body.setActivationState(constants.BODYSTATE_DISABLE_DEACTIVATION)
      world.addRigidBody(body)
      break
    }

    bodies.set(data.id, body!)
  }
}

const createTriggerVolumes = (objects: TriggerVolume[]) => {
  const group = constants.BODYGROUP_STATIC
  const mask = constants.BODYMASK_NOT_STATIC

  for (const data of objects) {
    const shape = createShape(data.shape, data.geometry)
    shape.setMargin(0.0)

    const { transform: bodyTransform } = data
    vec1.setValue(bodyTransform[0], bodyTransform[1], bodyTransform[2])
    quat.setValue(bodyTransform[3], bodyTransform[4], bodyTransform[5], bodyTransform[6])
    transform.setOrigin(vec1)
    transform.setRotation(quat)

    const motionState = new ammo.btDefaultMotionState(transform)
    const bodyInfo = new ammo.btRigidBodyConstructionInfo(1, motionState, shape)
    const trigger = new ammo.btRigidBody(bodyInfo)

    trigger.type = constants.BODYTYPE_STATIC
    trigger.trigger = true
    trigger.id = object.id
    trigger.name = object.name
    trigger.enter = object.enter
    trigger.leave = object.leave
    trigger.entity = object.entity
    trigger.linkedId = object.linkedId

    trigger.setRestitution(0)
    trigger.setFriction(0)
    trigger.setDamping(0, 0)

    vec1.setValue(0, 0, 0)
    trigger.setLinearFactor(vec1)
    trigger.setAngularFactor(vec1)
    trigger.setCollisionFlags(trigger.getCollisionFlags() | constants.BODYFLAG_NORESPONSE_OBJECT)

    ammo.destroy(bodyInfo)
    
    bodies.set(data.id, trigger)
    world.addRigidBody(trigger, group, mask)
  }
}

let timerId = -1

const run = () => {
  tick()
}

const stop = () => {
  clearTimeout(timerId)
}

let transforms = new Float32Array(1000 * 7)

const tick = () => {
  now = performance.now()
  dt = (now - then) / 1000
  then = now

  world.stepSimulation(dt, constants.MAX_SUBSTEPS, constants.FIXED_TIMESTEP)

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

  postMessage(transforms)

  timerId = self.setTimeout(tick, simSpeed)
}

export const api = {
  init,
  run,
  stop,
  setGravity,
  setSimulationSpeed,
  createRigidBodies,
  createTriggerVolumes,
}

Comlink.expose(api)
