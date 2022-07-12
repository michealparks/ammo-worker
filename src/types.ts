import * as constants from './constants'

export type AmmoLib = typeof Ammo

export type BodyShape = 
  | typeof constants.BODYSHAPE_BOX
  | typeof constants.BODYSHAPE_MESH
  | typeof constants.BODYSHAPE_SPHERE

export type BodyType = 
  | typeof constants.BODYTYPE_DYNAMIC
  | typeof constants.BODYTYPE_KINEMATIC
  | typeof constants.BODYTYPE_STATIC

export type Flag =
  | typeof constants.BODYFLAG_STATIC_OBJECT
  | typeof constants.BODYFLAG_NORESPONSE_OBJECT
  | typeof constants.BODYFLAG_KINEMATIC_OBJECT

export interface RigidBody {
  id: number
  name: string
  type: BodyType
  shape: BodyShape
  mass?: number
  restitution?: number
  friction?: number
  linearDamping?: number
  angularDamping?: number
  linkedId?: number
  transform: Float32Array
  sprite?: boolean
}

export interface BoxRigidBody extends RigidBody {
  shape: typeof constants.BODYSHAPE_BOX
  halfExtends: {
    x: number,
    y: number,
    z: number
  }
}

export interface MeshRigidBody extends RigidBody {
  shape: typeof constants.BODYSHAPE_MESH
  vertices: Float32Array
  indexes?: Float32Array
  matrix: number[]
}

export interface SphereRigidBody extends RigidBody {
  shape: typeof constants.BODYSHAPE_SPHERE
  radius: number
}

export type Body =
  | BoxRigidBody
  | MeshRigidBody
  | SphereRigidBody

export interface TriggerVolume {
  id: number
  name: string
  shape: BodyShape
  enter: string
  leave: string
  entity: string
  linkedRigidbodyId?: number
  transform: Float32Array
  geometry: Float32Array
}

export interface Terrain {
  width: number
  depth: number
  minHeight: number
  maxHeight: number
  widthExtents: number
  depthExtents: number
  heightData: number[]
}
