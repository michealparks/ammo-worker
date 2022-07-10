import * as THREE from 'three'
import * as constants from './constants'
import { scene } from './renderer'
import { ammo } from '../src/main'
import { RigidBody } from '../src/types'

let bodies: RigidBody[] = []

const size = 1
const geometry = new THREE.BoxGeometry(size, size, size)
const material = new THREE.MeshStandardMaterial()
export const mesh = new THREE.InstancedMesh(geometry, material, constants.NUM_MESHES)
mesh.castShadow = true
scene.add(mesh)

const color = new THREE.Color()
const margin = 0.1

for (let id = 0; id < constants.NUM_MESHES; id += 1) {
  bodies.push({
    id,
    name: `box_${id}`,
    type: ammo.BODYTYPE_DYNAMIC,
    shape: ammo.BODYSHAPE_BOX,
    mass: 1,
    restitution: 0.5,
    friction: 0.5,
    linearDamping: 0.1,
    angularDamping: 0.1,
    linkedId: -1,
    transform: new Float32Array([Math.random(), 1 + id, Math.random(), 0, 0, 0, 1]),
    geometry: new Float32Array([size / 2 - margin, size / 2 - margin, size / 2 - margin]),
    sprite: false,
  })

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
