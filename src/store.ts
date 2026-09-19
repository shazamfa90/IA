export type FieldType = 'number' | 'text' | 'textarea' | 'check';
export type Field = { id: string; label: string; type: FieldType };
export type Section = { id: string; title: string; fields: Field[] };
export type RollDef = { id: string; label: string; notation: string };

/** O "tipo de sessão": o mestre define seções, campos e botões de rolagem. */
export type Template = { id: string; name: string; sections: Section[]; rolls: RollDef[] };

export type Character = {
  id: string;
  templateId: string;
  name: string;
  avatarUrl: string;
  values: Record<string, string | boolean>;
};

export type State = {
  templates: Template[];
  characters: Character[];
  currentId: string | null;
  webhookUrl: string;
};

export const uid = () => Math.random().toString(36).slice(2, 10);

/** Vira o rótulo em id usável numa notação: "Força de Vontade" -> "forcadevontade". */
export function slug(label: string, taken: string[] = []): string {
  const base =
    label
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 24) || 'campo';
  if (!taken.includes(base)) return base;
  let n = 2;
  while (taken.includes(`${base}${n}`)) n++;
  return `${base}${n}`;
}

export const EXAMPLE = (): Template => ({
  id: uid(),
  name: 'Exemplo d20',
  sections: [
    {
      id: uid(),
      title: 'Atributos',
      fields: [
        { id: 'forca', label: 'Força', type: 'number' },
        { id: 'destreza', label: 'Destreza', type: 'number' },
        { id: 'constituicao', label: 'Constituição', type: 'number' },
      ],
    },
    {
      id: uid(),
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
    { id: uid(), label: 'Teste de Força', notation: 'd20+@forca' },
    { id: uid(), label: 'Teste de Destreza', notation: 'd20+@destreza' },
    { id: uid(), label: 'Iniciativa', notation: 'd20+@destreza' },
    { id: uid(), label: 'Rolar atributos', notation: '6#4d6kh3' },
  ],
});

export function newCharacter(templateId: string, name = ''): Character {
  return { id: uid(), templateId, name, avatarUrl: '', values: {} };
}

// --- compartilhamento de template por link -------------------------------
// base64url sobre UTF-8: btoa sozinho quebra em "Força", "Inspiração".

const toB64 = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromB64 = (s: string) => {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};

/** ponytail: template vai inteiro na URL. Trocar por link curto de servidor se passar de ~30KB. */
export const encodeTemplate = (t: Template) => toB64(JSON.stringify(t));

export function decodeTemplate(code: string): Template {
  const t = JSON.parse(fromB64(code)) as Template;
  if (!t?.name || !Array.isArray(t.sections) || !Array.isArray(t.rolls)) {
    throw new Error('Link de ficha inválido.');
  }
  return { ...t, id: uid() }; // id novo: não sobrescreve um sistema já salvo
}

// --- persistência ---------------------------------------------------------

const KEY = 'ficha-rpg';

function blank(): State {
  const t = EXAMPLE();
  const c = newCharacter(t.id);
  return { templates: [t], characters: [c], currentId: c.id, webhookUrl: '' };
}

/** Formato antigo: um template e um personagem soltos na raiz. */
function migrate(old: any): State {
  const t: Template = {
    id: uid(),
    name: old.template?.name ?? 'Importado',
    sections: (old.template?.sections ?? []).map((s: any) => ({ id: uid(), ...s })),
    rolls: (old.template?.rolls ?? []).map((r: any) => ({ id: uid(), ...r })),
  };
  const c: Character = { id: uid(), templateId: t.id, values: {}, avatarUrl: '', name: '', ...old.character };
  return { templates: [t], characters: [c], currentId: c.id, webhookUrl: old.webhookUrl ?? '' };
}

export function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    const parsed = JSON.parse(raw);
    if (parsed.template) return migrate(parsed);
    if (!Array.isArray(parsed.templates) || !parsed.templates.length) return blank();
    return parsed as State;
  } catch {
    return blank();
  }
}

export const save = (s: State) => localStorage.setItem(KEY, JSON.stringify(s));
