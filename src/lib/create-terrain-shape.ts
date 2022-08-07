// import type { Terrain, AmmoLib } from '../types'
// import * as constants from '../constants'

// export const createTerrainShape = (ammo: AmmoLib, terrain: Terrain) => {
//   const {
//     width,
//     depth,
//     minHeight,
//     maxHeight,
//     widthExtents,
//     depthExtents,
//     heightData,
//   } = terrain

//   // This parameter is not really used, since we are using PHY_FLOAT height data type and hence it is ignored
//   const heightScale = 1

//   // Up axis = 0 for X, 1 for Y, 2 for Z. Normally 1 = Y is used.
//   const upAxis = 1

//   // hdt, height data type. "PHY_FLOAT" is used. Possible values are "PHY_FLOAT", "PHY_UCHAR", "PHY_SHORT"
//   const hdt = 'PHY_FLOAT'

//   // Set this to your needs (inverts the triangles)
//   const flipQuadEdges = false

//   // Creates height data buffer in Ammo heap
//   const ammoHeightData = ammo._malloc(4 * width * depth)

//   // Copy the javascript height data array to the Ammo one.
//   let p = 0
//   let p2 = 0

//   for (let j = 0; j < depth; j += 1) {
//     for (let i = 0; i < terrain.width; i += 1) {
//       // write 32-bit float data to memory
//       ammo.HEAPF32[ ammoHeightData + p2 >> 2 ] = heightData[p]

//       p += 1

//       // 4 bytes/float
//       p2 += 4
//     }
//   }

//   // Creates the heightfield physics shape
//   const heightFieldShape = new ammo.btHeightfieldTerrainShape(
//     width,
//     depth,
//     ammoHeightData,
//     heightScale,
//     minHeight,
//     maxHeight,
//     upAxis,
//     hdt,
//     flipQuadEdges
//   );

//   // Set horizontal scale
//   const scaleX = widthExtents / (width - 1)
//   const scaleZ = depthExtents / (depth - 1)
//   heightFieldShape.setLocalScaling(new ammo.btVector3(scaleX, 1, scaleZ))
//   heightFieldShape.setMargin(constants.DEFAULT_MARGIN)

//   return heightFieldShape
// }
