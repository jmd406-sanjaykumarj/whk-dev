import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import image from '@rollup/plugin-image';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import typescript from '@rollup/plugin-typescript';
import { babel } from '@rollup/plugin-babel';
import dts from 'rollup-plugin-dts';


/**
 * Removes "use client" directives from Radix UI packages.
 */
const stripUseClientPlugin = () => ({
  name: "strip-use-client-directive",
  transform(code, id) {
    if (id.includes("@radix-ui") && code.startsWith('"use client";')) {
      return {
        code: code.replace('"use client";', ""),
        map: null,
      };
    }
  },
});

/** JS + CSS Build */
const jsBuild = {
  input: {
    components: 'src/components/index.tsx',
    layouts: 'src/layouts/index.tsx',
    context: 'src/context/index.tsx',
    hooks: 'src/hooks/index.tsx',
  },
  output: {
    format: 'esm',
    dir: 'dist',
    preserveModules: true,
    preserveModulesRoot: 'src',
    sourcemap: true
  },
  external: [/@babel\/runtime/, 'react', 'react-dom'],
  plugins: [
    peerDepsExternal(),
    resolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.svg']
    }),
    commonjs(),
     stripUseClientPlugin(),
    json(),
    image(),
    postcss({
      modules: false,
      minimize: true,
      extract: true
    }),
    typescript({
      tsconfig: './tsconfig.json',
      exclude: ['**/*.stories.tsx', '**/*.test.tsx']
    }),
    babel({
      babelHelpers: 'runtime',
      extensions: ['.ts', '.tsx'],
      presets: [
        ['@babel/preset-env', { modules: false }],
        '@babel/preset-react',
        '@babel/preset-typescript'
      ],
      plugins: [
        ['@babel/plugin-transform-runtime', {
          regenerator: true,
          useESModules: true
        }]
      ]
    })
  ]
};

/** Type Declarations Build */
const dtsBuild = {
  input: {
    components: 'src/components/index.tsx',
    layouts: 'src/layouts/index.tsx'
  },
  output: {
    dir: 'dist',
    format: 'esm',
    preserveModules: true,
    preserveModulesRoot: 'src'
  },
  external: ['react', 'react-dom', 'class-variance-authority'],
  plugins: [dts()]
};

export default [jsBuild, dtsBuild];
