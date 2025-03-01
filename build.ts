/**
BSD 2-Clause License

Copyright (c) 2025, Матвей Т <https://matveit.dev>

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

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
        await Deno.remove(item.name, { recursive: true });
    }
} catch (_e) {
    await Deno.mkdir(`${cwd}/.build`);
}

await Deno.copyFile(`${cwd}/badge.svg`, `${cwd}/.build/badge.svg`);
const out = await Deno.create(`${cwd}/.build/index.html`);
await out.write(encoder.encode(HTML));
