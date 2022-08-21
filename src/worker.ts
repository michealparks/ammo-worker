import AmmoModule from './ammo'
import * as constants from './constants'
import * as events from './constants/events'
import type { AmmoLib, Flag, Body, TriggerVolume } from './types'
import { createBody } from './lib/create-body'
import { createTrigger } from './lib/create-trigger'
import { checkForCollisions } from './lib/collisions'

let ammo: AmmoLib
let vec: Ammo.btVector3
let vec2: Ammo.btVector3
let quat: Ammo.btQuaternion
let transform: Ammo.btTransform
let world: Ammo.btDiscreteDynamicsWorld

let now = 0
let dt = 0
let then = 0
let tickId = -1
let fps = 0

const bodies = new Map<number, Ammo.btRigidBody>()
const dynamicBodies = new Set<Ammo.btRigidBody>()

const init = async (cid: number) => {
  ammo = await AmmoModule({
    locateFile() {
      return import.meta.env.AMMO_WASM_PATH
    }
  })
  vec = new ammo.btVector3()
  vec2 = new ammo.btVector3()
  quat = new ammo.btQuaternion(0, 0, 0, 1)
  transform = new ammo.btTransform()

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
  const checkForCollisionsPointer = ammo.addFunction(checkForCollisions.bind(null, ammo), 'vif')
  world.setInternalTickCallback(checkForCollisionsPointer)

  setGravity(0, Number.parseFloat(import.meta.env.AMMO_DEFAULT_GRAVITY), 0)

  if (import.meta.env.AMMO_DEBUG === 'true') {
    const module = await import('./debug/draw')
    // const drawer = new module.AmmoDebugDrawer(ammo, world)
    // drawer.enable()

    // setInterval(() => {
    //   let mode = (drawer.getDebugMode() + 1) % 3
    //   drawer.setDebugMode(mode)
    // }, 1000)
  }

  postMessage({ event: events.INIT, cid })
}

/**
 * Set the gravity for the physics world.
 * 
 * @param x - The x component
 * @param y - The y component
 * @param z - The z component
 */
const setGravity = (x: number, y: number, z: number) => {
  vec.setValue(x, y, z)
  world.setGravity(vec)
}

/**
 * Set the friction for a body.
 * 
 * @param id - The id of the body
 * @param friction - The friction for the body
 */
const setFriction = (id: number, friction: number) => {
  const body = bodies.get(id)!
  body.activate()
  body.setFriction(friction)
}

/**
 * Setting the collision mask sets which groups this body collides with. It is a bitfield of 16 bits,
 * the first 8 bits are reserved for engine use.
 *
 * @param id - The id of the body
 * @param mask - The collision mask
 */
const setMask = (id: number, mask: number) => {
  const body = bodies.get(id)!
  body.mask = mask

  // re-enabling simulation adds rigidbody back into world with new masks
  world.removeRigidBody(body)
  world.addRigidBody(body, body.group, mask)
}

/**
 * Set the mass of the body. This is only relevant for {@link constants.BODYTYPE_DYNAMIC} bodies, other types
 * have infinite mass.
 *
 * @param id - The id of the body
 * @param mass - The new mass
 */
const setMass = (id: number, mass: number) => {
  const body = bodies.get(id)!

  world.removeRigidBody(body)
  body.getCollisionShape().calculateLocalInertia(mass, vec)
  body.setMassProps(mass, vec)
  body.updateInertiaTensor()
  world.addRigidBody(body, body.group, body.mask)
}

/**
 * Sets the position component of a body's transform.
 * 
 * @param id The body id
 * @param x The x component
 * @param y The y component
 * @param z The z component
 */
const setPosition = (id: number, x: number, y: number, z: number) => {
  const body = bodies.get(id)!
  body.activate()

  vec.setValue(0, 0, 0)
  body.setAngularVelocity(vec)
	body.setLinearVelocity(vec)

  vec.setValue(x, y, z)
  const transform = body.getWorldTransform()
  transform.setOrigin(vec)
  body.setWorldTransform(transform)

  if (body.type === constants.BODYTYPE_KINEMATIC) {
    body.getMotionState().setWorldTransform(transform)
  }
}

