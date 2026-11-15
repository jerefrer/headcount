import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RichText } from "./RichText";
import { strings } from "@/constants/strings";
import App from "@/app/App";

describe("RichText", () => {
  it("should render **marked** words as strong elements when text has bold markers", () => {
    const { container } = render(<p><RichText text="Click **Export as CSV** now" /></p>);
    expect(container.querySelector("strong")).toHaveTextContent("Export as CSV");
    expect(container).toHaveTextContent("Click Export as CSV now");
  });

  it("should substitute the link node when text contains {link}", () => {
    render(<p><RichText text="Yes — {link} (**MIT**)" link={<a href="https://x.test">src</a>} /></p>);
    expect(screen.getByRole("link", { name: "src" })).toBeInTheDocument();
    expect(screen.getByText("MIT").tagName).toBe("STRONG");
  });
});

describe("landing copy", () => {
  it("should bold UI labels in the export steps and key facts in the FAQ", () => {
    render(<App />);
    expect(screen.getByText("Export as CSV", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText("Usage Reports → Webinar", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText("No.", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText("MIT licensed", { selector: "strong" })).toBeInTheDocument();
  });

  it("should show every FAQ question, no raw markers, and keep the GitHub link", () => {
    const { container } = render(<App />);
    for (const item of strings.faq.items) expect(screen.getByText(item.q)).toBeInTheDocument();
    expect(container.textContent).not.toContain("**");
    expect(container.textContent).not.toContain("{link}");
    expect(screen.getByRole("link", { name: strings.faq.sourceLinkLabel })).toHaveAttribute("href", "https://github.com/jerefrer/headcount");
  });
});
