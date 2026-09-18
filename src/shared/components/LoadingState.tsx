export function LoadingState({ mensagem = 'Carregando…' }: { mensagem?: string }) {
  return (
    <div className="estado estado--carregando" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      {mensagem}
    </div>
  );
}
