/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAPBOX_TOKEN: string;
  // You can add other environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}