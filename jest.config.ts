import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Provee la ruta a tu aplicación Next.js para cargar las configuraciones locales
  dir: './',
})

// Configuraciones personalizadas para pasar a Jest
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
}

// Se exporta así para asegurar que next/jest cargue todo de forma asincrónica
export default createJestConfig(config)