"use client";

import React, { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Error boundary for the InteractivePhone component.
 * If the phone mockup errors (e.g., old browser), shows a graceful fallback
 * instead of crashing the entire landing page.
 */
export default class PhoneErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-[280px] md:w-[300px] h-[560px] md:h-[600px] rounded-[3rem] border-[8px] border-warm-900 bg-warm-150 flex items-center justify-center">
          <div className="text-center px-6">
            <span className="text-3xl mb-3 block">📱</span>
            <p className="text-sm font-semibold text-warm-950">App Preview</p>
            <p className="text-xs text-text-muted mt-1">
              Download the app to see it in action
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
