if (!Deno) throw "This assumes you are using Deno!";

import * as esbuild from "npm:esbuild";

const cwd = Deno.cwd().replaceAll(/\\/g,"/");
const code = await Deno.readTextFile(`${cwd}/autoanswer.js`);
const result = await esbuild.transform(code, {
    platform: "browser",
    format: "cjs",
    minify: true,
    loader: "js",
});
for (const warning of result.warnings) {
    console.warn(warning);
}

const HTML = '<a href="javascript:' + encodeURIComponent(result.code) +
`"><img alt="Mat's Auto Answer Multi-tool"src="./badge.svg"/></a>`;
const encoder = new TextEncoder();

try {
    for await (const item of Deno.readDir(`${cwd}/.build`)) {
        Deno.remove(item.name, { recursive: true });
    }
} catch (_e) {
    Deno.mkdir(`${cwd}/.build`);
}

await Deno.copyFile(`${cwd}/badge.svg`, `${cwd}/.build/badge.svg`);
const out = await Deno.create(`${cwd}/.build/index.html`);
await out.write(encoder.encode(HTML));
