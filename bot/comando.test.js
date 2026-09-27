import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PERMS_TEXTO, PERMS_VOZ, buscaDoSpotify, canalMaisCheio, faltam, idDoWebhook, lerComando, paraYtdlp } from './comando.js';

test('lê o comando da última linha, como o app escreve', () => {
  assert.deepEqual(lerComando('🎵 **Combate**\ntocar <https://youtu.be/abc>'), { acao: 'tocar', alvo: 'https://youtu.be/abc', repetir: false });
  assert.deepEqual(lerComando('🎵 **Taverna**\ntocar taverna medieval'), { acao: 'tocar', alvo: 'taverna medieval', repetir: false });
  assert.deepEqual(lerComando('pausar'), { acao: 'pausar', alvo: undefined });
  assert.deepEqual(lerComando('parar'), { acao: 'parar', alvo: undefined });
});

test('ignora o que não é comando', () => {
  assert.equal(lerComando('tocar'), null, 'tocar sem o quê');
  assert.equal(lerComando('bora tocar algo'), null);
  assert.equal(lerComando('m!play x --now'), null);
});

test('id do webhook sai da URL', () => {
  assert.equal(idDoWebhook('https://discord.com/api/webhooks/123456/abc-DEF_1'), '123456');
  assert.equal(idDoWebhook(''), undefined);
  assert.equal(idDoWebhook(undefined), undefined);
});

test('entra no canal de voz com mais gente, sem contar bots', () => {
  assert.equal(canalMaisCheio([{ canal: 'a' }, { canal: 'b' }, { canal: 'b' }, { canal: 'a', bot: true }, { canal: 'a', bot: true }]), 'b');
  assert.equal(canalMaisCheio([{ canal: null }, { canal: 'a', bot: true }]), undefined, 'só bots: ninguém');
});

test('link do Spotify vira busca "música artista"', () => {
  const html = '<meta property="og:title" content="紅蓮華"/><meta name="music:musician_description" content="LiSA"/>';
  assert.equal(buscaDoSpotify(html), '紅蓮華 LiSA');
  assert.equal(buscaDoSpotify('<meta property="og:title" content="Rock &amp; Roll"/>'), 'Rock & Roll', 'sem artista (playlist): só o nome');
  assert.equal(buscaDoSpotify('<html></html>'), null);
});

test('busca vira ytsearch; link vai direto', () => {
  assert.equal(paraYtdlp('taverna medieval'), 'ytsearch1:taverna medieval');
  assert.equal(paraYtdlp('https://youtu.be/abc'), 'https://youtu.be/abc');
});

test('diz quais permissões faltam, com o nome do Discord em português', () => {
  const tem = (...ps) => ({ has: (p) => ps.includes(p) });
  // O caso real da mesa: via o histórico, mas não o canal; e não podia conectar na voz.
  assert.deepEqual(faltam(tem('ReadMessageHistory', 'AddReactions'), PERMS_TEXTO), ['Ver canal', 'Enviar mensagens']);
  assert.deepEqual(faltam(tem('ViewChannel', 'Speak'), PERMS_VOZ), ['Conectar']);
  assert.deepEqual(faltam(tem(...PERMS_TEXTO), PERMS_TEXTO), []);
  assert.equal(faltam(undefined, PERMS_VOZ).length, 3, 'canal que o bot nem enxerga: falta tudo');
});

test('🔁 depois de tocar liga o repetir; "repetir sim|não" muda a trilha atual', () => {
  assert.deepEqual(lerComando('🎵 **Combate**\ntocar 🔁 <https://youtu.be/abc>'), { acao: 'tocar', alvo: 'https://youtu.be/abc', repetir: true });
  assert.deepEqual(lerComando('tocar 🔁 chuva'), { acao: 'tocar', alvo: 'chuva', repetir: true });
  assert.deepEqual(lerComando('repetir sim'), { acao: 'repetir', repetir: true });
  assert.deepEqual(lerComando('repetir não'), { acao: 'repetir', repetir: false });
  assert.equal(lerComando('repetir talvez'), null);
  assert.equal(lerComando('tocar 🔁'), null, 'repetir o quê');
});
