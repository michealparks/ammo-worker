import * as THREE from 'three'
import * as constants from './constants'
import { scene } from './renderer'
import { ammo } from '../src/main'
import { RigidBody } from '../src/types'

let bodies: RigidBody[] = []

const radius = 1
const geometry = new THREE.DodecahedronGeometry(radius)
const material = new THREE.MeshStandardMaterial()
export const mesh = new THREE.InstancedMesh(geometry, material, constants.NUM_MESHES)
scene.add(mesh)

console.log(geometry)

const color = new THREE.Color()

const vertices = new Float32Array(geometry.attributes.position.array)

for (let id = 0; id < constants.NUM_MESHES; id += 1) {
  bodies.push({
    id,
    name: `mesh_${id}`,
    type: ammo.BODYTYPE_DYNAMIC,
    shape: ammo.BODYSHAPE_MESH,
    mass: 1,
    restitution: 0.5,
    friction: 0.5,
    linearDamping: 0.1,
    angularDamping: 0.1,
    linkedId: -1,
    transform: new Float32Array([Math.random(), 20 + id, Math.random(), 0, 0, 0, 1]),
    geometry: vertices,
    sprite: false,
  })

  console.log(vertices)

  color.setHSL(
    Math.random(),
    (25 + 70 * Math.random()) / 100,
    (85 + 10 * Math.random()) / 100
  )

  mesh.setColorAt(id, color)
}

mesh.instanceColor!.needsUpdate = true

await ammo.init()
await ammo.createRigidBodies(bodies)
