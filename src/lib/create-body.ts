import type { AmmoLib, Flag, Body } from '../types'
import { createShape } from './create-shape'

export const createBody = (ammo: AmmoLib, data: Body, inertia: boolean, flag?: Flag) => {
  const {
    mass = 1,
    linearDamping = 0.01,
    angularDamping = 0.01,
    restitution = 0.5,
    friction = 0.5,
    transform: bodyTransform,
  } = data

  let localInertia: Ammo.btVector3 | undefined

  const shape = createShape(ammo, data)

  if (inertia) {
    localInertia = new ammo.btVector3(0, 0, 0)
    shape.calculateLocalInertia(mass, localInertia)
  }

  const vec = new ammo.btVector3()
  const quat = new ammo.btQuaternion(0, 0, 0, 0)
  const transform = new ammo.btTransform()

  vec.setValue(bodyTransform[0], bodyTransform[1], bodyTransform[2])
  quat.setValue(bodyTransform[3], bodyTransform[4], bodyTransform[5], bodyTransform[6])
  transform.setOrigin(vec)
  transform.setRotation(quat)

  const motionState = new ammo.btDefaultMotionState(transform)
  const bodyInfo = new ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia)
  const rigidbody = new ammo.btRigidBody(bodyInfo) as Ammo.btRigidBody & {
    type: number
    trigger: boolean
    id: number
    linkedId?: number
  }

  rigidbody.type = data.type
  rigidbody.trigger = false
  rigidbody.id = data.id
  rigidbody.linkedId = data.linkedId

  rigidbody.setRestitution(restitution)
  rigidbody.setFriction(friction)
  rigidbody.setDamping(linearDamping, angularDamping)

  if (flag !== undefined) {
    rigidbody.setCollisionFlags(rigidbody.getCollisionFlags() | flag)
  }

  ammo.destroy(vec)
  ammo.destroy(quat)
  ammo.destroy(transform)
  ammo.destroy(bodyInfo)
  
  if (localInertia !== undefined) {
    ammo.destroy(localInertia)
  }

  return rigidbody
}
