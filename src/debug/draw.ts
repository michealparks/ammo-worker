/**
 * largely inspired by
 * https://github.com/InfiniteLee/ammo-debug-drawer
 */

export const AmmoDebugConstants = {
  NoDebug: 0,
  DrawWireframe: 1,
  DrawAabb: 2,
  DrawFeaturesText: 4,
  DrawContactPoints: 8,
  NoDeactivation: 16,
  NoHelpText: 32,
  DrawText: 64,
  ProfileTimings: 128,
  EnableSatComparison: 256,
  DisableBulletLCP: 512,
  EnableCCD: 1024,
  DrawConstraints: 1 << 11, //2048
  DrawConstraintLimits: 1 << 12, //4096
  FastWireframe: 1 << 13, //8192
  DrawNormals: 1 << 14, //16384
  MAX_DEBUG_DRAW_MODE: 0xffffffff
}

const setXYZ = (
  array: Float32Array,
  index: number, x: number, y: number, z: number
) => {
  index *= 3
  array[index + 0] = x
  array[index + 1] = y
  array[index + 2] = z
}

const buffersize = Number(import.meta.env.AMMO_DEBUG_DRAW_BUFFER_SIZE)

/**
 * An implementation of the btIDebugDraw interface in Ammo.js, for debug rendering of Ammo shapes
 * @class AmmoDebugDrawer
 * @param {Uint32Array} indexArray
 * @param {Float32Array} verticessArray
 * @param {Float32Array} colorsArray
 * @param {Ammo.btCollisionWorld} world
 * @param {object} [options]
 */
export class AmmoDebugDrawer {
  index = 0
  enabled = false
  warnedOnce = false
  ammo: typeof Ammo
  world: Ammo.btCollisionWorld
  debugDrawer: Ammo.DebugDrawer
  verticesArray = new Float32Array(buffersize)
  colorsArray = new Float32Array(buffersize)
  debugDrawMode = AmmoDebugConstants.DrawWireframe

  constructor(
    ammo: typeof Ammo,
    world: Ammo.btCollisionWorld
  ) {
    this.ammo = ammo
    this.world = world
    this.debugDrawer = new ammo.DebugDrawer()
    this.world.setDebugDrawer(this.debugDrawer)
  }

  enable () {
    this.enabled = true
  }

  disable () {
    this.enabled = false
  }

  update () {
    if (!this.enabled) {
      return
    }

    this.index = 0
    this.world.debugDrawWorld()
  }

  drawLine (from: number, to: number, color: number) {
    const heap = this.ammo.HEAPF32
    const r = heap[(color + 0) / 4]
    const g = heap[(color + 4) / 4]
    const b = heap[(color + 8) / 4]
  
    const fromX = heap[(from + 0) / 4]
    const fromY = heap[(from + 4) / 4]
    const fromZ = heap[(from + 8) / 4]
    setXYZ(this.verticesArray, this.index, fromX, fromY, fromZ)
    setXYZ(this.colorsArray, this.index++, r, g, b)
  
    const toX = heap[(to + 0) / 4]
    const toY = heap[(to + 4) / 4]
    const toZ = heap[(to + 8) / 4]
    setXYZ(this.verticesArray, this.index, toX, toY, toZ)
    setXYZ(this.colorsArray, this.index++, r, g, b)
  }

  drawContactPoint (pointOnB: number, normalOnB: number, distance: number, lifeTime: number, color: number) {
    const heap = this.ammo.HEAPF32
    const r = heap[(color + 0) / 4]
    const g = heap[(color + 4) / 4]
    const b = heap[(color + 8) / 4]
  
    const x = heap[(pointOnB + 0) / 4]
    const y = heap[(pointOnB + 4) / 4]
    const z = heap[(pointOnB + 8) / 4]
    setXYZ(this.verticesArray, this.index, x, y, z)
    setXYZ(this.colorsArray, this.index++, r, g, b)
  
    const dx = heap[(normalOnB + 0) / 4] * distance
    const dy = heap[(normalOnB + 4) / 4] * distance
    const dz = heap[(normalOnB + 8) / 4] * distance
    setXYZ(this.verticesArray, this.index, x + dx, y + dy, z + dz)
    setXYZ(this.colorsArray, this.index++, r, g, b)
  }

  reportErrorWarning (warningString: string) {
    if (this.ammo.hasOwnProperty("UTF8ToString")) {
      console.warn(this.ammo.UTF8ToString(warningString))
    } else if (!this.warnedOnce) {
      this.warnedOnce = true
      console.warn("Cannot print warningString, please export UTF8ToString from Ammo.js in make.py")
    }
  }

  setDebugMode (debugMode: number) {
    this.debugDrawMode = debugMode
  }

  getDebugMode () {
    return this.debugDrawMode
  }
}
