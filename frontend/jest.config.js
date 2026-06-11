const nextJest = require('next/jest')

const createJestConfig = nextJest({
    // chemin vers l'app Next.js, pour charger next.config.js et les .env
    dir: './',
})

// config Jest "custom" — pas besoin de jsdom ici, on teste des fonctions pures
const customJestConfig = {
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
}

module.exports = createJestConfig(customJestConfig)
