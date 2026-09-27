import type { Roll } from './dice.ts';

/** Posta a rolagem no canal via webhook, com o nome e o avatar do personagem. */
export async function postRoll(
  webhookUrl: string,
  character: { name: string; avatarUrl?: string },
  label: string,
  notation: string,
  rolls: Roll[],
): Promise<void> {
  if (!/^https:\/\/(discord|discordapp)\.com\/api\/webhooks\//.test(webhookUrl)) {
    throw new Error('URL de webhook inválida. Copie de Editar canal → Integrações → Webhooks.');
  }

  const lines = rolls.map((r) => `${r.detail} = **${r.total}**`);
  const content = `\`${notation}\` ${label}\n${lines.join('\n')}`;

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: character.name || 'Ficha',
      avatar_url: character.avatarUrl || undefined,
      content,
      allowed_mentions: { parse: [] }, // o resultado nunca deve pingar ninguém
    }),
  });

  if (!res.ok) throw new Error(`Discord recusou (${res.status}). Webhook apagado ou rate limit.`);
}
