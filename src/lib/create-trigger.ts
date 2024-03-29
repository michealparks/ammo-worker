import { DEFAULT_MARGIN, BODYFLAG_NORESPONSE_OBJECT } from '../constants'
import type { AmmoLib, Body } from '../types'
import { createShape } from './create-shape'
import * as constants from '../constants'

export const createTrigger = (ammo: AmmoLib, data: Body) => {
  const transform = data.transform!
  const shape = createShape(ammo, data)
  shape.setMargin(DEFAULT_MARGIN)

  const vec = new ammo.btVector3(transform[0], transform[1], transform[2])
  const quat = new ammo.btQuaternion(transform[3], transform[4], transform[5], transform[6])
  const bodyTransform = new ammo.btTransform()
  bodyTransform.setOrigin(vec)
  bodyTransform.setRotation(quat)

  const motionState = new ammo.btDefaultMotionState(bodyTransform)
  const bodyInfo = new ammo.btRigidBodyConstructionInfo(1, motionState, shape)
  const trigger = new ammo.btRigidBody(bodyInfo) as Ammo.btRigidBody & {
    type: number
    trigger: true
    id: number
    enter: string
    leave: string
    entity: number
    linkedId?: number
    reportTrigger?: boolean
  }

  trigger.type = constants.BODYTYPE_STATIC
  trigger.trigger = true
  trigger.id = data.id
  // trigger.enter = data.enter
  // trigger.leave = data.leave
  // trigger.entity = data.entity
  trigger.linkedId = data.linkedId
  trigger.reportTrigger = true

  trigger.setRestitution(0)
  trigger.setFriction(0)
  trigger.setDamping(0, 0)

  vec.setValue(0, 0, 0)
  trigger.setLinearFactor(vec)
  trigger.setAngularFactor(vec)
  trigger.setCollisionFlags(trigger.getCollisionFlags() | BODYFLAG_NORESPONSE_OBJECT)

  ammo.destroy(vec)
  ammo.destroy(quat)
  ammo.destroy(bodyTransform)
  ammo.destroy(bodyInfo)

  return trigger
}
