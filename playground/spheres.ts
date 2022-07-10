import * as THREE from 'three'
import * as constants from './constants'
import { scene } from './renderer'
import { ammo } from '../src/main'
import { Body } from '../src/types'

export const bodies: Body[] = []

const radius = 1

const material = new THREE.MeshStandardMaterial()
const geometry = new THREE.SphereGeometry(radius)

export const mesh = new THREE.InstancedMesh(geometry, material, constants.NUM_MESHES)
mesh.castShadow = true
mesh.receiveShadow = true

scene.add(mesh)

const color = new THREE.Color()

for (let id = 0; id < constants.NUM_MESHES; id += 1) {
  bodies.push({
    id,
    name: `sphere_${id}`,
    type: ammo.BODYTYPE_DYNAMIC,
    shape: ammo.BODYSHAPE_SPHERE,
    mass: 1,
    restitution: 0.5,
    friction: 0.5,
    linearDamping: 0.1,
    angularDamping: 0.1,
    linkedId: -1,
    transform: new Float32Array([Math.random(), 1 + id, Math.random(), 0, 0, 0, 1]),
    radius,
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
