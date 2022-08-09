import * as THREE from 'three'
import { scene } from 'three-kit'

export const init = () => {
  const debugGeometry = new THREE.BufferGeometry()

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
}
