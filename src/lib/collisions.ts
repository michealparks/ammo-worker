import * as constants from '../constants'
import { AmmoLib, Body } from '../types'

const collisions = new Map()
const frameCollisions = new Map()
const collisionStart = new Map()
const collisionEnd = new Map()
const triggerEnter = new Map()
const triggerLeave = new Map()

const storeCollision = (body: Body, other: Body) => {
  const { id } = body
  let isNewCollision = false
  
  if (collisions.has(id) === false) {
    collisions.set(id, { body, others: new Map() })
  }

  const collision = collisions.get(id)

  if (collision.others.has(other.id) === false) {
    collision.others.set(other.id, other)
    isNewCollision = true
  }

  if (frameCollisions.has(id) === false){
    frameCollisions.set(id, { body, others: new Map() })
  }
  
  frameCollisions.get(id).others.set(other.id, other)

  return isNewCollision
}

const registerEvent = (events: Map<number, any[]>, id: number, data: unknown) => {
  if (events.has(id) === false) {
    events.set(id, [])
  }

  events.get(id)!.push(data)
}

export const checkForCollisions = (ammo: AmmoLib, world: Ammo.btDiscreteDynamicsWorld, globalEvents: any[]) => {
  triggerEnter.clear()
  collisionStart.clear()
  frameCollisions.clear()

  const dispatcher = world.getDispatcher()
  const numManifolds = dispatcher.getNumManifolds()

  for (let index = 0; index < numManifolds; index += 1) {
    const manifold = dispatcher.getManifoldByIndexInternal(index)
    const numContacts = manifold.getNumContacts()

    if (numContacts === 0) continue

    const body0 = ammo.castObject(manifold.getBody0(), ammo.btRigidBody)
    const body1 = ammo.castObject(manifold.getBody1(), ammo.btRigidBody)
    const flags0 = body0.getCollisionFlags()
    const flags1 = body1.getCollisionFlags()

    let isNewCollision = false

    const isTriggerBody0 = (flags0 & constants.BODYFLAG_NORESPONSE_OBJECT) === constants.BODYFLAG_NORESPONSE_OBJECT
    const isTriggerBody1 = (flags1 & constants.BODYFLAG_NORESPONSE_OBJECT) === constants.BODYFLAG_NORESPONSE_OBJECT

    // TODO only store, report collisions if event is present
    // Handle triggers
    if (isTriggerBody0 || isTriggerBody1) {
      isNewCollision = storeCollision(body0, body1)
      if (isNewCollision && isTriggerBody1 === false) {
        registerEvent(triggerEnter, body0.id, body1.id)

        if ('enter' in body0 && (body1.id === body0.entity || body0.entity === constants.ENTITY_ANY)) {
          globalEvents.push([body0.enter, body0.id, body1.id])
        }
      }

      isNewCollision = storeCollision(body1, body0)
      if (isNewCollision && isTriggerBody0 === false) {
        registerEvent(triggerEnter, body1.id, body0.id)

        if ('enter' in body1 && (body0.id === body1.entity || body1.entity === constants.ENTITY_ANY)) {
          globalEvents.push([body1.enter, body1.id, body0.id])
        }
      }
    // Handle collisions
    } else {
      isNewCollision = storeCollision(body0, body1)
      if (isNewCollision) {
        registerEvent(collisionStart, body0.id, body1.id)
      }

      isNewCollision = storeCollision(body1, body0)
      if (isNewCollision) {
        registerEvent(collisionStart, body1.id, body0.id)
      }
    }
  }
}

export const cleanOldCollisions = (globalEvents: any[]) => {
  triggerLeave.clear()
  collisionEnd.clear()

  for (const [id, collision] of collisions) {
    const frameCollision = frameCollisions.get(id)
    const { body, others } = collision

    for (const [otherid, other] of others) {
      if (frameCollision === undefined || frameCollision.others.has(otherid) === false) {
        others.delete(otherid)

        if (body.trigger === true) {
          registerEvent(triggerLeave, body.id, other.id)

          if (body.leave && (other.id === body.entity || body.entity === constants.ENTITY_ANY)) {
            globalEvents.push([body.leave, body.id, other.id])
          }
        } else if (other.trigger === false) {
          registerEvent(collisionEnd, body.id, other.id)
        }
      }
    }

    if (others.size === 0) {
      collisions.delete(id)
    }
  }

  return {
    triggerEnter: [...triggerEnter],
    collisionStart: [...collisionStart],
    triggerLeave: [...triggerLeave],
    collisionEnd: [...collisionEnd]
  }
}
