/// <reference types="vite/client" />

declare module "*.xhs?raw" {
  const content: string;
  export default content;
}
