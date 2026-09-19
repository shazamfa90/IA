# Ficha RPG

Ficha de personagem customizável que posta as rolagens num canal do Discord.

```bash
npm install
npm run dev     # site
npm test        # motor de dados
npm run build   # gera dist/
```

No celular, abra o site e use "Adicionar à tela de início" — vira app.

## Como customizar

A aba **Template** é um JSON que define a ficha inteira:

```json
{
  "name": "Exemplo d20",
  "sections": [
    { "title": "Atributos", "fields": [{ "id": "forca", "label": "Força", "type": "number" }] }
  ],
  "rolls": [{ "label": "Teste de Força", "notation": "d20+@forca" }]
}
```

- `type`: `number`, `text`, `textarea` ou `check`.
- `notation`: `@id` lê o campo com aquele `id`.

## Notação de dados

Mesma do Rollem: `d20+5`, `2d8-1`, `4d6kh3` (mantém os 3 maiores), `4d6dl1` (descarta o menor),
`6#4d6kh3` (repete 6 vezes). Também `kl` e `dh`.

## Discord

*Editar canal → Integrações → Webhooks → Novo webhook → Copiar URL*, e cole na aba **Sessão**.
A rolagem aparece no canal com o nome e o avatar do personagem.

O Rollem não entra nesse caminho: ele ignora mensagens de webhook por design
(`if (message.author.bot) { return; }`), então quem rola é o app.

> A URL do webhook é uma senha: quem a tiver posta no seu canal. Ela fica só no aparelho, no
> `localStorage`. Não coloque em print nem no repositório.
