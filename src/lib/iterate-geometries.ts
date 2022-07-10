import {
  Matrix4,
  Vector3,
} from 'three'

const inverse = new Matrix4()
const scale = new Vector3()
const transform = new Matrix4()

interface Options {
  includeInvisible: boolean
}

export const iterateGeometries = (root: THREE.Mesh, options?: Options) => {
  inverse.copy(root.matrixWorld).invert()
  scale.setFromMatrixScale(root.matrixWorld)

  const vertices = []
  const matrices = []
  const indexes = []

  root.traverse((object) => {
    if (!(object as THREE.Mesh).isMesh) return
    if (object.name === 'Sky') return
    if (!object.visible && !options?.includeInvisible) return

    const mesh = object as THREE.Mesh

    if (mesh === root) {
      transform.identity();
    } else {
      mesh.updateWorldMatrix(true, true);
      transform.multiplyMatrices(inverse, mesh.matrixWorld);
    }

    // todo: might want to return null xform if this is the root so that callers can avoid multiplying
    // things by the identity matrix
    vertices.push(mesh.geometry.attributes.position.array)
    matrices.push(transform.elements)
    indexes.push(mesh.geometry.index ? mesh.geometry.index.array : null)
  })
}
