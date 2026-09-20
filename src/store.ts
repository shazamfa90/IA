export type FieldType = 'number' | 'attr' | 'text' | 'textarea' | 'check';

/**
 * Como o sistema tira o modificador do valor do atributo. É regra de RPG, não
 * de app: em d20 um 12 vale +1, em outros sistemas o valor já é o modificador.
 */
export const MOD_RULES = {
  d20: { label: '(valor − 10) ÷ 2', calc: (v: number) => Math.floor((v - 10) / 2) },
  metade: { label: 'Metade do valor', calc: (v: number) => Math.floor(v / 2) },
  nenhum: { label: 'O valor é o modificador', calc: (v: number) => v },
} as const;
export type ModRule = keyof typeof MOD_RULES;

/** null quando o campo está vazio: aí não há modificador a mostrar. */
export function modifierOf(value: unknown, rule: ModRule = 'd20'): number | null {
  if (String(value ?? '').trim() === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return (MOD_RULES[rule] ?? MOD_RULES.d20).calc(n);
}

export const formatMod = (m: number) => (m > 0 ? `+${m}` : String(m));
export type Field = { id: string; label: string; type: FieldType };
export type Section = { id: string; title: string; fields: Field[] };
export type RollDef = {
  id: string;
  label: string;
  notation: string;
  /** Campos que recebem o resultado, em ordem: "@forca @destreza". Ex.: rolar atributos. */
  assign?: string;
};

/** O "tipo de sessão": o mestre define seções, campos e botões de rolagem. */
export type Template = {
  id: string;
  name: string;
  /** Imagem de capa (URL). Opcional: sem ela a lista mostra as iniciais do nome. */
  image?: string;
  /** Regra de modificador dos campos do tipo atributo. Padrão: d20. */
  modRule?: ModRule;
  /** Tema próprio do sistema. Enquanto uma ficha dele está aberta, vale este. */
  theme?: Theme;
  sections: Section[];
  rolls: RollDef[];
};

export type Character = {
  id: string;
  profileId: string;
  templateId: string;
  name: string;
  avatarUrl: string;
  values: Record<string, string | boolean>;
  /** Mensagem desta ficha no canal do mestre, reescrita a cada mudança. */
  messageId?: string;
};

export const THEMES = ['escuro', 'claro', 'pergaminho', 'sangue', 'floresta', 'nichirin'] as const;
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
  /** Canal só do mestre, onde as fichas vivem. Vazio = recurso desligado. */
  gmWebhookUrl: string;
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
  modRule: 'd20',
  sections: [
    {
      id: uid(),
      title: 'Atributos',
      fields: [
        { id: 'forca', label: 'Força', type: 'attr' },
        { id: 'destreza', label: 'Destreza', type: 'attr' },
        { id: 'constituicao', label: 'Constituição', type: 'attr' },
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
    { id: uid(), label: 'Rolar atributos', notation: '3#4d6kh3', assign: '@forca @destreza @constituicao' },
  ],
});

/**
 * Valores como a rolagem os enxerga.
 *
 * Num campo de atributo, `@forca` é o MODIFICADOR, não o atributo cheio: é o
 * que toda rolagem quer, e é o que o mestre escreve sem pensar em `d20+@forca`.
 * O atributo continua acessível como `@forca.valor`; `@forca.mod` é só um
 * apelido explícito do mesmo modificador.
 *
 * A ficha guarda o atributo. Esta conversão existe só na hora de rolar.
 */
export function withMods(t: Template, values: Character['values']): Character['values'] {
  const out: Character['values'] = { ...values };
  for (const f of t.sections.flatMap((s) => s.fields)) {
    if (f.type !== 'attr') continue;
    const m = modifierOf(values[f.id], t.modRule);
    const mod = m === null ? '0' : String(m);
    out[f.id] = mod;
    out[`${f.id}.mod`] = mod;
    out[`${f.id}.valor`] = String(values[f.id] ?? '');
  }
  return out;
}

export function newCharacter(templateId: string, profileId: string, name = ''): Character {
  return { id: uid(), profileId, templateId, name, avatarUrl: '', values: {} };
}

/**
 * Renomeia um campo e faz o `@id` acompanhar o rótulo.
 *
 * Renomear só é seguro porque leva junto quem aponta pro id antigo: as
 * notações das rolagens aqui, e os valores já preenchidos nas fichas em
 * `migrateValues`. Sem isso, renomear deixaria rolagem apontando pro nada e
 * apagaria o que o jogador digitou.
 */
export function renameField(t: Template, sectionId: string, fieldId: string, label: string) {
  const taken = t.sections.flatMap((s) => s.fields).filter((f) => f.id !== fieldId).map((f) => f.id);
  const novo = slug(label, taken);

  const sections = t.sections.map((s) =>
    s.id !== sectionId ? s : { ...s, fields: s.fields.map((f) => (f.id === fieldId ? { ...f, label, id: novo } : f)) },
  );
  if (novo === fieldId) return { template: { ...t, sections }, oldId: fieldId, newId: novo };

  // (?![\w-]) impede que @forca engula o começo de @forcadevontade.
  const ref = new RegExp(`@${fieldId}(?![\\w-])`, 'g');
  const rolls = t.rolls.map((r) => ({
    ...r,
    notation: r.notation.replace(ref, `@${novo}`),
    // o destino também aponta por @id: sem isto, renomear quebraria o preenchimento
    ...(r.assign ? { assign: r.assign.replace(ref, `@${novo}`) } : {}),
  }));
  return { template: { ...t, sections, rolls }, oldId: fieldId, newId: novo };
}

/** Campos de destino de uma rolagem, na ordem escrita: "@forca @destreza" -> ['forca','destreza']. */
export const parseAssign = (assign = ''): string[] => [...assign.matchAll(/@([\w-]+)/g)].map((m) => m[1]);

/** Quais destinos não existem no sistema — o editor avisa antes de a mesa usar. */
export const unknownTargets = (assign: string | undefined, t: Template): string[] => {
  const existem = new Set(t.sections.flatMap((s) => s.fields).map((f) => f.id));
  return parseAssign(assign).filter((id) => !existem.has(id));
};

/** Escreve os totais nos campos, em ordem. Sobra de um lado ou do outro é ignorada. */
export function applyRoll(
  values: Character['values'],
  ids: string[],
  totals: number[],
): Character['values'] {
  const next = { ...values };
  ids.forEach((id, i) => {
    if (i < totals.length) next[id] = String(totals[i]);
  });
  return next;
}

/** Destinos que já têm valor: sobrescrever sem avisar apagaria a ficha de alguém. */
export const filledTargets = (values: Character['values'], ids: string[]) =>
  ids.filter((id) => String(values[id] ?? '').trim() !== '');

/** Move o valor já preenchido para a nova chave, preservando a ordem dos campos. */
export function migrateValues(values: Character['values'], oldId: string, newId: string): Character['values'] {
  if (oldId === newId || !(oldId in values)) return values;
  return Object.fromEntries(Object.entries(values).map(([k, v]) => [k === oldId ? newId : k, v]));
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
export const DEFAULT_GM_WEBHOOK = import.meta.env?.VITE_GM_WEBHOOK_URL ?? '';

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
    gmWebhookUrl: DEFAULT_GM_WEBHOOK,
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
    gmWebhookUrl: DEFAULT_GM_WEBHOOK,
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
    gmWebhookUrl: s.gmWebhookUrl || DEFAULT_GM_WEBHOOK,
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
    return {
      ...parsed,
      currentProfileId: current?.id ?? parsed.profiles[0].id,
      gmWebhookUrl: parsed.gmWebhookUrl || DEFAULT_GM_WEBHOOK,
    } as State;
  } catch {
    return blank();
  }
}

export const save = (s: State) => localStorage.setItem(KEY, JSON.stringify(s));
