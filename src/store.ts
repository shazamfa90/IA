export type FieldType = 'number' | 'text' | 'textarea' | 'check';
export type Field = { id: string; label: string; type: FieldType };
export type Section = { id: string; title: string; fields: Field[] };
export type RollDef = { id: string; label: string; notation: string };

/** O "tipo de sessão": o mestre define seções, campos e botões de rolagem. */
export type Template = { id: string; name: string; sections: Section[]; rolls: RollDef[] };

export type Character = {
  id: string;
  profileId: string;
  templateId: string;
  name: string;
  avatarUrl: string;
  values: Record<string, string | boolean>;
};

export const THEMES = ['escuro', 'claro', 'pergaminho', 'sangue', 'floresta'] as const;
export type Theme = (typeof THEMES)[number];

/** Perfil local: separa as fichas e a aparência de cada pessoa no aparelho. */
export type Profile = { id: string; name: string; theme: Theme; accent: string };

export type State = {
  profiles: Profile[];
  currentProfileId: string;
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

export const newProfile = (name = 'Jogador'): Profile => ({
  id: uid(),
  name,
  theme: 'escuro',
  accent: '#b08cff',
});

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

export function newCharacter(templateId: string, profileId: string, name = ''): Character {
  return { id: uid(), profileId, templateId, name, avatarUrl: '', values: {} };
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

/**
 * Canal padrão da mesa, injetado no build a partir de VITE_WEBHOOK_URL.
 * Fica fora do repositório: num app estático o valor acaba no bundle de
 * qualquer jeito, mas assim dá pra trocar sem reescrever o histórico do git.
 */
export const DEFAULT_WEBHOOK = import.meta.env?.VITE_WEBHOOK_URL ?? '';

function blank(): State {
  const p = newProfile();
  const t = EXAMPLE();
  const c = newCharacter(t.id, p.id);
  return {
    profiles: [p],
    currentProfileId: p.id,
    templates: [t],
    characters: [c],
    currentId: c.id,
    webhookUrl: DEFAULT_WEBHOOK,
  };
}

/** Formato antigo: um template e um personagem soltos na raiz. */
function migrateV1(old: any): State {
  const p = newProfile();
  const t: Template = {
    id: uid(),
    name: old.template?.name ?? 'Importado',
    sections: (old.template?.sections ?? []).map((s: any) => ({ id: uid(), ...s })),
    rolls: (old.template?.rolls ?? []).map((r: any) => ({ id: uid(), ...r })),
  };
  const c: Character = {
    id: uid(),
    profileId: p.id,
    templateId: t.id,
    values: {},
    avatarUrl: '',
    name: '',
    ...old.character,
  };
  return {
    profiles: [p],
    currentProfileId: p.id,
    templates: [t],
    characters: [{ ...c, profileId: p.id, templateId: t.id }],
    currentId: c.id,
    webhookUrl: old.webhookUrl || DEFAULT_WEBHOOK,
  };
}

/** Estado sem perfis (antes de existirem): adota tudo num perfil só. */
function adoptIntoProfile(s: any): State {
  const p = s.profiles?.[0] ?? newProfile();
  return {
    ...s,
    profiles: [p],
    currentProfileId: p.id,
    characters: (s.characters ?? []).map((c: Character) => ({ ...c, profileId: c.profileId || p.id })),
    webhookUrl: s.webhookUrl || DEFAULT_WEBHOOK,
  };
}

export function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    const parsed = JSON.parse(raw);
    if (parsed.template) return migrateV1(parsed);
    if (!Array.isArray(parsed.templates) || !parsed.templates.length) return blank();
    if (!Array.isArray(parsed.profiles) || !parsed.profiles.length) return adoptIntoProfile(parsed);
    // Perfil apagado por outra aba: cai no primeiro em vez de abrir vazio.
    const current = parsed.profiles.find((p: Profile) => p.id === parsed.currentProfileId);
    return { ...parsed, currentProfileId: current?.id ?? parsed.profiles[0].id } as State;
  } catch {
    return blank();
  }
}

export const save = (s: State) => localStorage.setItem(KEY, JSON.stringify(s));
