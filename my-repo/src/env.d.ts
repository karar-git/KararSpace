/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_API_URL: string;
  readonly BASE_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
