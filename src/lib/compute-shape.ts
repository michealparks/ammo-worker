
import { Vector3, Matrix4, Box3 } from 'three'
import type * as types from '../types'
import * as constants from '../constants'
import type { Axis } from '../types'

export const HEIGHTFIELD_DATA_TYPE = {
  short: 'short',
  float: 'float',
} as const

const halfExtents = new Vector3()
const vertex = new Vector3()
const center = new Vector3()
const matrix = new Matrix4()
const va = new Vector3()
const vb = new Vector3()
const vc = new Vector3()

export interface Options {
  type: types.BodyShape
}

export interface BoxOptions extends Options {
  minHalfExtent?: number
  maxHalfExtent?: number
}

export interface CylinderOptions extends BoxOptions {
  cylinderAxis?: Axis
}

export const computeShape = (
  vertices: Float32Array[],
  matrices: Float32Array[],
  indexes: Float32Array[],
  options: Options
) => {
  switch (options.type) {
    case constants.BODYSHAPE_BOX:
    case constants.BODYSHAPE_CYLINDER:
    case constants.BODYSHAPE_CAPSULE:
    case constants.BODYSHAPE_CONE:
      return computeBoxLikeShape(vertices, matrices, options)
    case constants.BODYSHAPE_SPHERE:
      return computeSphereShape(vertices, matrices)
    case constants.BODYSHAPE_MESH:
      return computeTriMeshShape(vertices, matrices, indexes)
  }

  throw new Error(`Shape is not supported: ${options.type}`)
}

export const computeBoxLikeShape = (vertices: Float32Array[], matrices: Float32Array[], options: BoxOptions) => {
  const bounds = computeBounds(vertices, matrices)

  halfExtents
    .subVectors(bounds.max, bounds.min)
    .multiplyScalar(0.5)
    .clampScalar(
      options.minHalfExtent ?? Number.NEGATIVE_INFINITY,
      options.maxHalfExtent ?? Number.POSITIVE_INFINITY)

  return { x: halfExtents.x, y: halfExtents.y, z: halfExtents.z }
}

export const computeSphereShape = (vertices: Float32Array[], matrices: Float32Array[]) => {
  const bounds = computeBounds(vertices, matrices)
  let maxRadiusSq = 0
  let { x: cx, y: cy, z: cz } = bounds.getCenter(center)

  iterateVertices(vertices, matrices, (x, y, z) => {
    const dx = cx - x
    const dy = cy - y
    const dz = cz - z
    maxRadiusSq = Math.max(maxRadiusSq, dx * dx + dy * dy + dz * dz)
  })

  return Math.sqrt(maxRadiusSq)
}

export const computeTriMeshShape = (
  vertices: Float32Array[],
  matrices: Float32Array[],
  indexes: Float32Array[],
) => {
  
  let output = []

  for (let i = 0; i < vertices.length; i++) {
    const components = vertices[i]
    const index = indexes[i]

    matrix.fromArray(matrices[i])

    if (index !== undefined) {
      for (let j = 0; j < index.length; j += 3) {
        const ai = index[j] * 3
        const bi = index[j + 1] * 3
        const ci = index[j + 2] * 3
        va.set(components[ai], components[ai + 1], components[ai + 2]).applyMatrix4(matrix)
        vb.set(components[bi], components[bi + 1], components[bi + 2]).applyMatrix4(matrix)
        vc.set(components[ci], components[ci + 1], components[ci + 2]).applyMatrix4(matrix)
        output.push(
          va.x, va.y, va.z,
          vb.x, vb.y, vb.z,
          vc.x, vc.y, vc.z
        )
      }
    } else {
      for (let j = 0; j < components.length; j += 9) {
        va.set(components[j + 0], components[j + 1], components[j + 2]).applyMatrix4(matrix)
        vb.set(components[j + 3], components[j + 4], components[j + 5]).applyMatrix4(matrix)
        vc.set(components[j + 6], components[j + 7], components[j + 8]).applyMatrix4(matrix)
        output.push(
          va.x, va.y, va.z,
          vb.x, vb.y, vb.z,
          vc.x, vc.y, vc.z
        )
      }
    }
  }

  return new Float32Array(output)
}

// returns the bounding box for the geometries underneath `root`.
const computeBounds = (vertices: Float32Array[], matrices: Float32Array[]) => {
  const bounds = new Box3()
  let minX = +Infinity
  let minY = +Infinity
  let minZ = +Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let maxZ = -Infinity
  bounds.min.set(0, 0, 0)
  bounds.max.set(0, 0, 0)

  iterateVertices(vertices, matrices, (x, y, z) => {
    if (x < minX) minX = x
    if (y < minY) minY = y
    if (z < minZ) minZ = z
    if (x > maxX) maxX = x
    if (y > maxY) maxY = y
    if (z > maxZ) maxZ = z
  })

  bounds.min.set(minX, minY, minZ)
  bounds.max.set(maxX, maxY, maxZ)
  return bounds
}

const iterateVertices = (vertices: Float32Array[], matrices: Float32Array[], cb: (x: number, y: number, z: number) => void) => {
  for (let i = 0; i < vertices.length; i++) {
    const v = vertices[i]
    matrix.fromArray(matrices[i])

    for (let j = 0; j < v.length; j += 3) {
      vertex.set(v[j + 0], v[j + 1], v[j + 2])
      vertex.applyMatrix4(matrix)
      cb(vertex.x, vertex.y, vertex.z)
    }
  }
}
