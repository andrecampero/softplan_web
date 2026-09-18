import { getAcaoDoErro, getMensagemErro } from '../../api/error-messages';
import { useEsperaRestante } from '../hooks/useEsperaRestante';

interface ErrorStateProps {
  erro: unknown;
  onTentarNovamente?: () => void;
  tentando?: boolean;
}

/** Mensagem amigável + ação adequada ao tipo de erro (CLAUDE.md, seção 7.4). */
export function ErrorState({ erro, onTentarNovamente, tentando = false }: ErrorStateProps) {
  const acao = getAcaoDoErro(erro);
  const espera = useEsperaRestante(erro);
  const mensagem =
    acao === 'aguardar' && espera > 0
      ? `Muitas requisições em pouco tempo. Tente novamente em ${espera} segundos.`
      : getMensagemErro(erro);
  const podeTentar = onTentarNovamente && (acao === 'tentar-novamente' || acao === 'aguardar');

  return (
    <div className="estado estado--erro" role="alert">
      <p>{mensagem}</p>
      {podeTentar && (
        <button type="button" className="botao botao--secundario" onClick={onTentarNovamente} disabled={tentando || espera > 0}>
          {espera > 0 ? `Aguarde ${espera}s` : 'Tentar novamente'}
        </button>
      )}
    </div>
  );
}
