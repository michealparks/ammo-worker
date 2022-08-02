import * as constants from '../constants'
import * as types from '../types'

type CollisionShape = 
  | Ammo.btBoxShape
  | Ammo.btCapsuleShape
  | Ammo.btConeShape
  | Ammo.btCylinderShape
  | Ammo.btSphereShape
  | Ammo.btBvhTriangleMeshShape

interface ShapeHelpers {
  type: types.BodyType
  destroy(): void
  resources?: Ammo.Type[]
  heightfieldData?: number
}
  

export const createShape = (ammo: types.AmmoLib, body: types.RigidBody) => {
  let shape: CollisionShape & ShapeHelpers

  switch (body.shape) {
    case constants.BODYSHAPE_BOX:
      shape = createBoxShape(ammo, body as types.BoxRigidBody) as CollisionShape & ShapeHelpers
      break
    case constants.BODYSHAPE_CAPSULE:
      shape = createCapsuleShape(ammo, body as types.CapsuleRigidBody) as CollisionShape & ShapeHelpers
      break
    case constants.BODYSHAPE_CONE:
      shape = createConeShape(ammo, body as types.ConeRigidBody) as CollisionShape & ShapeHelpers
      break
    case constants.BODYSHAPE_CYLINDER:
      shape = createCylinderShape(ammo, body as types.CylinderRigidBody) as CollisionShape & ShapeHelpers
      break
    case constants.BODYSHAPE_HEIGHTFIELD:
      shape = createHeightfieldTerrainShape(ammo, body as types.HeightfieldTerrainRigidBody) as CollisionShape & ShapeHelpers
    case constants.BODYSHAPE_SPHERE:
      shape = new ammo.btSphereShape((body as types.SphereRigidBody).radius) as CollisionShape & ShapeHelpers
      break
    case constants.BODYSHAPE_MESH:
      shape = createMeshShape(ammo, body as types.MeshRigidBody) as CollisionShape & ShapeHelpers
      break
    default:
      throw new Error('Shape not supported yet: ' + body.shape)
  }

  finishCollisionShape(ammo, shape, body)

  return shape
}

const createBoxShape = (ammo: types.AmmoLib, { halfExtents }: types.BoxRigidBody) => {
  const vec = new ammo.btVector3(halfExtents.x, halfExtents.y, halfExtents.z)
  const shape = new ammo.btBoxShape(vec)

  ammo.destroy(vec)

  return shape
}

const createCapsuleShape = (ammo: types.AmmoLib, body: types.CapsuleRigidBody) => {
  const { x, y, z } = body.halfExtents

  switch (body.cylinderAxis ?? 'y') {
    case 'y':
      return new ammo.btCapsuleShape(Math.max(x, z), y * 2)
    case 'x':
      return new ammo.btCapsuleShapeX(Math.max(y, z), x * 2)
    case 'z':
      return new ammo.btCapsuleShapeZ(Math.max(x, y), z * 2)
  }
}

const createConeShape = (ammo: types.AmmoLib, body: types.ConeRigidBody) => {
  const { x, y, z } = body.halfExtents

  switch (body.cylinderAxis ?? 'y') {
    case 'y':
      return new ammo.btConeShape(Math.max(x, z), y * 2)
    case 'x':
      return new ammo.btConeShapeX(Math.max(y, z), x * 2)
    case 'z':
      return new ammo.btConeShapeZ(Math.max(x, y), z * 2)
  }
}

const createCylinderShape = (ammo: types.AmmoLib, body: types.CylinderRigidBody) => {
  const { halfExtents } = body
  const vec = new ammo.btVector3(halfExtents.x, halfExtents.y, halfExtents.z)
  
  let collisionShape: Ammo.btCylinderShape

  switch (body.cylinderAxis ?? 'y') {
    case 'y':
      collisionShape = new Ammo.btCylinderShape(vec)
      break
    case 'x':
      collisionShape = new Ammo.btCylinderShapeX(vec)
      break
    case 'z':
      collisionShape = new Ammo.btCylinderShapeZ(vec)
      break
  }

  ammo.destroy(vec)

  return collisionShape
}