const setRotation = (id: number, x: number, y: number, z: number, w: number) => {
  const body = bodies.get(id)!
  body.activate()

  vec.setValue(0, 0, 0)
  body.setAngularVelocity(vec)
	body.setLinearVelocity(vec)

  quat.setValue(x, y, z, w)
  const transform = body.getWorldTransform()
  transform.setRotation(quat)
  body.setWorldTransform(transform)

  if (body.type === constants.BODYTYPE_KINEMATIC) {
    body.getMotionState().setWorldTransform(transform)
  }
}

const setTransform = (id: number, x: number, y: number, z: number, qx: number, qy: number, qz: number, qw: number) => {
  const body = bodies.get(id)!
  body.activate()

  vec.setValue(0, 0, 0)
  body.setAngularVelocity(vec)
	body.setLinearVelocity(vec)

  vec.setValue(x, y, z)
  quat.setValue(qx, qy, qz, qw)
  transform.setOrigin(vec)
  transform.setRotation(quat) 
  body.setWorldTransform(transform)

  if (body.type === constants.BODYTYPE_KINEMATIC) {
    body.getMotionState().setWorldTransform(transform)
  }
}

/**
 * Sets the transform for many bodies. The array is offset by 8. The first index of every 8 slots is the object id,
 * the next three slots are position, and the last four slots are a quaternion representing rotation.
 * @param transforms - An array of ids and transforms.
 */
const setTransforms = (transforms: Float32Array) => {
  for (let shift = 0, l = transforms.length; shift < l; shift += 8) {
    setTransform(
      transforms[shift + 0],
      transforms[shift + 1], transforms[shift + 2], transforms[shift + 3],
      transforms[shift + 4], transforms[shift + 5], transforms[shift + 6], transforms[shift + 7]
    )
  }
}

const createRigidBodies = (objects: Body[]) => {
  let flag: Flag | undefined
  let body: Ammo.btRigidBody
  let inertia = false

  for (let i = 0, l = objects.length; i < l; i += 1) {
    const data = objects[i]

    switch (data.type) {
    case constants.BODYTYPE_STATIC: 
      inertia = false
      flag = constants.BODYFLAG_STATIC_OBJECT
      body = createBody(ammo, data, inertia, flag)
      body.group = constants.BODYGROUP_STATIC
      body.mask = constants.BODYMASK_NOT_STATIC
      world.addRigidBody(body, body.group, body.mask)
      break
    case constants.BODYTYPE_DYNAMIC:
      inertia = true //  data.sprite === false && data.mass !== 0
      flag = undefined
      body = createBody(ammo, data, inertia, flag)
      body.group = constants.BODYGROUP_DYNAMIC
      body.mask = constants.BODYMASK_ALL
      dynamicBodies.add(body)
      world.addRigidBody(body, body.group, body.mask)
      break
    case constants.BODYTYPE_KINEMATIC:
      inertia = false
      flag = constants.BODYFLAG_KINEMATIC_OBJECT
      body = createBody(ammo, data, inertia, flag)
      body.group = constants.BODYGROUP_KINEMATIC
      body.mask = constants.BODYMASK_ALL
      world.addRigidBody(body, body.group, body.mask)
      break
    }

    bodies.set(data.id, body!)
  }
}

const destroyRigidBody = (body: Ammo.btRigidBody) => {
  const motionState = body.getMotionState()

  if (motionState) {
    ammo.destroy(motionState)
  }

  world.removeRigidBody(body)
  ammo.destroy(body)
}

