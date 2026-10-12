import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Erro capturado na aplicação:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFFDFB] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#FCD6E0] text-center">
            <div className="w-16 h-16 rounded-full bg-[#FFEBF0] text-[#D85072] flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#26161B] mb-2">
              Dra. Léia Mar • Fisioterapia & Pilates
            </h2>
            <p className="text-sm text-[#5B444C] mb-6 leading-relaxed">
              Detectamos uma atualização de recursos no navegador. Clique abaixo para carregar a versão mais recente da plataforma.
            </p>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-full bg-[#D85072] hover:bg-[#BC3859] text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Recarregar Página</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
