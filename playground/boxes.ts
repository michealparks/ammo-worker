import * as THREE from 'three'
import * as constants from './constants'
import { scene } from './renderer'
import { id } from './utils'
import { ammo } from '../src/main'
import { Body } from '../src/types'

export const bodies: Body[] = []

const size = 1
const halfExtends = size / 2
const geometry = new THREE.BoxGeometry(size, size, size)
const material = new THREE.MeshStandardMaterial()

export const mesh = new THREE.InstancedMesh(geometry, material, constants.NUM_MESHES)
mesh.castShadow = true
mesh.receiveShadow = true
scene.add(mesh)

const color = new THREE.Color()

for (let i = 0; i < constants.NUM_MESHES; i += 1) {
  bodies.push({
    id: id(),
    name: `box_${i}`,
    type: ammo.BODYTYPE_DYNAMIC,
    shape: ammo.BODYSHAPE_BOX,
    restitution: 0.5,
    friction: 0.5,
    linearDamping: 0.1,
    angularDamping: 0.1,
    linkedId: -1,
    transform: new Float32Array([Math.random(), 1 + i, Math.random(), 0, 0, 0, 1]),
    halfExtends: {
      x: halfExtends,
      y: halfExtends,
      z: halfExtends,
    },
    sprite: false,
  })

  color.setHSL(
    Math.random(),
    (25 + 70 * Math.random()) / 100,
    (85 + 10 * Math.random()) / 100
  )

  mesh.setColorAt(i, color)
}

mesh.instanceColor!.needsUpdate = true

