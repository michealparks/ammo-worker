import { MARGIN_DEFAULT, BODYFLAG_NORESPONSE_OBJECT } from '../constants'
import { AmmoLib, Body } from '../types'
import { createShape } from './create-shape'


export const createTrigger = (ammo: AmmoLib, data: Body) => {
  const shape = createShape(ammo, data)
  shape.setMargin(MARGIN_DEFAULT)

  const vec = new ammo.btVector3()
  const quat = new ammo.btQuaternion(0, 0, 0, 0)
  const transform = new ammo.btTransform()


  const { transform: bodyTransform } = data
  vec.setValue(bodyTransform[0], bodyTransform[1], bodyTransform[2])
  quat.setValue(bodyTransform[3], bodyTransform[4], bodyTransform[5], bodyTransform[6])
  transform.setOrigin(vec)
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

  vec.setValue(0, 0, 0)
  trigger.setLinearFactor(vec)
  trigger.setAngularFactor(vec)
  trigger.setCollisionFlags(trigger.getCollisionFlags() | BODYFLAG_NORESPONSE_OBJECT)

  ammo.destroy(vec)
  ammo.destroy(quat)
  ammo.destroy(transform)
  ammo.destroy(bodyInfo)

  return trigger
}
