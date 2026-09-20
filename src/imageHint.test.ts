import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dicaDeImagem } from './imageHint.ts';

test('vazio não vira dica', () => {
  assert.equal(dicaDeImagem(''), '');
  assert.equal(dicaDeImagem('   '), '');
});

test('o caso que motivou tudo: link de pin, não de imagem', () => {
  for (const u of [
    'https://br.pinterest.com/pin/1234567890/',
    'https://www.pinterest.com/pin/1234567890/',
    'https://pinterest.co.uk/pin/99/',
    'https://pin.it/abc123',
  ]) {
    assert.match(dicaDeImagem(u), /i\.pinimg\.com/, u);
  }
});

test('cada host errado ganha a instrução dele', () => {
  assert.match(dicaDeImagem('https://imgur.com/abc'), /i\.imgur\.com/);
  assert.match(dicaDeImagem('https://drive.google.com/file/d/x/view'), /Drive/);
  assert.match(dicaDeImagem('https://www.google.com/imgres?q=orc'), /resultado de busca/);
  assert.match(dicaDeImagem('https://instagram.com/p/x'), /bloqueiam/);
  assert.match(dicaDeImagem('https://cdn.discordapp.com/attachments/1/2/a.png'), /expiram/);
});

test('http numa página https é bloqueado pelo navegador, não pelo Discord', () => {
  assert.match(dicaDeImagem('http://exemplo.com/a.png'), /bloqueado/);
});

test('texto que não é URL', () => {
  assert.match(dicaDeImagem('minha imagem'), /não parece um endereço/);
  assert.match(dicaDeImagem('i.pinimg.com/originals/a.jpg'), /não parece um endereço/);
});

test('host desconhecido cai na dica genérica, sem inventar culpado', () => {
  const d = dicaDeImagem('https://meusite.com/foto');
  assert.match(d, /\.jpg/);
  assert.doesNotMatch(d, /Pinterest|Imgur|Drive/);
});

test('uma URL de imagem boa ainda recebe dica: ela só é mostrada se o carregamento falhar', () => {
  // A dica é a explicação do erro, não um veredito sobre a URL.
  assert.ok(dicaDeImagem('https://i.pinimg.com/originals/ab/cd/ef.jpg').length > 0);
});
