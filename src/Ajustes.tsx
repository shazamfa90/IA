import { useRef, useState } from 'react';
import { AJUSTES_PADRAO, FONTES, GIROS, ajustesDe, exportarBackup, importarBackup, type Ajustes as A, type State } from './store.ts';

type Props = {
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
  /** Rola um d20 de mentira, só pra ver a velocidade escolhida. */
  testarGiro: () => void;
};

const NOME_FONTE: Record<A['fonte'], string> = { pequena: 'Pequena', padrao: 'Padrão', grande: 'Grande', enorme: 'Enorme' };
const NOME_GIRO: Record<A['giro'], string> = { rapido: 'Rápido', normal: 'Normal', lento: 'Lento', desligado: 'Sem giro' };

/** Liga/desliga: um botão com papel de interruptor, pra leitor de tela saber o estado. */
function Chave({ rotulo, dica, ligado, onChange }: { rotulo: string; dica?: string; ligado: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="ajuste">
      <span>
        {rotulo}
        {dica && <small>{dica}</small>}
      </span>
      <button type="button" role="switch" aria-checked={ligado} aria-label={rotulo} className="chave" onClick={() => onChange(!ligado)} />
    </div>
  );
}

/** Uma escolha entre poucas opções: botões lado a lado, o escolhido afundado. */
function Opcoes<K extends string>({ rotulo, valor, nomes, onChange }: { rotulo: string; valor: K; nomes: Record<K, string>; onChange: (v: K) => void }) {
  return (
    <div className="ajuste coluna">
      <span>{rotulo}</span>
      <div className="opcoes" role="radiogroup" aria-label={rotulo}>
        {(Object.keys(nomes) as K[]).map((k) => (
          <button key={k} type="button" role="radio" aria-checked={valor === k} className={valor === k ? 'on' : ''} onClick={() => onChange(k)}>
            {nomes[k]}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Ajustes({ state, setState, testarGiro }: Props) {
  const aj = ajustesDe(state);
  const set = (patch: Partial<A>) => setState((s) => ({ ...s, ajustes: { ...s.ajustes, ...patch } }));
  const arquivo = useRef<HTMLInputElement>(null);
  const [aviso, setAviso] = useState('');

  function baixar() {
    const url = URL.createObjectURL(new Blob([exportarBackup(state)], { type: 'application/json' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `ficha-rpg-${new Date().toISOString().slice(0, 10)}.json` });
    a.click();
    URL.revokeObjectURL(url);
    setAviso('Backup baixado. Guarde o arquivo: ele traz perfis, fichas, sistemas e músicas deste aparelho.');
  }

  async function restaurar(f: File) {
    try {
      const novo = importarBackup(await f.text());
      if (!confirm('Restaurar troca tudo deste aparelho pelo que está no backup. Continuar?')) return;
      setState(novo);
      setAviso(`Restaurado: ${novo.characters.length} ficha(s), ${novo.templates.length} sistema(s).`);
    } catch (e) {
      setAviso((e as Error).message);
    }
  }

  return (
    <>
      <h1>Ajustes</h1>

      <section>
        <h2>Texto</h2>
        <Opcoes rotulo="Tamanho da fonte" valor={aj.fonte} nomes={NOME_FONTE} onChange={(fonte) => set({ fonte })} />
        <p className="hint">Muda o app inteiro. Padrão é {FONTES.padrao} px; o escolhido fica em {FONTES[aj.fonte]} px.</p>
      </section>

      <section>
        <h2>Dado</h2>
        <Opcoes rotulo="Velocidade do giro" valor={aj.giro} nomes={NOME_GIRO} onChange={(giro) => set({ giro })} />
        <p className="hint">
          {aj.giro === 'desligado'
            ? 'O resultado aparece na hora, sem animação.'
            : `O dado gira por ${(GIROS[aj.giro] / 1000).toLocaleString('pt-BR')} s antes de mostrar o resultado.`}
        </p>
        <button className="add" onClick={testarGiro}>Testar o giro</button>
        <Chave rotulo="Som de dados" dica="Estalos do dado batendo na mesa." ligado={aj.som} onChange={(som) => set({ som })} />
        <Chave rotulo="Vibrar ao sair o resultado" dica="No celular que tem vibração." ligado={aj.vibrar} onChange={(vibrar) => set({ vibrar })} />
      </section>

      <section>
        <h2>Resultado</h2>
        <Chave rotulo="Sumir automaticamente" dica="Desligado, o resultado fica até você tocar nele." ligado={aj.sumir} onChange={(sumir) => set({ sumir })} />
        {aj.sumir && (
          <label className="field">
            <span>Some depois de</span>
            <select value={aj.sumirSeg} onChange={(e) => set({ sumirSeg: Number(e.target.value) })}>
              {[3, 5, 8, 12, 20].map((s) => (
                <option key={s} value={s}>{s} segundos</option>
              ))}
            </select>
          </label>
        )}
        <p className="hint">Erro nunca some sozinho: ele precisa ser lido.</p>
      </section>

      <section>
        <h2>Efeitos</h2>
        <Chave rotulo="Efeito ao tocar" dica="Nos temas das respirações: lua, chamas, pétalas…" ligado={aj.toques} onChange={(toques) => set({ toques })} />
        <Chave rotulo="Fundo animado" dica="A camada que anda devagar nas respirações. Desligar poupa bateria." ligado={aj.fundoAnimado} onChange={(fundoAnimado) => set({ fundoAnimado })} />
        <button className="add" onClick={() => setState((s) => ({ ...s, ajustes: { ...AJUSTES_PADRAO } }))}>Voltar tudo ao padrão</button>
      </section>

      <section>
        <h2>Backup</h2>
        <p className="hint">
          Tudo fica só neste navegador. Um backup guarda perfis, fichas, sistemas, músicas e ajustes num arquivo: pra não
          perder se limpar o navegador, ou pra levar tudo pra outro aparelho. O arquivo leva junto os webhooks do
          Discord: guarde como senha, não mande no grupo.
        </p>
        <div className="controles">
          <button className="add" onClick={baixar}>Baixar backup</button>
          <button className="add" onClick={() => arquivo.current?.click()}>Restaurar backup</button>
        </div>
        <input
          ref={arquivo}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) restaurar(f);
            e.target.value = ''; // o mesmo arquivo pode ser escolhido de novo
          }}
        />
        {aviso && <p className="hint break" role="status">{aviso}</p>}
      </section>
    </>
  );
}
