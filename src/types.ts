import type * as constants from './constants'

export type AmmoLib = typeof Ammo & {
  castObject(body: Ammo.btCollisionObject, type: Ammo.Type): (Ammo.btRigidBody & Body) | (Ammo.btRigidBody & Body & TriggerVolume) 
  _malloc(n: number): number
  _free(address: number): void
  HEAPF32: number[]
  PHY_SHORT: number
  PHY_FLOAT: number
}

export type ActivationStates =
  | typeof constants.BODYSTATE_ACTIVE_TAG
  | typeof constants.BODYSTATE_ISLAND_SLEEPING
  | typeof constants.BODYSTATE_WANTS_DEACTIVATION
  | typeof constants.BODYSTATE_DISABLE_DEACTIVATION
  | typeof constants.BODYSTATE_DISABLE_SIMULATION

export type BodyShape = 
  | typeof constants.BODYSHAPE_BOX
  | typeof constants.BODYSHAPE_CAPSULE
  | typeof constants.BODYSHAPE_CONE
  | typeof constants.BODYSHAPE_CYLINDER
  | typeof constants.BODYSHAPE_HEIGHTFIELD
  // | typeof constants.BODYSHAPE_HULL
  | typeof constants.BODYSHAPE_MESH
  | typeof constants.BODYSHAPE_SPHERE

export type BodyType = 
  | typeof constants.BODYTYPE_DYNAMIC
  | typeof constants.BODYTYPE_KINEMATIC
  | typeof constants.BODYTYPE_STATIC

export type Flag =
  | typeof constants.BODYFLAG_KINEMATIC_OBJECT
  | typeof constants.BODYFLAG_NORESPONSE_OBJECT
  | typeof constants.BODYFLAG_STATIC_OBJECT

export type Axis = 
  | typeof constants.AXIS_X
  | typeof constants.AXIS_Y
  | typeof constants.AXIS_Z

export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface RigidBody {
  id: number
  type: BodyType
  shape: BodyShape
  activationState?: ActivationStates
  mass?: number
  restitution?: number
  friction?: number
  rollingFriction?: number
  linearDamping?: number
  angularDamping?: number
  linkedId?: number
  transform?: Float32Array
  margin?: number
  scale?: Vector3
  reportCollision?: boolean
  reportTrigger?: boolean
}

export interface BoxLikeRigidBody extends RigidBody {
  halfExtents: Vector3
  minHalfExtent?: number
  maxHalfExtent?: number
}

export interface BoxRigidBody extends BoxLikeRigidBody {
  shape: typeof constants.BODYSHAPE_BOX
}

export interface CapsuleRigidBody extends BoxLikeRigidBody {
  shape: typeof constants.BODYSHAPE_CAPSULE
  cylinderAxis?: Axis
}

export interface ConeRigidBody extends BoxLikeRigidBody {
  shape: typeof constants.BODYSHAPE_CONE
  cylinderAxis?: Axis
}

export interface CylinderRigidBody extends BoxLikeRigidBody {
  shape: typeof constants.BODYSHAPE_CYLINDER
  cylinderAxis?: Axis
}

export interface HeightfieldTerrainRigidBody extends RigidBody {
  shape: typeof constants.BODYSHAPE_HEIGHTFIELD
  heightStickWidth: number
  heightStickLength: number
  data: Float32Array[]
  heightScale?: number
  upAxis?: 0 | 1 | 2
  heightDataType?: 'short' | 'float'
  heightfieldDistance?: number
  flipQuadEdges?: boolean
}

export interface MeshRigidBody extends RigidBody {
  shape: typeof constants.BODYSHAPE_MESH
  vertices: Float32Array
  indexes?: Float32Array
  matrix: Float32Array
}

export interface SphereRigidBody extends RigidBody {
  shape: typeof constants.BODYSHAPE_SPHERE
  radius: number
}

export type Body =
  | BoxRigidBody
  | MeshRigidBody
  | SphereRigidBody
  | CapsuleRigidBody

export interface TriggerVolume {
  id: number
  shape: BodyShape
  linkedRigidbodyId?: number
  transform: Float32Array
  halfExtents: Vector3
  reportTrigger?: boolean
}

export interface BoxTriggerVolume extends TriggerVolume {
  halfExtents: Vector3
}

export type Volume =
  | BoxTriggerVolume
