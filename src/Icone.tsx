/** Ícones de traço, desenhados aqui: um <path> cada, sem biblioteca. */
const P = {
  ficha: 'M7 3h7l4 4v14H7zM14 3v4h4M10 11h5M10 15h5',
  personagens: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 6.5M18.5 14a6.5 6.5 0 0 1 3 6',
  sistemas: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5',
  musica: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  livro: 'M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5c-3.5-.5-6.5 0-8.5 1.5zM12 6.5v13',
  ajustes: 'M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4',
  sessao: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 21a7.5 7.5 0 0 1 15 0',
  mestre: 'M3 19h18M4 19L3 8l5 4 4-7 4 7 5-4-1 11',
  player: 'M12 2.5l8.5 5v9L12 21.5l-8.5-5v-9zM12 7.5l4.5 8h-9z',
} as const;

export default function Icone({ nome }: { nome: keyof typeof P }) {
  return (
    <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d={P[nome]} />
    </svg>
  );
}
