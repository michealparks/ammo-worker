import * as constants from '../constants'
import type { AmmoLib, Body } from '../types'

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
    collisions.set(id, { body, others: new Map<number, Body>() })
  }

  const collision = collisions.get(id)

  if (collision.others.has(other.id) === false) {
    collision.others.set(other.id, other)
    isNewCollision = true
  }

  if (frameCollisions.has(id) === false) {
    frameCollisions.set(id, { body, others: new Map<number, Body>() })
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


const collisionIds = new Uint16Array(Number.parseInt(import.meta.env.AMMO_COLLISION_BUFFER_SIZE, 10))
const triggerIds = new Uint16Array(Number.parseInt(import.meta.env.AMMO_COLLISION_BUFFER_SIZE, 10))
let collisionCursor = 0
let triggerCursor = 0

export const checkCollisions = (
  ammo: AmmoLib,
  world: Ammo.btDiscreteDynamicsWorld
) => {
  collisionCursor = 0
  triggerCursor = 0

  const dispatcher = world.getDispatcher()
  const numManifolds = dispatcher.getNumManifolds()

  for (let index = 0; index < numManifolds; index += 1) {
    const manifold = dispatcher.getManifoldByIndexInternal(index)
    const numContacts = manifold.getNumContacts()

    if (numContacts === 0) continue

    const body0 = ammo.castObject(manifold.getBody0(), ammo.btRigidBody)
    const body1 = ammo.castObject(manifold.getBody1(), ammo.btRigidBody)

    const isTriggerBody0 = (body0.getCollisionFlags() & constants.BODYFLAG_NORESPONSE_OBJECT) === constants.BODYFLAG_NORESPONSE_OBJECT
    const isTriggerBody1 = (body1.getCollisionFlags() & constants.BODYFLAG_NORESPONSE_OBJECT) === constants.BODYFLAG_NORESPONSE_OBJECT

    if (isTriggerBody0) {
      triggerIds[triggerCursor] = body0

    }
  }
}

export const checkForCollisions = (
  ammo: AmmoLib,
  dynamicsWorld: Ammo.btDiscreteDynamicsWorld
) => {
  const world = ammo.wrapPointer(dynamicsWorld, ammo.btDynamicsWorld);

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
    
    let isNewCollision = false

    const isTriggerBody0 = (body0.getCollisionFlags() & constants.BODYFLAG_NORESPONSE_OBJECT) === constants.BODYFLAG_NORESPONSE_OBJECT
    const isTriggerBody1 = (body1.getCollisionFlags() & constants.BODYFLAG_NORESPONSE_OBJECT) === constants.BODYFLAG_NORESPONSE_OBJECT

    // if (isTriggerBody0) {
    //   console.log('triggerBody0', numContacts)
    // }

    // if (isTriggerBody1) {
    //   console.log('triggerBody1', numContacts)
    // }

    // TODO only store, report collisions if event is present
    // Handle triggers
    if (isTriggerBody0 || isTriggerBody1) {
      isNewCollision = storeCollision(body0, body1)
      if (isNewCollision && isTriggerBody1 === false) {
        if (body0.reportTrigger) registerEvent(triggerEnter, body0.id, body1.id)
      }

      isNewCollision = storeCollision(body1, body0)
      if (isNewCollision && isTriggerBody0 === false) {
        if (body1.reportTrigger) registerEvent(triggerEnter, body1.id, body0.id)
      }
    // Handle collisions
    } else {
      isNewCollision = storeCollision(body0, body1)
      if (isNewCollision) {
        if (body0.reportCollision) registerEvent(collisionStart, body0.id, body1.id)
      }

      isNewCollision = storeCollision(body1, body0)
      if (isNewCollision) {
        if (body1.reportCollision) registerEvent(collisionStart, body1.id, body0.id)
      }
    }
  }

  cleanOldCollisions()
}

export const cleanOldCollisions = () => {
  triggerLeave.clear()
  collisionEnd.clear()

  for (const [id, collision] of collisions) {
    const frameCollision = frameCollisions.get(id)
    const { body, others } = collision

    for (const [otherid, other] of others) {
      if (frameCollision === undefined || frameCollision.others.has(otherid) === false) {
        others.delete(otherid)

        if (body.trigger === true) {
          if (body.reportTrigger) registerEvent(triggerLeave, body.id, other.id)

        } else if (other.trigger === false) {
          if (body.reportCollision) registerEvent(collisionEnd, body.id, other.id)
        }
      }
    }

    if (others.size === 0) {
      collisions.delete(id)
    }
  }

  if (
    triggerEnter.size === 0 &&
    triggerLeave.size === 0 &&
    collisionStart.size === 0 &&
    collisionEnd.size === 0
  ) return

  postMessage({
    event: 'collisions',
    triggerEnter: [...triggerEnter],
    triggerLeave: [...triggerLeave],
    collisionStart: [...triggerEnter],
    collisionEnd: [...collisionEnd],
  })
}
