import * as THREE from 'three'
import { scene } from 'three-kit'
import * as constants from '../constants'
import { id } from '../utils'
import { ammo } from '../../src/main'
import { Body } from '../../src/types'
import { randomColor } from '../lib/colors'

export const init = () => {
  const size = 1
  const halfExtents = size / 2
  const geometry = new THREE.BoxGeometry(size, size, size)
  const material = new THREE.MeshStandardMaterial()

  const bodies: Body[] = []

  const mesh = new THREE.InstancedMesh(geometry, material, constants.NUM_MESHES)
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
      halfExtents: {
        x: halfExtents,
        y: halfExtents,
        z: halfExtents,
      },
      sprite: false,
    })
  
    color.set(randomColor())
  
    mesh.setColorAt(i, color)
  }

  mesh.instanceColor!.needsUpdate = true

  return { bodies, mesh }
}







