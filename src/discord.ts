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

/** Escreve um comando no canal do bot de música, ex.: "m!play <link> --now". */
export const postComando = (webhookUrl: string, content: string) => post(webhookUrl, { username: 'Mestre', content });

async function post(webhookUrl: string, body: { username: string; avatar_url?: string; content: string }): Promise<void> {
  if (!/^https:\/\/(discord|discordapp)\.com\/api\/webhooks\//.test(webhookUrl)) {
    throw new Error('URL de webhook inválida. Copie de Editar canal → Integrações → Webhooks.');
  }

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, allowed_mentions: { parse: [] } }), // nunca pinga ninguém
  });

  if (!res.ok) throw new Error(`Discord recusou (${res.status}). Webhook apagado ou rate limit.`);
}
