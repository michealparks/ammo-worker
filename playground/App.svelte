<script lang='ts'>

const handleInput = (event: Event) => {
  const { value } = event.currentTarget as HTMLSelectElement

  window.localStorage.setItem('demo', value)
  window.location.reload()
}

</script>

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