const destroyRigidBodies = (cid: number, ids: Uint16Array) => {
  for (let i = 0, l = ids.length, id = 0; i < l; i += 1, id = ids[i]) {
    const body = bodies.get(id)!
    destroyRigidBody(body)
    bodies.delete(id)
  
    if (body.type === constants.BODYTYPE_DYNAMIC) {
      dynamicBodies.delete(body)
    }
  }

  postMessage({ event: events.DESTROY_RIGIDBODIES, cid })
}

const destroyAllRigidBodies = (cid: number) => {
  for (const [id] of bodies) {
    destroyRigidBody(bodies.get(id)!)
  }

  dynamicBodies.clear()
  bodies.clear()
  postMessage({ event: events.DESTROY_ALL_RIGIDBODIES, cid })
}

const createTriggers = (objects: TriggerVolume[]) => {
  for (let i = 0, l = objects.length; i < l; i += 1) {
    const data = objects[i]
    const trigger = createTrigger(ammo, data)
    bodies.set(data.id, trigger)
    world.addRigidBody(trigger, constants.BODYGROUP_STATIC, constants.BODYMASK_NOT_STATIC)
  }
}

/**
 * Resume the simulation.
 */
const run = (cid: number) => {
  now = then = performance.now()
  if (import.meta.env.THREE_XR === 'true') {
    tickId = self.setInterval(tick, 1000 / 90)
  } else {
    tickId = requestAnimationFrame(tick)
  }

  postMessage({ event: events.RUN, cid })
}

/**
 * Pause the simulation
 */
const pause = (cid: number) => {
  if (import.meta.env.THREE_XR === 'true') {
    clearInterval(tickId)
  } else {
    cancelAnimationFrame(tickId)
  }

  postMessage({ event: events.PAUSE, cid })
}

const transforms = new Float32Array(Number.parseInt(import.meta.env.AMMO_MAX_BODIES, 10) * 7)
const maxSubsteps = Number.parseInt(import.meta.env.AMMO_MAX_SUBSTEPS, 10)
const fixedTimestep = Number.parseFloat(import.meta.env.AMMO_FIXED_TIMESTEP)

const tick = () => {
  if (import.meta.env.THREE_XR !== 'true') {
    tickId = requestAnimationFrame(tick)
  }

  now = performance.now()
  dt = (now - then) / 1000
  fps = 1000 / (now - then)
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

  postMessage(transforms.buffer, undefined, [transforms.buffer])
}

if (import.meta.env.AMMO_DEBUG === 'true') {
  setInterval(() => {
    postMessage({
      event: events.FPS,
      fps,
    })
  }, 1000)
}

/**
 * Apply a central impulse to a body.
 * 
 * @param id - The id of the body
 * @param x - The x component of the impulse.
 * @param y - The y component of the impulse.
 * @param z - The z component of the impulse.
 */
const applyCentralImpulse = (id: number, x: number, y: number, z: number) => {
  const body = bodies.get(id)!
  body.activate()
  vec.setValue(x, y, z)
  body.applyCentralImpulse(vec)
}

/**
 * Apply multiple central impulses to multiple bodies.
 * 
 * @param impulses A Float32Array of ids and impulses.
 */
const applyCentralImpulses = (impulses: Float32Array) => {
  for (let shift = 0, length = impulses.length; shift < length; shift += 4) {
    applyCentralImpulse(
      impulses[shift + 0],
      impulses[shift + 1], impulses[shift + 2], impulses[shift + 3]
    )
  }
}

/**
 * Apply a torque impulse (rotational force applied instantaneously) to the body.
 *
 * @param {number} id - The id of the body
 * @param {number} x - The x-component of the torque impulse in world-space.
 * @param {number} y - The y-component of the torque impulse in world-space.
 * @param {number} z - The z-component of the torque impulse in world-space.
 */
const applyTorqueImpulse = (id: number, x: number, y: number, z: number) => {
  const body = bodies.get(id)!
  body.activate()
  vec.setValue(x, y, z)
  body.applyTorqueImpulse(vec)
}

