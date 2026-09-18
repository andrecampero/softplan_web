import { Component, type ReactNode } from 'react';

interface Estado {
  falhou: boolean;
}

/** Evita a tela branca quando um componente quebra na renderização. */
export class ErrorBoundary extends Component<{ children: ReactNode }, Estado> {
  state: Estado = { falhou: false };

  static getDerivedStateFromError(): Estado {
    return { falhou: true };
  }

  render() {
    if (!this.state.falhou) return this.props.children;
    return (
      <main className="pagina pagina--centro">
        <div className="estado estado--erro" role="alert">
          <p>Algo deu errado. Recarregue a página.</p>
          <button type="button" className="botao" onClick={() => window.location.reload()}>
            Recarregar
          </button>
        </div>
      </main>
    );
  }
}
