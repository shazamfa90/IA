interface ImportMetaEnv {
  /** Webhook do canal da mesa, definido no build. Ver README, seção "Canal padrão". */
  readonly VITE_WEBHOOK_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
