import type { Roll } from './dice.ts';

/** Posta a rolagem no canal via webhook, com o nome e o avatar do personagem. */
export async function postRoll(
  webhookUrl: string,
  character: { name: string; avatarUrl?: string },
  label: string,
  notation: string,
  rolls: Roll[],
): Promise<void> {
  const lines = rolls.map((r) => `${r.detail} = **${r.total}**`);
  await post(webhookUrl, {
    username: character.name || 'Ficha',
    avatar_url: character.avatarUrl || undefined,
    content: `\`${notation}\` ${label}\n${lines.join('\n')}`,
  });
}

/**
 * Escreve um comando pro bot da mesa e devolve o id da mensagem: o bot escreve nela a lista de
 * faixas de uma playlist, e o app lê de volta com lerMensagem.
 */
export const postComando = async (webhookUrl: string, content: string) =>
  (await post(webhookUrl, { username: 'Mestre', content }, true))!;

const WEBHOOK = /^https:\/\/(discord|discordapp)\.com\/api\/webhooks\/\d+\/[\w-]+/;

async function post(
  webhookUrl: string,
  body: { username: string; avatar_url?: string; content: string },
  esperar = false,
): Promise<string | undefined> {
  if (!WEBHOOK.test(webhookUrl)) {
    throw new Error('URL de webhook inválida. Copie de Editar canal → Integrações → Webhooks.');
  }

  // ?wait=true: o Discord devolve a mensagem criada, com o id.
  const res = await fetch(esperar ? `${webhookUrl.match(WEBHOOK)![0]}?wait=true` : webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, allowed_mentions: { parse: [] } }), // nunca pinga ninguém
  });

  if (!res.ok) throw new Error(`Discord recusou (${res.status}). Webhook apagado ou rate limit.`);
  return esperar ? ((await res.json()) as { id: string }).id : undefined;
}

type Mensagem = { embeds?: { description?: string; footer?: { text?: string } }[] };

/** O webhook lê as mensagens que ele mesmo escreveu, inclusive depois que o bot as editou. */
export async function lerMensagem(webhookUrl: string, id: string): Promise<Mensagem> {
  const base = webhookUrl.match(WEBHOOK)?.[0];
  if (!base) throw new Error('URL de webhook inválida.');
  const res = await fetch(`${base}/messages/${id}`);
  if (!res.ok) throw new Error(`Discord recusou (${res.status}).`);
  return res.json();
}

/**
 * A lista que o bot escreveu na mensagem: "1. Título" por linha, e no rodapé "▶ 3/12" com a
 * que está tocando. Sem lista ainda (o bot não respondeu), null.
 */
export function lerLista(msg: Mensagem): { faixas: string[]; atual?: number } | null {
  const e = msg.embeds?.[0];
  if (!e?.description) return null;
  const faixas = [...e.description.matchAll(/^\d+\. (.+)$/gm)].map((m) => m[1]);
  const atual = e.footer?.text?.match(/▶ (\d+)\//)?.[1];
  return { faixas, atual: atual ? Number(atual) - 1 : undefined };
}

const alvo = (link: string) => (/^https?:\/\//i.test(link) ? `<${link}>` : link);

/**
 * O que o bot da mesa (pasta bot/) entende: ele lê a última linha. A primeira
 * é pra mesa ver o que começou a tocar. "playlist … #5" toca a lista em sequência
 * a partir da faixa 5. 🔁 = repetir quando acabar. Link entre <> não abre prévia.
 */
export const comandoTocar = (nome: string, link: string, repetir: boolean, playlist = false, faixa?: number) =>
  `${playlist ? '📀' : '🎵'} **${nome}**\n${playlist ? 'playlist' : 'tocar'} ${repetir ? '🔁 ' : ''}${alvo(link)}${faixa ? ` #${faixa}` : ''}`;

/** Pede ao bot só a lista de faixas da playlist, sem tocar. */
export const comandoListar = (nome: string, link: string) => `📀 **${nome}**\nlistar ${alvo(link)}`;
