<script lang='ts'>

import { ammo } from '../src/main'

let collisions: any[] = []

ammo.on('tick', ({ collisionStart }) => {
  if (collisionStart.length === 0) {
    return
  }

  for (let i = 0; i < collisionStart.length; i += 1) {
    collisions.unshift(collisionStart[i])
  }

  if (collisions.length > 30) {
    while (collisions.length > 30) collisions.pop()
  }

  collisions = collisions
})

</script>

<div class='absolute bottom-0 left-0 m-2 bg-white px-3 py-1 max-h-[30%] w-[30%] overflow-y-auto'>
  {#each collisions as [id, others]}
    <div>
      id: {id}, others:
      {#each others as other}
        {other}, 
      {/each}
    </div>
  {/each}
</div>
