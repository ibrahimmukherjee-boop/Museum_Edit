import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";

interface Props {
  children: ReactNode;
  label?: string;
}

interface State {
  error: Error | null;
}

/** Catches render crashes so the museum never shows a blank screen. */
export class MuseumErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[museum]", this.props.label ?? "page", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="atelier-luminous relative min-h-screen p-8">
          <div className="relative z-10 mx-auto max-w-md rounded-2xl border border-red-900/15 bg-white/90 p-6 text-[#2a2218]">
            <h1 className="font-[Cinzel] text-lg">Something went wrong</h1>
            <p className="mt-2 font-serif text-sm text-[#2a2218]/70">
              {this.props.label ?? "This room"} could not load. You can return home and try again.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                className="rounded-xl bg-amber-700 px-4 py-2 text-sm text-white"
                onClick={() => this.setState({ error: null })}
              >
                Retry
              </button>
              <Link to="/" className="rounded-xl border border-amber-900/15 px-4 py-2 text-sm no-underline text-[#2a2218]">
                Home
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
