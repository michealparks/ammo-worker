import * as THREE from 'three'
import { scene } from 'three-kit'
import { NUM_MESHES } from '../../constants'

const radius = 0.5
const geometry = new THREE.IcosahedronGeometry(radius)
const material = new THREE.MeshStandardMaterial()

export const meshes = new THREE.InstancedMesh(geometry, material, NUM_MESHES)
meshes.castShadow = true
meshes.receiveShadow = true
scene.add(meshes)

export const vertices = new Float32Array(geometry.attributes.position.array)
export const indexes = meshes.geometry.index ? new Float32Array(meshes.geometry.index.array) : undefined
