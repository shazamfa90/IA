import { useEffect, useState } from 'react';

/**
 * Foto de personagem ou capa de sistema. Sem imagem, ou se a URL falhar,
 * desenha as iniciais — um link morto nunca deixa ícone de imagem quebrada.
 */
export default function Foto({ src, nome, grande }: { src?: string; nome: string; grande?: boolean }) {
  const [quebrou, setQuebrou] = useState(false);
  useEffect(() => setQuebrou(false), [src]); // URL nova merece nova tentativa

  const cls = grande ? 'capa grande' : 'capa';
  const iniciais =
    nome.trim().split(/\s+/).slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase() || '?';

  if (!src || quebrou) return <div className={cls}>{iniciais}</div>;
  return (
    <img className={cls} src={src} alt="" referrerPolicy="no-referrer" onError={() => setQuebrou(true)} />
  );
}
