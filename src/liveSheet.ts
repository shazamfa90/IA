import type { Character, Template } from './store.ts';

/**
 * Ficha viva: cada personagem ocupa UMA mensagem no canal do mestre, que o app
 * reescreve conforme o jogador edita, em vez de despejar uma mensagem nova a
 * cada mudança.
 */

const MAX_FIELDS = 25; // teto do Discord por embed
const MAX_NAME = 256;
const MAX_VALUE = 1024;
const VAZIO = '—'; // o Discord rejeita campo com valor vazio

const corta = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

function valor(v: string | boolean | undefined, tipo: string): string {
  if (tipo === 'check') return v ? 'Sim' : VAZIO;
  const s = String(v ?? '').trim();
  return s ? corta(s, MAX_VALUE) : VAZIO;
}

export function sheetEmbed(template: Template, character: Character) {
  const campos = template.sections.flatMap((sec) =>
    sec.fields.map((f) => ({
      name: corta(`${f.label}`, MAX_NAME),
      value: valor(character.values[f.id], f.type),
      inline: f.type !== 'textarea',
    })),
  );

  const sobrando = campos.length - MAX_FIELDS;
  return {
    title: corta(character.name || 'Sem nome', MAX_NAME),
    description: corta(template.name, MAX_VALUE),
    color: 0xb08cff,
    fields: campos.slice(0, MAX_FIELDS),
    thumbnail: character.avatarUrl ? { url: character.avatarUrl } : undefined,
    footer: { text: sobrando > 0 ? `+${sobrando} campos não cabem no Discord` : 'atualiza sozinha' },
    timestamp: new Date().toISOString(),
  };
}

/** Muda quando algo que aparece na mensagem muda — e só então. */
export const sheetSignature = (template: Template, character: Character) =>
  JSON.stringify([template.id, template.name, character.name, character.avatarUrl, character.values]);

const base = (webhookUrl: string) => webhookUrl.replace(/\?.*$/, '').replace(/\/+$/, '');

/**
 * Atualiza a mensagem do personagem, criando-a se ainda não existir ou se
 * tiver sido apagada do canal. Devolve o id da mensagem viva.
 */
export async function pushSheet(
  webhookUrl: string,
  template: Template,
  character: Character,
): Promise<string> {
  const body = JSON.stringify({
    username: character.name || 'Ficha',
    avatar_url: character.avatarUrl || undefined,
    embeds: [sheetEmbed(template, character)],
    allowed_mentions: { parse: [] },
  });
  const headers = { 'Content-Type': 'application/json' };
  const url = base(webhookUrl);

  if (character.messageId) {
    const res = await fetch(`${url}/messages/${character.messageId}`, { method: 'PATCH', headers, body });
    if (res.ok) return character.messageId;
    // 404: alguém apagou a mensagem no canal. Qualquer outro erro é real.
    if (res.status !== 404) throw new Error(`Discord recusou a edição (${res.status}).`);
  }

  const res = await fetch(`${url}?wait=true`, { method: 'POST', headers, body });
  if (!res.ok) throw new Error(`Discord recusou a ficha (${res.status}).`);
  const msg = (await res.json()) as { id: string };
  return msg.id;
}
