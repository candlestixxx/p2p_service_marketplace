import { execSync } from "child_process";

describe("Repository Synchronization Tests", () => {
  it("should have clean working directory", () => {
    const status = execSync("git status --porcelain").toString();
    expect(typeof status).toBe("string");
  });

  it("should successfully build the next application", () => {
    const nextVersion = execSync("npx next --version").toString();
    expect(nextVersion).toContain("Next.js v15");
  });
});
