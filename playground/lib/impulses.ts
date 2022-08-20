import { ammo } from '../../src/main'
import * as constants from '../constants'
import * as physics from '../../src/adapters/three'

export const giveRandomImpulsesOnKeyDown = () => {
  // Add event for random impulses
  document.addEventListener('keydown', (event) => {
    switch (event.key.toLowerCase()) {
    case 'i':
      const count = physics.id
      const magnitude = 20
      const impulses = new Float32Array(constants.NUM_MESHES * 4)

      for (let i = 0, j = 0; j < count; i += 4, j += 1) {
        impulses[i + 0] = j
        impulses[i + 1] = (Math.random() - 0.5) * magnitude
        impulses[i + 2] = (Math.random() - 0.5) * magnitude
        impulses[i + 3] = (Math.random() - 0.5) * magnitude
      }

      ammo.applyCentralImpulses(impulses)
      break
    case 'p':
      if (ammo.running) {
        ammo.pause()
      } else {
        ammo.run()
      }
    }
  })
}