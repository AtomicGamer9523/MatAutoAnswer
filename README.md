<!-- 
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
-->

<h1 align = "center">
    <b>Mat's Auto Answer Multi-tool</b>
</h1>
<p align = "center">Tool for automatically answering questions<br>
    <a href="https://github.com/AtomicGamer9523/MatAutoAnswer/blob/main/LICENSE">
        <img src="https://img.shields.io/github/license/AtomicGamer9523/MatAutoAnswer?label=License&color=blue">
    </a> <a href="https://www.github.com/AtomicGamer9523">
        <img src="https://img.shields.io/github/followers/atomicgamer9523?label=AtomicGamer9523%20(Me)&style=social"/>
    </a>
</p>

### How to use ?

Go to [matveit.dev/MatAutoAnswer](https://matveit.dev/MatAutoAnswer),
and drag the bookmark into your bookmarks bar. Click on it to start.
Make sure to check the [Q&A](#qna) for more info.

Keybinds:

- **`CTRL` + `ALT` + `?`**: Opens up the settings,
this is where you can select the Model to use,
as well as the API key for it.
- **`ALT` + `?`**: Answer the current question.
This assumes that the settings are properly configured.
- **`Delete`**: Panic Mode! The tool will stop responding,
and can only be re-enabled by once again clicking on the bookmark.

## QnA

**Q:** I am on MacOS, what do I press?<br>
**A:** Most of the buttons should be the same,
but instead of `CTRL` you will have to press `⌘`!

**Q:** AI ?<br>
**A:** Most of the answers require an AI Model to be answered,
for that you will need an API Token.

**Q:** Where can I get an API Token ?<br>
**A:** This is dependent on the AI Model you are using.
I recommend Gemini, as it is free, fast, and quite accurate.
You can create a free API token [here](https://aistudio.google.com/app/apikey).

**Q:** What is an AI's API Token ?<br>
**A:** Basically, most AI platforms use an API Token to process all requests.
The API token basically says: "Hey, I know this user, I know the account,
let me process the request and respond". Without that API Token the AI will say:
"Hey, who is this? I don't trust you... I won't reply!"
Visually, an API token looks like a jumble of numbers and letters.

## Versions, Models, and Platforms

| Version | MacOS | [Vocab.com](https://vocab.com) | [AP Classroom](https://apclassroom.collegeboard.org) | Google Forms |
| :-- | :-: | :-: | :-: | :-: |
| `v6b-dev` (Latest Nightly) | ✅ | ✅ | ✅ | ❌ |
| `v6a-dev` | ❌ | ✅ | ✅ | ❌ |
| `v6-dev` | ❌ | ❌ | ✅ | ❌ |
| `v5` (Latest Stable) | ❌ | ✅ | ❌ | ❌ |
| `v4` | ❌ | ✅ | ❌ | ❌ |
| `v3` (OBSOLETE) | ✅ | ✅ | ❌ | ❌ |

## Documentation for Developers

All of the public API is described in [autoanswer.d.ts](./autoanswer.d.ts).
Ensure it is being properly loaded.

_Note:_ If you add support for a new platform,
open a PR so that we all can use it and enjoy it :)