const createHeightfieldTerrainShape = (ammo: types.AmmoLib, body: types.HeightfieldTerrainRigidBody) => {
  const {
    data,
    flipQuadEdges = true,
    heightScale = 0,
    upAxis = 1, // x = 0, y = 1, z = 2
    heightDataType = 'short',
    heightfieldDistance = 1,
  } = body
  const heightStickLength = data.length
  const heightStickWidth = heightStickLength > 0 ? data[0].length : 0
  const heightfieldData = ammo._malloc(heightStickLength * heightStickWidth * 4)
  const ptr = heightfieldData / 4

  let minHeight = Number.POSITIVE_INFINITY
  let maxHeight = Number.NEGATIVE_INFINITY
  let index = 0
  for (let l = 0; l < heightStickLength; l++) {
    for (let w = 0; w < heightStickWidth; w++) {
      const height = data[l][w]
      ammo.HEAPF32[ptr + index] = height
      index++
      minHeight = Math.min(minHeight, height)
      maxHeight = Math.max(maxHeight, height)
    }
  }

  const hdt = heightDataType === 'short' ? ammo.PHY_SHORT : ammo.PHY_FLOAT
  const collisionShape = new ammo.btHeightfieldTerrainShape(
    body.heightStickWidth,
    body.heightStickLength,
    heightfieldData,
    heightScale,
    minHeight,
    maxHeight,
    upAxis,
    hdt,
    flipQuadEdges
  )

  const scale = new ammo.btVector3(heightfieldDistance, 1, heightfieldDistance)
  collisionShape.setLocalScaling(scale)
  ammo.destroy(scale)

  collisionShape.heightfieldData = data

  return collisionShape
}

const createMeshShape = (ammo: types.AmmoLib, body: types.MeshRigidBody) => {
  const { vertices, indexes } = body
  const vec1 = new ammo.btVector3()
  const vec2 = new ammo.btVector3()
  const vec3 = new ammo.btVector3()
  const triangleMesh = new ammo.btTriangleMesh(true, false)

  if (indexes !== undefined && indexes.length > 0) {
    for (let i = 0, l = indexes.length; i < l; i += 3) {
      const ai = indexes[i + 0] * 3
      const bi = indexes[i + 1] * 3
      const ci = indexes[i + 2] * 3
      vec1.setValue(vertices[ai + 0], vertices[ai + 1], vertices[ai + 2]);
      vec2.setValue(vertices[bi + 0], vertices[bi + 1], vertices[bi + 2]);
      vec3.setValue(vertices[ci + 0], vertices[ci + 1], vertices[ci + 2]);
      triangleMesh.addTriangle(vec1, vec2, vec3, false);
    }
  } else {
    for (let i = 0, l = vertices.length; i < l; i += 9) {
      vec1.setValue(vertices[i + 0], vertices[i + 1], vertices[i + 2]);
      vec2.setValue(vertices[i + 3], vertices[i + 4], vertices[i + 5]);
      vec3.setValue(vertices[i + 6], vertices[i + 7], vertices[i + 8]);
      triangleMesh.addTriangle(vec1, vec2, vec3, false);
    }
  }

  const useQuantizedAabbCompression = true
  const buildBvh = true
  const shape = new ammo.btBvhTriangleMeshShape(triangleMesh, useQuantizedAabbCompression, buildBvh) as Ammo.btBvhTriangleMeshShape & {
    resources: Ammo.Type[]
  }

  shape.resources = [triangleMesh]

  // const scale = computeScale(matrixWorld)
  // const localScale = new ammo.btVector3(scale.x, scale.y, scale.z)
  // triMesh.setScaling(localScale)
  // ammo.destroy(localScale)

  ammo.destroy(vec1)
  ammo.destroy(vec2)
  ammo.destroy(vec3)

  return shape
}

const finishCollisionShape = (ammo: types.AmmoLib, shape: CollisionShape & ShapeHelpers, body: types.RigidBody) => {
  shape.type = body.type

  shape.setMargin(body.margin ?? constants.MARGIN_DEFAULT);

  shape.destroy = () => {
    if (shape.resources !== undefined) {
      for (let resource of shape.resources ?? []) {
        ammo.destroy(resource)
      }
    }

    if (shape.heightfieldData !== undefined) {
      ammo._free(shape.heightfieldData)
    }

    ammo.destroy(shape)
  }

  // const localTransform = new ammo.btTransform()
  // const rotation = new ammo.btQuaternion(0, 0, 0, 1)
  // localTransform.setIdentity()

  // localTransform.getOrigin().setValue(options.offset.x, options.offset.y, options.offset.z)
  // rotation.setValue(options.orientation.x, options.orientation.y, options.orientation.z, options.orientation.w)

  // localTransform.setRotation(rotation)
  // ammo.destroy(rotation)

  if (body.scale) {
    const localScale = new ammo.btVector3(body.scale.x, body.scale.y, body.scale.z)
    shape.setLocalScaling(localScale)
    ammo.destroy(localScale)
  }

  // collisionShape.localTransform = localTransform
}
