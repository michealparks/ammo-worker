import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  100
)
camera.position.set(7, 10, 20)
camera.lookAt(0, 0, 0)

export const scene = new THREE.Scene()
scene.background = new THREE.Color( 0x666666 );

const dpi = window.devicePixelRatio
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth * dpi, window.innerHeight * dpi)
document.body.appendChild(renderer.domElement)
renderer.domElement.style.width = '100vw'
renderer.domElement.style.height = '100vh'
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.outputEncoding = THREE.sRGBEncoding
renderer.physicallyCorrectLights = true
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

const stats = new Stats()
document.body.append(stats.dom)

const ambientLight = new THREE.AmbientLight()
ambientLight.intensity = 0.2
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight()
directionalLight.intensity = 2
directionalLight.castShadow = true
scene.add(directionalLight)
directionalLight.position.set(0.5, 1, 0.5)

{
  const geometry = new THREE.PlaneBufferGeometry(100, 100, 1, 1)
  const material = new THREE.MeshStandardMaterial({ color: 0xCCCCCC })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotateX(-Math.PI / 2)
  mesh.updateMatrix()
  mesh.matrixAutoUpdate = false
  mesh.receiveShadow = true
  scene.add(mesh)
}

export const animate = () => {
  window.requestAnimationFrame(animate)
  renderer.render(scene, camera)
  stats.update()
}
