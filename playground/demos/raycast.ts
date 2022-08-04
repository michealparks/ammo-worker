import * as THREE from 'three'
import { scene } from 'three-kit'
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

  for (let i = 0; i < 10; i += 1) {
    const size = 15
    const transform = new Float32Array([
      (Math.random() * size) - size / 2,
      2,
      (Math.random() * size) - size / 2,
      0, 0, 0, 1
    ])
  
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
      transform,
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

  const cb = (ammo) => {
    document.addEventListener('keydown', () => {

    })

    document.addEventListener('keyup', () => {

    })
  }

  return { bodies, mesh, cb }
}







