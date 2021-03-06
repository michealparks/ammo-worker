import * as THREE from 'three'
import * as constants from '../constants'
import { scene } from '../renderer'
import { id } from '../utils'
import { ammo } from '../../src/main'
import { Body } from '../../src/types'
import { randomColor } from '../lib/colors'

export const bodies: Body[] = []

const m4 = new THREE.Matrix4()

const radius = 0.5
const geometry = new THREE.CapsuleGeometry(radius, radius, 4, 8)
const material = new THREE.MeshStandardMaterial()

export const mesh = new THREE.InstancedMesh(geometry, material, constants.NUM_MESHES)
mesh.castShadow = true
mesh.receiveShadow = true

scene.add(mesh)

m4.copy(mesh.matrixWorld).invert()

const color = new THREE.Color()

for (let i = 0; i < constants.NUM_MESHES; i += 1) {
  bodies.push({
    id: id(),
    name: `mesh_${i}`,
    type: ammo.BODYTYPE_DYNAMIC,
    shape: ammo.BODYSHAPE_MESH,
    restitution: 0.5,
    friction: 0.5,
    linearDamping: 0.1,
    angularDamping: 0.1,
    linkedId: -1,
    transform: new Float32Array([Math.random(), 20 + i, Math.random(), 0, 0, 0, 1]),
    vertices: new Float32Array(geometry.attributes.position.array),
    indexes: mesh.geometry.index ? new Float32Array(mesh.geometry.index.array) : undefined,
    matrix: m4.elements,
    sprite: false,
  })

  color.set(randomColor())

  mesh.setColorAt(i, color)
}

mesh.instanceColor!.needsUpdate = true


