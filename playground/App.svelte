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

<div class='absolute bottom-0 left-0 m-3 bg-white px-3 py-2 max-h-[30%] w-[20%] overflow-y-auto rounded shadow-lg'>
  {#each collisions as [id, others]}
    <p class='m-0 text-xs'>
      id: {id}, others:
      {#each others as other}
        {other}, 
      {/each}
    </p>
  {/each}
</div>

<div class='absolute bottom-0 right-0 m-3 bg-white rounded shadow-lg px-3 py-2 text-xs'>
  Press "i" to give random impulses
</div>