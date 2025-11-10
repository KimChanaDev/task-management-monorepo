/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
  safelist: [
    {
      pattern: /(bg|text|border)-(gray|indigo|blue|green|yellow|red|purple|pink)-(50|100|200|300|400|500|600|700|800|900)/,
    },
  ],
}
