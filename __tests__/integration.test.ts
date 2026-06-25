import { execSync } from "child_process";
import * as os from "os";

describe("Repository Synchronization Tests", () => {
  it("should have clean working directory on CI", () => {
    // Only run this check if running in a CI environment (to avoid frustrating devs)
    if (process.env.CI) {
      const status = execSync("git status --porcelain").toString();
      expect(status.trim()).toBe("");
    } else {
      expect(true).toBe(true);
    }
  });

  it("should successfully build the next application", () => {
    // Determine the correct null device for the OS to avoid console spam
    const nullDevice = os.platform() === "win32" ? "NUL" : "/dev/null";
    const buildCmd = `npm run build > ${nullDevice} 2>&1 || echo 'build failed'`;

    // Explicitly run the build command to verify the pipeline doesn't break
    const buildResult = execSync(buildCmd).toString();
    expect(buildResult.trim()).not.toBe("build failed");
  }, 120000); // 2 minute timeout for build
});
