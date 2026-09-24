import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { erro: null }
  }

  static getDerivedStateFromError(erro) {
    return { erro }
  }

  componentDidCatch(erro, info) {
    console.error('Erro na aplicação:', erro, info)
  }

  render() {
    if (this.state.erro) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 text-center">
          <span className="text-3xl">🔥</span>
          <div className="font-display text-lg">Algo deu errado</div>
          <div className="max-w-xs text-sm text-muted">
            Recarregue a página. Se continuar acontecendo, avise o Diego com o print desta tela.
          </div>
          <div className="mt-2 max-w-full overflow-x-auto rounded-lg bg-surface2 p-3 font-mono text-[10px] text-faint">
            {String(this.state.erro?.message || this.state.erro)}
          </div>
          <button onClick={() => window.location.reload()} className="btn-primary mt-2 max-w-[220px]">
            Recarregar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
