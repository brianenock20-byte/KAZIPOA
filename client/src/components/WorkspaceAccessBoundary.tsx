import React, { type ReactNode } from "react";

type WorkspaceAccessBoundaryProps = {
  isAuthenticated: boolean;
  workspaceReady: boolean;
  children: ReactNode;
};

export default function WorkspaceAccessBoundary({ isAuthenticated, workspaceReady, children }: WorkspaceAccessBoundaryProps) {
  if (isAuthenticated && workspaceReady) return <>{children}</>;

  return <main id="main-content" tabIndex={-1} className="dashboard-page">
    <div className="container"><div className="empty-state" role="status" aria-live="polite">
      <h3>{isAuthenticated ? "Loading your workspace…" : "Sign in to access your workspace"}</h3>
      <p>{isAuthenticated ? "Checking your account permissions before loading dashboard tools." : "Your Employer portfolio and recruitment tools are private to your signed-in workspace."}</p>
    </div></div>
  </main>;
}
