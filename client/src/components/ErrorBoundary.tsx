import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State { return { hasError: true } }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-text-primary flex items-center justify-center p-6">
          <div className="max-w-md text-center space-y-4">
            <h1 className="font-display font-heading text-heading text-text-heading">
              Something unexpected happened
            </h1>
            <p className="text-body text-text-muted">
              Please reload the page to continue. If the problem persists, reconnect to the local node.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
