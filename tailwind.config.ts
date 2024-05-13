import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}',
  './node_modules/preline/preline.js',
  "./node_modules/flowbite-react/**/*.js"

  ],
  theme: {
    extend: {},
  },
  plugins: [ require('preline/plugin'),    require("flowbite/plugin")],
} satisfies Config