const applyTorqueImpulses = (impulses: Float32Array) => {
  for (let shift = 0, length = impulses.length; shift < length; shift += 4) {
    applyTorqueImpulse(
      impulses[shift + 0],
      impulses[shift + 1], impulses[shift + 2], impulses[shift + 3]
    )
  }
}

const applyCentralAndTorqueImpulse = (
  id: number,
  x: number, y: number, z: number,
  tx: number, ty: number, tz: number
) => {
  const body = bodies.get(id)!
  body.activate()
  vec.setValue(x, y, z)
  body.applyCentralImpulse(vec)
  vec.setValue(tx, ty, tz)
  body.applyTorqueImpulse(vec)
}

const applyCentralAndTorqueImpulses = (impulses: Float32Array) => {
  for (let shift = 0, length = impulses.length; shift < length; shift += 7) {
    applyCentralAndTorqueImpulse(
      impulses[shift + 0],
      impulses[shift + 1], impulses[shift + 2], impulses[shift + 3],
      impulses[shift + 4], impulses[shift + 5], impulses[shift + 6]
    )
  }
}

/**
 * Apply torque (rotational force) to the body.
 *
 * @param {number} id - The id of the body
 * @param {number} x - The x-component of the torque force in world-space.
 * @param {number} y - The y-component of the torque force in world-space.
 * @param {number} z - The z-component of the torque force in world-space.
 */
const applyTorque = (id: number, x: number, y: number, z: number) => {
  const body = bodies.get(id)!
  body.activate()
  vec.setValue(x, y, z)
  body.applyTorque(vec)
}

/**
 * Apply an force to the body at a point. The force is applied at an offset this point by specifying a world space
 * vector from the body's origin to the point of application.
 *
 * @param {number} id - The id of the body
 * @param {number} x - The x-component of the force in world-space.
 * @param {number} y - The y-component of the force in world-space.
 * @param {number} z - The z-component of the force in world-space.
 * @param {number} px - The x-component of a world-space offset from the body's position
 * where the force is applied.
 * @param {number} py - The y-component of a world-space offset from the body's position
 * where the force is applied.
 * @param {number} pz - The z-component of a world-space offset from the body's position
 * where the force is applied.
 */
const applyForce = (
  id: number,
  x: number, y: number, z: number,
  px: number, py: number, pz: number
) => {
  const body = bodies.get(id)!
  body.activate()
  vec.setValue(x, y, z)
  vec2.setValue(px, py, pz)
  body.applyForce(vec, vec2)
}

const applyCentralForce = (id: number, x: number, y: number, z: number) => {
  const body = bodies.get(id)!
  body.activate()
  vec.setValue(x, y, z)
  body.applyCentralForce(vec)
}

const applyCentralForces = (forces: Float32Array) => {
  for (let shift = 0, length = forces.length; shift < length; shift += 4) {
    applyCentralForce(forces[shift + 0], forces[shift + 1], forces[shift + 2], forces[shift + 3])
  }
}

/**
 * Returns true if the rigid body is currently actively being simulated. I.e. Not 'sleeping'.
 *
 * @param id - The id of the body
 * @returns True if the body is active.
 */
const isActive = (id: number): boolean => {
  return bodies.get(id)!.isActive()
}

/**
 * Forcibly activate the rigid body simulation. Only affects rigid bodies of type
 * {@link constants.BODYTYPE_DYNAMIC}.
 *
 * @param id - The id of the body
 */
const activate = (id: number) => {
  bodies.get(id)!.activate()
}

/**
 * Enable simulation for an object
 * 
 * @param id - The id of the body
 */
const enableBody = (id: number) => {
  const body = bodies.get(id)!

  switch (body.type) {
    case constants.BODYTYPE_DYNAMIC:
      body.forceActivationState(constants.BODYSTATE_ACTIVE_TAG)
      break
    case constants.BODYTYPE_KINEMATIC:
      body.forceActivationState(constants.BODYSTATE_DISABLE_DEACTIVATION)
      break
    case constants.BODYTYPE_STATIC:
      body.forceActivationState(constants.BODYSTATE_ACTIVE_TAG)
      break
  }

  body.activate()
}

