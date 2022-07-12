import { Matrix4, Vector3 } from 'three'

import {
  BODYSHAPE_BOX,
  BODYSHAPE_MESH,
  BODYSHAPE_SPHERE,
} from '../constants'

import type {
  AmmoLib,
  RigidBody,
  BoxRigidBody,
  MeshRigidBody,
  SphereRigidBody
} from '../types'

const m4 = new Matrix4()
const v1 = new Vector3()
const v2 = new Vector3()
const v3 = new Vector3()

export const createShape = (ammo: AmmoLib, body: RigidBody) => {
  
  if (body.shape === BODYSHAPE_BOX) {

    return createBoxShape(ammo, body as BoxRigidBody)

  } else if (body.shape === BODYSHAPE_MESH) {

    return createMeshShape(ammo, body as MeshRigidBody)

  } else if (body.shape === BODYSHAPE_SPHERE) {

    return new ammo.btSphereShape((body as SphereRigidBody).radius)

  } else {

    throw new Error('Invalid shape.')

  }
}

const createBoxShape = (ammo: AmmoLib, body: BoxRigidBody) => {
  const { halfExtends } = body
  const vec = new ammo.btVector3()

  vec.setValue(halfExtends.x, halfExtends.y, halfExtends.z)
  const shape = new ammo.btBoxShape(vec)

  ammo.destroy(vec)

  return shape
}

const createMeshShape = (ammo: AmmoLib, body: MeshRigidBody) => {
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
