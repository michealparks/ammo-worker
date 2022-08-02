import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { ammo } from '../src/main'
import { softShadows } from '@react-three/drei'
import { camera, renderer, scene, setAnimationLoop } from 'three-kit'
import * as debug from 'three-kit/debug'

// softShadows({
//   frustum: 1.75,
//   size: 0.005,
//   near: 2.5,
//   samples: 30,
//   rings: 11, // Rings (default: 11) must be a int
// })

let physicsDt = -1

ammo.on('tick', ({ dt }) => {
  physicsDt = dt
})

setInterval(() => {
  physicsPanel.update(physicsDt, 16);
}, 500)

// camera.fov = 50
camera.near = 0.1
camera.far = 500
camera.position.set(20, 20, 40)
camera.lookAt(0, 0, 0)

scene.background = new THREE.Color('lightblue');

const controls = new OrbitControls(camera, renderer.domElement)
controls.dampingFactor = 1

const stats = Stats()
document.body.append(stats.dom)

export const physicsPanel = Stats.Panel("FPS (Physics)", "#f8f", "#212")
stats.addPanel(physicsPanel)

const ambientLight = new THREE.AmbientLight()
ambientLight.intensity = 0.3
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight()
directionalLight.intensity = 1.5
directionalLight.castShadow = true
scene.add(directionalLight)
directionalLight.position.set(0.5, 5, 0.5)
console.log(directionalLight.shadow.camera.left)

const shadowmapSize = 512
directionalLight.shadow.mapSize.x = shadowmapSize
directionalLight.shadow.mapSize.y = shadowmapSize
directionalLight.shadow.camera.left = -20
directionalLight.shadow.camera.right = 20
directionalLight.shadow.camera.top = 20
directionalLight.shadow.camera.bottom = -20

setAnimationLoop(() => {
  renderer.render(scene, camera)
  stats.update()
  debug.update()
})
