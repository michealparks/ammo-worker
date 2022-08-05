import * as THREE from 'three'
import * as constants from '../constants'
import { ammo } from '../main'
import { Body } from '../types'

const vec3 = new THREE.Vector3
const quat = new THREE.Quaternion()
const scale = new THREE.Vector3()
const inverse = new THREE.Matrix4()
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

export const addMesh = (mesh: THREE.Mesh, data: Body) => {
  id += 1

  if (data.type === constants.BODYTYPE_DYNAMIC) {
    dynamicBodyMeshes.add(mesh)
  }
  
  meshMap.set(id, mesh)

  const body = {
    id,
    mass: 0,
    restitution: 0.5,
    friction: 1,
    linearDamping: 0,
    angularDamping: 0,
    linkedId: -1,
    transform: createTransformFromMesh(mesh),
    ...data,
  }

  ammo.createRigidBodies([body])

  return id
}

export const addInstancedMesh = (mesh: THREE.InstancedMesh, data: Body) => {
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

export const gatherGeometries = (root: THREE.Object3D, options: {
  includeInvisible?: boolean
} = {}) => {
  inverse.copy(root.matrixWorld).invert()
  // const scale = new THREE.Vector3()
  // scale.setFromMatrixScale(root.matrixWorld)

  const geometries: Float32Array[] = []
  const matrices: Float32Array[] = []

  let indexes: (Float32Array | null)[] | undefined = []

  root.traverse((object3d: THREE.Object3D) => {
    const transform = new THREE.Matrix4()

    if (
      (object3d as THREE.Mesh).isMesh &&
      object3d.name !== 'Sky' &&
      (options.includeInvisible || object3d.visible)
    ) {
      const mesh = object3d as THREE.Mesh

      if (mesh === root) {
        transform.identity()
      } else {
        mesh.updateWorldMatrix(true, true)
        transform.multiplyMatrices(inverse, mesh.matrixWorld)
      }
      // todo: might want to return null xform if this is the root so that callers can avoid multiplying
      // things by the identity matrix
      geometries.push(new Float32Array(mesh.geometry.attributes.position.array))
      matrices.push(new Float32Array(transform.elements))
      indexes!.push(mesh.geometry.index ? new Float32Array(mesh.geometry.index.array) : null)
    }
  })

  return { geometries, matrices, indexes }
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