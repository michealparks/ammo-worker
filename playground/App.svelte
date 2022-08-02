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

const handleInput = (event: Event) => {
  const { value } = event.currentTarget as HTMLSelectElement

  window.localStorage.setItem('demo', value)
  window.location.reload()
}

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

<div class='absolute bottom-12 right-0 m-3 bg-white rounded shadow-lg text-xs px-3'>
  <select value={localStorage.getItem('demo')} on:input={handleInput} class='py-2 outline-none w-32'>
    <option>boxes</option>
    <option>capsules</option>
    <option>meshes</option>
    <option>spheres</option>
    <option>translation</option>
  </select>
</div>