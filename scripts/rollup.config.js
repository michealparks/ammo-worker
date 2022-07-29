import alias from '@rollup/plugin-alias'
import replace from '@rollup/plugin-replace'
import copy from 'rollup-plugin-copy'
import filesize from 'rollup-plugin-filesize'

const { DEV, PROD } = process.env

export default {
  context: 'exports',
  input: 'node_modules/ammo.js/builds/ammo.wasm.js',
  output: [{
    file: 'src/ammo.js',
    format: 'es',
    banner: 'const exports={};',
    footer: 'export default exports.Ammo;'
  }],
  plugins: [
    replace({
      'this.Ammo': 'exports.Ammo'
    }),
    alias({
      entries: {
        fs: require.resolve('./noop'),
        path: require.resolve('./noop')
      }
    }),
    copy({
      targets: [
        {
          src: 'node_modules/ammo.js/builds/ammo.wasm.wasm',
          dest: './src',
        }
      ]
    }),
    PROD && filesize()
  ]
}
