// src/global.d.ts
export {}

declare global {
  interface GlobalThis {
    _io: typeof io
  }
}
