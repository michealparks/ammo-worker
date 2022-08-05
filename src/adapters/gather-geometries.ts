import * as THREE from 'three'

const inverse = new THREE.Matrix4()
const scale = new THREE.Vector3()

export const gatherGeometries = (root: THREE.Object3D, options: {
  includeInvisible?: boolean
} = {}) => {
  inverse.copy(root.matrixWorld).invert()
  scale.setFromMatrixScale(root.matrixWorld)

  const geometries: Float32Array[] = []
  const matrices: Float32Array[] = []

  let indexes: (Float32Array | null)[] = []

  root.traverse((object3d: THREE.Object3D) => {
    const transform = new THREE.Matrix4()

    if (
      (object3d as THREE.Mesh).isMesh &&
      object3d.name !== 'Sky' &&
      (options.includeInvisible || object3d.visible)
    ) {
      const mesh = object3d as THREE.Mesh

      if (mesh === root) {
        transform.identity()
      } else {
        mesh.updateWorldMatrix(true, true)
        transform.multiplyMatrices(inverse, mesh.matrixWorld)
      }
      // todo: might want to return null xform if this is the root so that callers can avoid multiplying
      // things by the identity matrix
      geometries.push(new Float32Array(mesh.geometry.attributes.position.array))
      matrices.push(new Float32Array(transform.elements))
      indexes.push(mesh.geometry.index ? new Float32Array(mesh.geometry.index.array) : null)
    }
  })

  return {
    geometries,
    matrices,
    indexes,
    scale: { x: scale.x, y: scale.y, z: scale.z }
  }
}
