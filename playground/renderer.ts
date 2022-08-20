import * as THREE from 'three'
import { camera, scene, lights } from 'three-kit'

const fog = new THREE.Fog('lightblue')
fog.far = 1000
scene.fog = fog

camera.position.set(10, 15, 25)
camera.lookAt(0, 0, 0)

scene.background = new THREE.Color('lightblue');

const ambientLight = lights.createAmbient(undefined, 0.5)
scene.add(ambientLight)

const directionalLight = lights.createDirectional(undefined, 1.5)
scene.add(directionalLight)

directionalLight.position.set(0.5, 20, 0.5)
directionalLight.shadow.camera.left = -20
directionalLight.shadow.camera.right = 20
directionalLight.shadow.camera.top = 20
directionalLight.shadow.camera.bottom = -20
directionalLight.shadow.camera.far = 25
