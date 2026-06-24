// Ambient module declaration for GLSL imports handled by vite-plugin-glsl.
// The default export is the inlined GLSL source string.
declare module '*.glsl' {
  const source: string;
  export default source;
}