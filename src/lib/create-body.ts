import type { AmmoLib, Flag, Body } from '../types'
import { createShape } from './create-shape'
import * as constants from '../constants'

const MASS = Number.parseFloat(import.meta.env.AMMO_DEFAULT_MASS)
const LINEAR_DAMPING = Number.parseFloat(import.meta.env.AMMO_DEFAULT_LINEAR_DAMPING)
const ANGULAR_DAMPING = Number.parseFloat(import.meta.env.AMMO_DEFAULT_ANGULAR_DAMPING)
const RESTITUION = Number.parseFloat(import.meta.env.AMMO_DEFAULT_RESTITUTION)
const FRICTION = Number.parseFloat(import.meta.env.AMMO_DEFAULT_FRICTION)
const ROLLING_FRICTION = Number.parseFloat(import.meta.env.AMMO_DEFAULT_ROLLING_FRICTION)
const CCD_MOTION_THRESHOLD = Number.parseFloat(import.meta.env.AMMO_CCD_MOTION_THRESHOLD)

export const createBody = (ammo: AmmoLib, data: Body, inertia: boolean, flag?: Flag) => {
  const {
    id,
    type,
    mass = type === constants.BODYTYPE_DYNAMIC ? MASS : 0,
    linearDamping = LINEAR_DAMPING,
    angularDamping = ANGULAR_DAMPING,
    restitution = RESTITUION,
    friction = FRICTION,
    rollingFriction = ROLLING_FRICTION
  } = data

  const transform = data.transform!

  if (import.meta.env.AMMO_DEBUG === 'true') {
    if (type === constants.BODYTYPE_DYNAMIC && mass === 0) {
      throw new Error(`Dynamic body #${id} has a mass of 0!`)
    }

    if (transform[3] === 0 && transform[4] === 0 && transform[5] === 0 && transform[6] === 0) {
      throw new Error(`Body #${id} has a quaternion with value (0, 0, 0, 0)!`)
    }
  }

  let localInertia: Ammo.btVector3 | undefined

  const shape = createShape(ammo, data)

  if (inertia) {
    localInertia = new ammo.btVector3(0, 0, 0)
    shape.calculateLocalInertia(mass, localInertia)
  }

  const vec = new ammo.btVector3(transform[0], transform[1], transform[2])
  const quat = new ammo.btQuaternion(transform[3], transform[4], transform[5], transform[6])
  const bodyTransform = new ammo.btTransform()
  bodyTransform.setOrigin(vec)
  bodyTransform.setRotation(quat)

  const motionState = new ammo.btDefaultMotionState(bodyTransform)
  const bodyInfo = new ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia)
  const rigidbody = new ammo.btRigidBody(bodyInfo) as Ammo.btRigidBody & {
    type: number
    trigger: boolean
    id: number
    linkedId: number
    reportCollision: boolean
    reportTrigger: boolean
  }

  rigidbody.type = type

  rigidbody.trigger = false
  rigidbody.id = data.id
  rigidbody.linkedId = data.linkedId ?? -1
  rigidbody.reportCollision = data.reportCollision ?? false
  rigidbody.reportTrigger = data.reportTrigger ?? true

  rigidbody.setCcdMotionThreshold(CCD_MOTION_THRESHOLD)
  rigidbody.setRestitution(restitution)
  rigidbody.setFriction(friction)
  rigidbody.setRollingFriction(rollingFriction)
  rigidbody.setDamping(linearDamping, angularDamping)

  if (flag !== undefined) {
    rigidbody.setCollisionFlags(rigidbody.getCollisionFlags() | flag)
  }

  ammo.destroy(vec)
  ammo.destroy(quat)
  ammo.destroy(bodyTransform)
  ammo.destroy(bodyInfo)
  
  if (localInertia !== undefined) {
    ammo.destroy(localInertia)
  }

  if (type === constants.BODYTYPE_KINEMATIC) {
    rigidbody.setActivationState(constants.BODYSTATE_DISABLE_DEACTIVATION)
  } else if (data.activationState) {
    rigidbody.setActivationState(data.activationState)
  }

  return rigidbody
}