/**
 * Disabled the simulation for a body
 * 
 * @param id - The id of the body
 */
const disableBody = (id: number) => {
  const body = bodies.get(id)!

  // set activation state to disable simulation to avoid body.isActive() to return
  // true even if it's not in the dynamics world
  body.forceActivationState(constants.BODYSTATE_DISABLE_SIMULATION)
}

const raycast = (cid: number, x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) => {
  vec.setValue(x1, y1, z1)
  vec2.setValue(x2, y2, z2)
  const rayCallback = new ammo.ClosestRayResultCallback(vec, vec2);

  world.rayTest(vec, vec2, rayCallback)

  if (rayCallback.hasHit()) {
    const object = rayCallback.m_collisionObject
    const body = ammo.castObject(object, ammo.btRigidBody)
    const point = rayCallback.m_hitPointWorld
    const normal = rayCallback.m_hitNormalWorld

    postMessage({
      event: events.RAYCAST,
      cid,
      hit: {
        id: body.id,
        x: point.x(),
        y: point.y(),
        z: point.z(),
        nx: normal.x(),
        ny: normal.y(),
        nz: normal.z(),
      }
    })
  } else {
    postMessage({ event: events.RAYCAST, cid })
  }

  ammo.destroy(rayCallback)
}

self.addEventListener('message', ({ data }) => {
  switch (data.event) {
    case events.SET_POSITION:
      return setPosition(data.id, data.x, data.y, data.z)
    case events.SET_TRANSFORM:
      return setTransform(
        data.id,
        data.x, data.y, data.z,
        data.qx, data.qy, data.qz, data.qw
      )
    case events.SET_TRANSFORMS:
      return setTransforms(data.transforms)
    case events.APPLY_CENTRAL_IMPULSE:
      return applyCentralImpulse(data.id, data.x, data.y, data.z)
    case events.APPLY_CENTRAL_IMPULSES:
      return applyCentralImpulses(data.impulses)
    case events.APPLY_CENTRAL_FORCES:
      return applyCentralForces(data.forces)
    case events.APPLY_TORQUE_IMPULSE:
      return applyTorqueImpulse(data.id, data.x, data.y, data.z)
    case events.APPLY_TORQUE_IMPULSES:
      return applyTorqueImpulses(data.impulses)
    case events.APPLY_CENTRAL_AND_TORQUE_IMPULSE:
      return applyCentralAndTorqueImpulse(
        data.id,
        data.x, data.y, data.z,
        data.tx, data.ty, data.tz
      )
    case events.APPLY_CENTRAL_AND_TORQUE_IMPULSES:
      return applyCentralAndTorqueImpulses(data.impulses)
    case events.RAYCAST:
      return raycast(
        data.cid,
        data.x1, data.y1, data.z1,
        data.x2, data.y2, data.z2
      )
    case events.CREATE_RIGIDBODIES:
      return createRigidBodies(data.bodies)
    case events.DESTROY_RIGIDBODIES:
      return destroyRigidBodies(data.cid, data.ids)
    case events.DESTROY_ALL_RIGIDBODIES:
      return destroyAllRigidBodies(data.cid)
    case events.CREATE_TRIGGERS:
      return createTriggers(data.triggers)
    case events.SET_GRAVITY:
      return setGravity(data.x, data.y, data.z)
    case events.SET_FRICTION:
      return setFriction(data.id, data.friction)
    case events.SET_MASK:
      return setMask(data.id, data.mask)
    case events.SET_MASS:
      return setMass(data.id, data.mass)
    case events.ENABLE_BODY:
      return enableBody(data.id)
    case events.DISABLE_BODY:
      return disableBody(data.id)
    case events.RUN:
      return run(data.cid)
    case events.PAUSE:
      return pause(data.cid)
    case events.INIT:
      return init(data.cid)
  }

  throw new Error(data)
})
