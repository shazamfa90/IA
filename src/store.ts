export type Field = { id: string; label: string; type: 'number' | 'text' | 'textarea' | 'check' };
export type Section = { title: string; fields: Field[] };
export type RollDef = { label: string; notation: string };

/** O "tipo de ficha/sessão": o mestre define seções, campos e botões de rolagem. */
export type Template = { name: string; sections: Section[]; rolls: RollDef[] };

export type State = {
  template: Template;
  character: { name: string; avatarUrl: string; values: Record<string, string | boolean> };
  webhookUrl: string;
};

export const EXAMPLE: Template = {
  name: 'Exemplo d20',
  sections: [
    {
      title: 'Atributos',
      fields: [
        { id: 'forca', label: 'Força', type: 'number' },
        { id: 'destreza', label: 'Destreza', type: 'number' },
        { id: 'constituicao', label: 'Constituição', type: 'number' },
      ],
    },
    {
      title: 'Estado',
      fields: [
        { id: 'pv', label: 'Pontos de vida', type: 'number' },
        { id: 'ca', label: 'Classe de armadura', type: 'number' },
        { id: 'inspiracao', label: 'Inspiração', type: 'check' },
        { id: 'notas', label: 'Anotações', type: 'textarea' },
      ],
    },
  ],
  rolls: [
    { label: 'Teste de Força', notation: 'd20+@forca' },
    { label: 'Teste de Destreza', notation: 'd20+@destreza' },
    { label: 'Iniciativa', notation: 'd20+@destreza' },
    { label: 'Rolar atributos', notation: '6#4d6kh3' },
  ],
};

const KEY = 'ficha-rpg';

const BLANK: State = {
  template: EXAMPLE,
  character: { name: '', avatarUrl: '', values: {} },
  webhookUrl: '',
};

export function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...BLANK, ...JSON.parse(raw) } : BLANK;
  } catch {
    return BLANK;
  }
}

export function save(state: State): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}
