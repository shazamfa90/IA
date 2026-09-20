interface ImportMetaEnv {
  /** Canal da mesa, onde saem as rolagens. Ver README, seção "Canal padrão". */
  readonly VITE_WEBHOOK_URL?: string;
  /** Canal só do mestre, onde ficam as fichas vivas. Ver README, seção "Ficha viva". */
  readonly VITE_GM_WEBHOOK_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
