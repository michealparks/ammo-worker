import * as THREE from 'three'
import * as constants from '../constants'
import { ammo } from '../main'
import type { Body } from '../types'

export { gatherGeometries } from './gather-geometries'

const vec3 = new THREE.Vector3
const quat = new THREE.Quaternion()
const scale = new THREE.Vector3()
const matrix = new THREE.Matrix4()

export const dynamicBodyMeshes = new Set<THREE.Mesh | THREE.InstancedMesh>()
export const meshMap = new Map<number, THREE.Mesh>()
export const instancedMeshMap = new Map<number, { mesh: THREE.InstancedMesh, index: number }>()

export let id = -1

const createTransformFromMesh = ({ position, quaternion }: THREE.Mesh) => {
  const transform = new Float32Array(7)
  transform[0] = position.x,
  transform[1] = position.y,
  transform[2] = position.z,
  transform[3] = quaternion.x,
  transform[4] = quaternion.y,
  transform[5] = quaternion.z,
  transform[6] = quaternion.w
  return transform
}

const createTransformFromInstancedMesh = (mesh: THREE.InstancedMesh, index: number) => {
  mesh.getMatrixAt(index, matrix)
  matrix.decompose(vec3, quat, scale)
  const transform = new Float32Array(7)
  transform[0] = vec3.x,
  transform[1] = vec3.y,
  transform[2] = vec3.z,
  transform[3] = quat.x,
  transform[4] = quat.y,
  transform[5] = quat.z,
  transform[6] = quat.w
  return transform
}

export const addMesh = (mesh: THREE.Mesh, data: Partial<Body>) => {
  id += 1

  if (data.type === constants.BODYTYPE_DYNAMIC) {
    dynamicBodyMeshes.add(mesh)
  }
  
  meshMap.set(id, mesh)

  const body = {
    id,
    transform: createTransformFromMesh(mesh),
    ...data,
  }

  ammo.createRigidBodies([body])

  return id
}

export const addInstancedMesh = (mesh: THREE.InstancedMesh, data: Partial<Body>) => {
  dynamicBodyMeshes.add(mesh)

  const bodies: Body[] = []

  for (let index = 0, length = mesh.count; index < length; index += 1) {
    id += 1

    if (data.type === constants.BODYTYPE_DYNAMIC) {
      instancedMeshMap.set(id, { mesh, index })
    }

    bodies.push({
      id,
      transform: createTransformFromInstancedMesh(mesh, index),
      ...data,
    })
  }

  return ammo.createRigidBodies(bodies)
}

export const computeScale = (matrixWorld: Float32Array) => {
  scale.set(1, 1, 1)
  matrix.fromArray(matrixWorld)
  scale.setFromMatrixScale(matrix)

  return { x: scale.x, y: scale.y, z: scale.z }
}

ammo.on('tick', (data) => {
  const { transforms } = data

  let shift = 0
  for (const mesh of dynamicBodyMeshes) {
    if ('isInstancedMesh' in mesh) {
      for (let index = 0, count = mesh.count; index < count; index += 1) {
        quat.set(transforms[shift + 3], transforms[shift + 4], transforms[shift + 5], transforms[shift + 6])
        matrix.makeRotationFromQuaternion(quat)
        matrix.setPosition(transforms[shift + 0], transforms[shift + 1], transforms[shift + 2])
        mesh.setMatrixAt(index, matrix)
        shift += 7
      }
      mesh.instanceMatrix.needsUpdate = true
    } else {
      mesh.position.set(transforms[shift + 0], transforms[shift + 1], transforms[shift + 2])
      mesh.quaternion.set(transforms[shift + 3], transforms[shift + 4], transforms[shift + 5], transforms[shift + 6])
      shift += 7
    }
  }
})