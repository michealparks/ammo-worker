import { Matrix4, Vector3 } from 'three'
import * as constants from '../constants'
import * as types from '../types'

const m4 = new Matrix4()
const v1 = new Vector3()
const v2 = new Vector3()
const v3 = new Vector3()

export const createShape = (ammo: types.AmmoLib, body: types.RigidBody) => {
  switch (body.shape) {
    case constants.BODYSHAPE_BOX:
      return createBoxShape(ammo, body as types.BoxRigidBody)
    case constants.BODYSHAPE_CAPSULE:
      return createCapsuleShape(ammo, body as types.CapsuleRigidBody)
    case constants.BODYSHAPE_SPHERE:
      return new ammo.btSphereShape((body as types.SphereRigidBody).radius)
    case constants.BODYSHAPE_MESH:
      return createMeshShape(ammo, body as types.MeshRigidBody)
  }
}

const createBoxShape = (ammo: types.AmmoLib, body: types.BoxRigidBody) => {
  const { halfExtents } = body
  const vec = new ammo.btVector3()

  vec.setValue(halfExtents.x, halfExtents.y, halfExtents.z)
  const shape = new ammo.btBoxShape(vec)

  ammo.destroy(vec)

  return shape
}

const createCapsuleShape = (ammo: types.AmmoLib, body: types.CapsuleRigidBody) => {
  const { x, y, z } = body.halfExtents;

  switch (body.cylinderAxis) {
    case 'y':
      return new ammo.btCapsuleShape(Math.max(x, z), y * 2);
    case 'x':
      return new ammo.btCapsuleShapeX(Math.max(y, z), x * 2);
    case 'z':
      return new ammo.btCapsuleShapeZ(Math.max(x, y), z * 2);
  }
}

const createMeshShape = (ammo: types.AmmoLib, body: types.MeshRigidBody) => {
  const { vertices, indexes, matrix } = body

  const vec1 = new ammo.btVector3()
  const vec2 = new ammo.btVector3()
  const vec3 = new ammo.btVector3()
  const triangleMesh = new ammo.btTriangleMesh(true, false)

  m4.fromArray(matrix)

  if (indexes !== undefined) {
    for (let i = 0, l = indexes.length; i < l; i += 3) {
      const ai = indexes[i + 0] * 3
      const bi = indexes[i + 1] * 3
      const ci = indexes[i + 2] * 3
      v1.set(vertices[ai + 0], vertices[ai + 1], vertices[ai + 2]).applyMatrix4(m4)
      v2.set(vertices[bi + 0], vertices[bi + 1], vertices[bi + 2]).applyMatrix4(m4)
      v3.set(vertices[ci + 0], vertices[ci + 1], vertices[ci + 2]).applyMatrix4(m4)
      vec1.setValue(v1.x, v1.y, v1.z);
      vec2.setValue(v2.x, v2.y, v2.z);
      vec3.setValue(v3.x, v3.y, v3.z);
      triangleMesh.addTriangle(vec1, vec2, vec3, false);
    }
  } else {
    for (let i = 0, l = vertices.length; i < l; i += 9) {
      v1.set(vertices[i + 0], vertices[i + 1], vertices[i + 2]).applyMatrix4(m4)
      v2.set(vertices[i + 3], vertices[i + 4], vertices[i + 5]).applyMatrix4(m4)
      v3.set(vertices[i + 6], vertices[i + 7], vertices[i + 8]).applyMatrix4(m4)
      vec1.setValue(v1.x, v1.y, v1.z);
      vec2.setValue(v2.x, v2.y, v2.z);
      vec3.setValue(v3.x, v3.y, v3.z);
      triangleMesh.addTriangle(vec1, vec2, vec3, false);
    }
  }

  const useQuantizedAabbCompression = true
  const buildBvh = true
  const shape = new ammo.btBvhTriangleMeshShape(triangleMesh, useQuantizedAabbCompression, buildBvh)

  ammo.destroy(vec1)
  ammo.destroy(vec2)
  ammo.destroy(vec3)

  return shape
}
