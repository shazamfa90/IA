import type { Template } from './store.ts';
import { uid } from './store.ts';

/**
 * Ficha adaptada do **Hashira Handbook 1.0** (Natan, 2023), projeto de fãs sem
 * fins lucrativos que leva Kimetsu no Yaiba para o d20 da 5ª edição.
 *
 * Só a estrutura da ficha vem daqui: atributos, recursos e rolagens. Nada do
 * texto das regras é reproduzido — quem joga precisa do livro do lado, e é lá
 * que estão as respirações, talentos e kekkijutsu por extenso.
 *
 * Base 5e, então o modificador é (valor − 10) ÷ 2.
 */
export const HASHIRA = (): Template => ({
  id: uid(),
  name: 'Hashira Handbook',
  // relativa: resolve tanto no site publicado quanto rodando local
  image: 'capa-hashira.svg',
  modRule: 'd20',
  theme: 'nichirin',
  sections: [
    {
      id: uid(),
      title: 'Caçador',
      fields: [
        // Raças do livro: Humano, Especial, Marechi, Tsuyoi, Demônio — cada uma
        // com PV inicial próprio, somado ao da classe no 1º nível.
        { id: 'raca', label: 'Raça', type: 'text' },
        // Classe é a Respiração (Água, Chamas, Trovão…) ou um Kekkijutsu, se demônio.
        { id: 'classe', label: 'Respiração / Kekkijutsu', type: 'text' },
        { id: 'nivel', label: 'Nível', type: 'number' },
        { id: 'antecedente', label: 'Antecedente', type: 'text' },
        { id: 'tendencia', label: 'Tendência', type: 'text' },
      ],
    },
    {
      id: uid(),
      title: 'Atributos',
      fields: [
        { id: 'forca', label: 'Força', type: 'attr' },
        { id: 'destreza', label: 'Destreza', type: 'attr' },
        { id: 'constituicao', label: 'Constituição', type: 'attr' },
        { id: 'inteligencia', label: 'Inteligência', type: 'attr' },
        { id: 'sabedoria', label: 'Sabedoria', type: 'attr' },
        { id: 'carisma', label: 'Carisma', type: 'attr' },
      ],
    },
    {
      id: uid(),
      title: 'Combate',
      fields: [
        { id: 'pv', label: 'Pontos de vida', type: 'number' },
        { id: 'pvmax', label: 'PV máximo', type: 'number' },
        { id: 'ca', label: 'Classe de armadura', type: 'number' },
        { id: 'prof', label: 'Bônus de proficiência', type: 'number' },
        { id: 'deslocamento', label: 'Deslocamento', type: 'text' },
      ],
    },
    {
      id: uid(),
      title: 'Respiração',
      fields: [
        // Pontos de Energia = nível da classe (a do Inseto é a exceção do livro).
        { id: 'energia', label: 'Pontos de energia', type: 'number' },
        { id: 'energiamax', label: 'Energia máxima', type: 'number' },
        { id: 'concentracao', label: 'Concentração Total: usos', type: 'number' },
        { id: 'continua', label: 'Respiração Contínua', type: 'check' },
        { id: 'tecnicas', label: 'Técnicas conhecidas', type: 'textarea' },
      ],
    },
    {
      id: uid(),
      title: 'Caderno',
      fields: [
        { id: 'pericias', label: 'Perícias e proficiências', type: 'textarea' },
        { id: 'talentos', label: 'Talentos', type: 'textarea' },
        { id: 'equipamento', label: 'Equipamento', type: 'textarea' },
        { id: 'notas', label: 'Anotações', type: 'textarea' },
      ],
    },
  ],
  rolls: [
    { id: uid(), label: 'Força', notation: 'd20+@forca' },
    { id: uid(), label: 'Destreza', notation: 'd20+@destreza' },
    { id: uid(), label: 'Constituição', notation: 'd20+@constituicao' },
    { id: uid(), label: 'Inteligência', notation: 'd20+@inteligencia' },
    { id: uid(), label: 'Sabedoria', notation: 'd20+@sabedoria' },
    { id: uid(), label: 'Carisma', notation: 'd20+@carisma' },
    { id: uid(), label: 'Iniciativa', notation: 'd20+@destreza' },
    { id: uid(), label: 'Ataque com katana', notation: 'd20+@forca+@prof' },
    { id: uid(), label: 'Dano da katana', notation: '1d8+@forca' },
    { id: uid(), label: 'Katana a duas mãos', notation: '1d10+@forca' },
    // Concentração Total: 1 ponto de energia para somar 1d10 ao dano.
    { id: uid(), label: 'Concentração Total (+dano)', notation: '1d10' },
    {
      id: uid(),
      label: 'Rolar atributos',
      notation: '6#4d6kh3',
      assign: '@forca @destreza @constituicao @inteligencia @sabedoria @carisma',
    },
  ],
});
