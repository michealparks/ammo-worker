import { ammo } from '../../src/main'

export const resetPositionOnCollisions = () => {
  ammo.on('collisions', (data) => {
    const { triggerEnter } = data

    let resetIds: number[] = []
  
    if (triggerEnter.length > 0) {
      for (let i = 0; i < triggerEnter.length; i += 1) {
        const [, ids] = triggerEnter[i]
  
        for (let j = 0; j < ids.length; j += 1) {
          resetIds.push(ids[j])
        }
      }

      const transforms = new Float32Array(resetIds.length * 8) 
  
      for (let i = 0, j = 0, l = resetIds.length; j < l; j += 1, i += 8) {
        transforms[i + 0] = resetIds[j]
        transforms[i + 1] = 0
        transforms[i + 2] = Math.random() * 10 + 30
        transforms[i + 3] = 0
        transforms[i + 4] = Math.random() - 0.5
        transforms[i + 5] = Math.random() - 0.5
        transforms[i + 6] = Math.random() - 0.5
        transforms[i + 7] = 1
      }

      ammo.setTransforms(transforms)
    }
  })
}