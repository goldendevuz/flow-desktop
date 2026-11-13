import { readFileSync, writeFileSync } from "node:fs";

const baseConfig = JSON.parse(
  readFileSync("src-tauri/tauri.conf.json", "utf8"),
);
const baseVersion = String(baseConfig.version).split(/[+-]/, 1)[0];
// BUILD_NUMBER lets a workflow continue the numbering of another one, so a version never goes
// down when the installer comes from a different workflow.
const runNumber = process.env.BUILD_NUMBER || process.env.GITHUB_RUN_NUMBER || String(Date.now());
// The RPM bundler rejects "-" in versions; "+" (semver build metadata) is
// accepted there, while the NSIS and DMG bundlers keep the pre-release form.
const separator = process.platform === "linux" ? "+" : "-";
const version = `${baseVersion}${separator}nightly.${runNumber}`;

const nightlyConfig = {
  $schema: "https://schema.tauri.app/config/2",
  productName: "SaveTube",
  version,
  identifier: "uz.univel.savetube.desktop",
  bundle: {
    createUpdaterArtifacts: false,
    shortDescription: "SaveTube desktop client (nightly build).",
    longDescription:
      "SaveTube desktop client, an automatically generated build. It keeps its own application data, separate from Flow.",
  },
};

writeFileSync(
  "src-tauri/tauri.nightly.generated.json",
  `${JSON.stringify(nightlyConfig, null, 2)}\n`,
);

console.log(`Generated SaveTube configuration for version ${version}`);
