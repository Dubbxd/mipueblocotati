// Ambient module shims — this file must have NO top-level imports/exports
// so TypeScript treats it as a script file and the declarations are globally ambient.

// vue-iconsax ships without type declarations
declare module 'vue-iconsax'
declare module 'vue-iconsax/dist/components/icons/*.vue.js'
