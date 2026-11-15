import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const html = readFileSync("public/app/index.html", "utf8");

describe("legacy /app/ redirect page", () => {
  it("should redirect to the root while preserving search and hash", () => {
    expect(html).toContain('location.replace("../" + location.search + location.hash)');
  });

  it("should fall back to a meta refresh and canonicalise to the root", () => {
    expect(html).toContain('http-equiv="refresh"');
    expect(html).toContain('<link rel="canonical" href="https://jerefrer.github.io/headcount/" />');
  });

  it("should resolve the redirect target to the root and keep the hash", () => {
    // Evaluate the inline script against a stub location, as the browser would.
    const code = /<script>([\s\S]*?)<\/script>/.exec(html)![1];
    const target: string[] = [];
    const loc = { search: "", hash: "#report=abc", replace: (u: string) => target.push(u) };
    new Function("location", code)(loc);
    expect(new URL(target[0], "https://jerefrer.github.io/headcount/app/").href).toBe(
      "https://jerefrer.github.io/headcount/#report=abc",
    );
  });
});
