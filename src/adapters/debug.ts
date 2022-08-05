import * as THREE from 'three'
import { scene } from 'three-kit'

const DefaultBufferSize = 3 * 1_000_000

// Debug variables
let debugGeometry;
let debugDrawer;

export const init = () => {
  const debugVertices = new Float32Array(DefaultBufferSize)
  const debugColors = new Float32Array(DefaultBufferSize)
  debugGeometry = new THREE.BufferGeometry()

  const positionAttribute = new THREE.BufferAttribute(debugVertices, 3)
  positionAttribute.usage = THREE.DynamicDrawUsage
  debugGeometry.setAttribute('position', positionAttribute)

  const colorAttribute = new THREE.BufferAttribute(debugColors, 3)
  colorAttribute.usage = THREE.DynamicDrawUsage
  debugGeometry.setAttribute('color', colorAttribute)

  let debugMaterial = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors })
  let debugMesh = new THREE.LineSegments(debugGeometry, debugMaterial)
  debugMesh.frustumCulled = false
  
  scene.add(debugMesh)
  debugDrawer = new AmmoDebugDrawer(null, debugVertices, debugColors, physicsWorld)
  debugDrawer.enable()

  setInterval(() => {
    let mode = (debugDrawer.getDebugMode() + 1) % 3
    debugDrawer.setDebugMode(mode)
  }, 1000)
}
