import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import App from "./App";
import { strings } from "@/constants/strings";

describe("App", () => {
  beforeEach(() => {
    // Ensure no shared-report hash leaks between tests (would switch App to read-only).
    window.location.hash = "";
  });

  it("renders the wizard on the upload step by default", () => {
    render(<App />);
    expect(screen.getByText(strings.upload.prompt)).toBeInTheDocument();
  });

  it("shows the four-step progress indicator", () => {
    render(<App />);
    expect(screen.getByText(strings.steps.upload)).toBeInTheDocument();
    expect(screen.getByText(strings.steps.grouping)).toBeInTheDocument();
    expect(screen.getByText(strings.steps.options)).toBeInTheDocument();
    expect(screen.getByText(strings.steps.done)).toBeInTheDocument();
  });

  it("renders a read-only shared report when the URL carries a #report fragment", () => {
    // A malformed fragment must not crash the app; it falls back to the wizard.
    window.location.hash = "#report=not-valid-data";
    render(<App />);
    expect(screen.getByText(strings.upload.prompt)).toBeInTheDocument();
  });

  it("shows the drop zone, the h1 and the intro sections in the empty state", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Headcount for Zoom webinars");
    expect(screen.getByRole("button", { name: new RegExp(strings.upload.prompt) })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: strings.sample.button })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: strings.exportGuide.heading })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: strings.whatYouGet.heading })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: strings.privacy.heading })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: strings.faq.heading })).toBeInTheDocument();
    expect(screen.getByText(strings.footer.legal)).toBeInTheDocument();
  });

  describe("sample data", () => {
    beforeEach(() => {
      vi.stubGlobal("fetch", vi.fn(async (url: string) => {
        const name = String(url).split("/").pop()!;
        const buf = readFileSync(`public/sample/${name}`);
        return { ok: true, arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) };
      }));
    });
    afterEach(() => vi.unstubAllGlobals());

    it("generates a real report from the bundled CSVs and hides the intro sections", async () => {
      render(<App />);
      await userEvent.click(screen.getByRole("button", { name: strings.sample.button }));
      expect(await screen.findByRole("heading", { name: strings.sample.title })).toBeInTheDocument();
      expect(screen.getByText(strings.results.topLine.unique)).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: strings.exportGuide.heading })).not.toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: strings.faq.heading })).not.toBeInTheDocument();
      // The footer (author, sponsor, source) stays visible with a report.
      expect(screen.getByText(strings.footer.legal)).toBeInTheDocument();
    });

    it("shows an error and keeps the empty state when the sample cannot be fetched", async () => {
      vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 404 })));
      render(<App />);
      await userEvent.click(screen.getByRole("button", { name: strings.sample.button }));
      expect(await screen.findByRole("alert")).toHaveTextContent(strings.sample.error);
      expect(screen.getByRole("heading", { name: strings.faq.heading })).toBeInTheDocument();
    });

    it("copies a share link that points at the site root", async () => {
      const writeText = vi.fn(async () => {});
      Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
      window.history.replaceState(null, "", "/headcount/app/");
      render(<App />);
      await userEvent.click(screen.getByRole("button", { name: strings.sample.button }));
      await userEvent.click(await screen.findByRole("button", { name: new RegExp(strings.results.share) }));
      await waitFor(() => expect(writeText).toHaveBeenCalled());
      const url = (writeText.mock.calls[0] as unknown as [string])[0];
      expect(url).toBe(`${window.location.origin}${import.meta.env.BASE_URL}${url.slice(url.indexOf("#"))}`);
      expect(url).toContain("#report=");
      expect(url).not.toContain("/app/");
      window.history.replaceState(null, "", "/");
    });
  });
});
