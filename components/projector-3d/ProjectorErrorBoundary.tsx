"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type ProjectorErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
  onError?: () => void;
};

type ProjectorErrorBoundaryState = {
  failed: boolean;
};

export default class ProjectorErrorBoundary extends Component<
  ProjectorErrorBoundaryProps,
  ProjectorErrorBoundaryState
> {
  state: ProjectorErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ProjectorErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("The 3D projector fell back to its static render.", error, info);
    this.props.onError?.();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
