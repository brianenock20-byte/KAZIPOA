import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import WorkspaceAccessBoundary from "../client/src/components/WorkspaceAccessBoundary";

describe("workspace access boundary", () => {
  it("keeps private Employer content out of an unauthenticated render", () => {
    const markup = renderToStaticMarkup(
      <WorkspaceAccessBoundary isAuthenticated={false} workspaceReady={false}>
        <section>Private Employer candidate pipeline</section>
      </WorkspaceAccessBoundary>,
    );

    expect(markup).toContain("Sign in to access your workspace");
    expect(markup).toContain("Employer portfolio and recruitment tools are private");
    expect(markup).not.toContain("Private Employer candidate pipeline");
  });

  it("keeps unresolved authenticated workspaces in a non-private loading state", () => {
    const markup = renderToStaticMarkup(
      <WorkspaceAccessBoundary isAuthenticated={true} workspaceReady={false}>
        <section>Private Employer candidate pipeline</section>
      </WorkspaceAccessBoundary>,
    );

    expect(markup).toContain("Loading your workspace");
    expect(markup).not.toContain("Private Employer candidate pipeline");
  });

  it("renders private workspace content only when authenticated and ready", () => {
    const markup = renderToStaticMarkup(
      <WorkspaceAccessBoundary isAuthenticated={true} workspaceReady={true}>
        <section>Private Employer candidate pipeline</section>
      </WorkspaceAccessBoundary>,
    );

    expect(markup).toContain("Private Employer candidate pipeline");
  });
});
