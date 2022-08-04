import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { ammo } from '../src/main'
import { camera, renderer, scene, lights } from 'three-kit'

let physicsDt = -1

ammo.on('tick', ({ dt }) => {
  physicsDt = dt
})

const fog = new THREE.Fog('lightblue')
fog.far = 100
scene.fog = fog

camera.near = 0.1
camera.far = 300
camera.position.set(10, 15, 25)
camera.lookAt(0, 0, 0)

scene.background = new THREE.Color('lightblue');

const controls = new OrbitControls(camera, renderer.domElement)
controls.dampingFactor = 1

const ambientLight = lights.createAmbient()
ambientLight.intensity = 0.2
scene.add(ambientLight)

const directionalLight = lights.createDirectional()
directionalLight.intensity = 1.5
directionalLight.castShadow = true
directionalLight.shadow.mapSize.width = 2048
directionalLight.shadow.mapSize.height = 2048
scene.add(directionalLight)
directionalLight.position.set(0.5, 20, 0.5)

const shadowmapSize = 2048
directionalLight.shadow.mapSize.x = shadowmapSize
directionalLight.shadow.mapSize.y = shadowmapSize
directionalLight.shadow.camera.left = -20
directionalLight.shadow.camera.right = 20
directionalLight.shadow.camera.top = 20
directionalLight.shadow.camera.bottom = -20
directionalLight.shadow.camera.far = 25
