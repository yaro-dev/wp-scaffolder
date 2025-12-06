module.exports = {
  plugins: {
    'postcss-nested': {}, // Permite anidación tipo SASS: .clase { .hijo {} }
    'autoprefixer': {},
    // 'tailwindcss': {}, // Descomentar si decides inyectar Tailwind también
  },
}