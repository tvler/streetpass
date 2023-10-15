import allColorScales from "@radix-ui/colors";
import assert from "assert";
import fs from "fs";
import path from "path";
import url from "url";
import prettier from "prettier";

/**
 * @param {string} str
 */
function toCssCasing(str) {
  return str
    .replace(/([a-z])(\d)/, "$1-$2")
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase();
}

const dirname = path.dirname(url.fileURLToPath(import.meta.url));
const outputDir = path.resolve(dirname, "../src/colors.css");

let fileContents = "";

Object.keys(allColorScales)
  .filter((key) => !key.includes("P3"))
  .forEach((key) => {
    const media = key.includes("Dark")
      ? "@media (prefers-color-scheme: dark)"
      : "@media not (prefers-color-scheme: dark)";

    const srgbValues = Object.entries(allColorScales).find(
      ([name]) => name === key,
    )?.[1];

    assert(srgbValues);

    const srgbCssProperties = Object.entries(srgbValues)
      .map(([name, value]) => [toCssCasing(name), value])
      .map(([name, value]) => `  --${name}: ${value};`)
      .join("\n");

    const srgbCssRule = `${media} { :root { ${srgbCssProperties} } }`;

    fileContents = `${fileContents} ${srgbCssRule}`;
  });

const prettierOptions = await prettier.resolveConfig(outputDir);
assert(prettierOptions);

fs.writeFileSync(
  outputDir,
  await prettier.format(fileContents, {
    ...prettierOptions,
    filepath: outputDir,
  }),
);
