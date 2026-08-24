import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Copy, Check } from 'lucide-react';

interface Props {
  children: ReactNode;
  appName?: string;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[NovaOS ErrorBoundary] Caught error in ${this.props.appName || 'Component'}:`, error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleCopyError = () => {
    const text = `App: ${this.props.appName || 'Unknown'}\nError: ${this.state.error?.toString()}\nStack:\n${this.state.errorInfo?.componentStack || ''}`;
    navigator.clipboard?.writeText(text);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full h-full bg-zinc-950/95 text-white flex flex-col items-center justify-center p-6 text-center select-none overflow-y-auto">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-500/10">
            <AlertTriangle className="w-7 h-7 animate-bounce" />
          </div>

          <h3 className="text-base font-bold text-white mb-1">
            {this.props.appName ? `Falha em ${this.props.appName}` : 'Ocorreu um erro no aplicativo'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-xs mb-4 leading-relaxed">
            O aplicativo encontrou uma exceção inesperada e foi isolado para proteger o sistema.
          </p>

          <div className="w-full max-w-xs bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 text-left mb-5 overflow-hidden">
            <p className="text-[11px] font-mono text-rose-300 break-words line-clamp-3">
              {this.state.error?.message || 'Erro de execução desconhecido'}
            </p>
          </div>

          <div className="flex flex-col w-full max-w-xs space-y-2">
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-md shadow-cyan-500/20"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar Aplicativo</span>
            </button>

            <button
              onClick={this.handleCopyError}
              className="w-full py-2 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs flex items-center justify-center space-x-2 transition-all active:scale-95"
            >
              {this.state.copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{this.state.copied ? 'Copiado para Área de Transferência' : 'Copiar Diagnóstico'}</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
