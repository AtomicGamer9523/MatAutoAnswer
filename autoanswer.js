/**
 * BSD 2-Clause License
 * 
 * Copyright (c) 2025, Матвей Т <https://matveit.dev>
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/// <reference types="./autoanswer.d.ts" />
/// <reference lib="DOM" />

// This Most likely does not need ANY modification
(function (VERSION) {
    const NAME = "Mat's Auto Answer Multi-tool " + VERSION;
    const MSG = (...a) => "[" + NAME + "] " + a.join(" ");
    class MatError extends Error {
        constructor(...a) {
            super(a.join(" "));
            this.name = NAME;
        }
    }

    /**
     * @template T inner value type
     * @implements {MatAutoAnswer.Option._Option<T>}
    */
    class Option {
        /**@type {T | undefined}*/#value;
        constructor(v) {
            Object.defineProperty(this, "__THIS_IS_OPTION__", {
                configurable: false,
                enumerable: false,
                writable: false,
                value: true,
            });
            this.#value = v;
        }
        isSome() {
            return typeof this.#value !== "undefined";
        }
        isNone() {
            return !this.isSome();
        }
        unwrap() {
            if (this.isSome()) return this.#value;
            throw new TypeError("Attempted to unwrap a empty Option");
        }
        unwrapOr(other) {
            if (this.isSome()) return this.#value;
            return other;
        }
        expect(...msg) {
            if (this.isSome()) return this.#value;
            throw new MatError(...msg);
        }
        map(fn) {
            if (typeof fn !== "function") throw new TypeError(
                "Expected typeof 'fn' to be 'Function'");
            if (this.isSome()) return new Option(fn(this.#value));
            return this;
        }
        and(other) {
            if (typeof other !== "function") throw new TypeError(
                "Expected typeof 'other' to be 'Function'");
            if (this.isSome()) return other(this.#value);
            return this;
        }
        flatten() {
            if (this.isNone()) return Option.None;
            const inner = this.unwrap();
            if (!inner["__THIS_IS_OPTION__"]) throw new TypeError(
                "Expected typeof 'this' to be 'Option<Option<T>>'");
            return inner;
        }
    }

    /**
     * @template T Value type
     * @template S Scope
     * @param {string} name
     * @param {T} type
     * @param {MatAutoAnswer.DefSettings | S | undefined} maybeScopeOrSettings
     * @param {S | undefined} maybeScope 
     * @returns {void}
    */
    function def(name, type, maybeScopeOrSettings, maybeScope) {
        if (typeof name !== "string") throw new TypeError(
            "Expected typeof 'name' to be 'string'");

        let/**@type {S}*/scope = globalThis;
        let/**@type {MatAutoAnswer.DefSettings}*/settings = "c+e+w+";

        if (typeof maybeScopeOrSettings === "string") {
            if (maybeScopeOrSettings.length > 6) throw new TypeError(
                "Expected typeof 'settings' to be 'MatAutoAnswer.DefSettings'");
            settings = maybeScopeOrSettings;
            if (
                maybeScope !== null &&
                typeof maybeScope !== "undefined"
            ) scope = maybeScope;
        } else if (
            maybeScopeOrSettings !== null &&
            typeof maybeScopeOrSettings !== "undefined"
        ) scope = maybeScope;

        const configurable = !settings.includes("c-");
        const enumerable = !settings.includes("e-");
        const writable = !settings.includes("w-");

        Object.defineProperty(scope, name, {
            configurable: configurable,
            enumerable: enumerable,
            writable: writable,
            value: type
        });
    }

    def("Some", v => new Option(v), "c-e+w-", Option);
    def("None", new Option(), "c-e+w-", Option);

    /**@implements {MatAutoAnswer.MatAutoAnswerEnv}*/
    class Env {
        /**@type {MatAutoAnswer.Option<MatAutoAnswer.Model>}*/
        #model = Option.None;
        /**@type {MatAutoAnswer.Option<MatAutoAnswer.Token>}*/
        #token = Option.None;
        /**@type {MatAutoAnswer.Option<MatAutoAnswer.Timeout>}*/
        #clickNextTimeout = Option.None;
        /**@type {Map<MatAutoAnswer.Model, MatAutoAnswer.AIModel>}*/
        #models = new Map();
        /**@type {Map<string | RegExp, MatAutoAnswer.QuestionProvider>}*/
        #providers = new Map();
        /** The function that does all the magic */
        async call() {
            /**@type {MatAutoAnswer.QuestionProvider | undefined}*/
            let provider;
            const url = document.location.origin;
            this.#providers.forEach((p, regex) => {
                const v = url.match(regex);
                if (!v || v.length < 1) return;
                provider = p;
            });
            if (!provider) return alert(MSG(
                `The current website '${url}' is not yet supported!`));

            if (this.model.isNone()) return alert(MSG(
                "Please selected a model to use!"));
            const modelName = this.model.unwrap();
            const modelfunc = this.#models.get(modelName);
            if (!modelfunc) return alert(MSG(
                `Unkown AI Model '${modelName}'`));
            if (this.token.isNone()) return alert(MSG(
                "No token found, please supply a token for the AI Model"));
            const token = this.token.unwrap();

            /**@type {MatAutoAnswer.Option<MatAutoAnswer.Question>}*/
            const q = provider.getLatestQuestion(modelName);
            if (q.isNone()) return alert(MSG(
                "Unable to find a question"));
            const question = q.unwrap();
            /**@type {MatAutoAnswer.Answer}*/
            let questionAnswer;
            if (question.requiresAI) {
                const res = await modelfunc(question.prompt, token);
                if (res.isNone()) return alert(MSG(
                    "AI Model failed to return a proper response!"));
                const answer = provider.parseAIResponse(modelName, res.unwrap());
                if (answer.isNone()) return alert(MSG(
                    "Failed to handle AI response!\nPlease try again later!"));
                questionAnswer = answer.unwrap();
            } else {
                questionAnswer = question.answer;
            }
            const err = provider.trySupply(questionAnswer);
            if (err.isSome()) return alert(MSG(err.unwrap()));
            // No need to click next, if user doesn't want to
            if (this.clickNextTimeout.isNone()) return;
            const timeout = this.clickNextTimeout.unwrap();
            setTimeout(() => provider.clickNext(), timeout);
        }
        addQuestionProvider(hostname, provider) {
            this.#providers.set(hostname, provider);
            return this;
        }
        addAIModel(modelName, modelFunc) {
            this.#models.set(modelName, modelFunc);
            return this;
        }
        get token() { return this.#token; }
        get model() { return this.#model; }
        get clickNextTimeout() { return this.#clickNextTimeout; }
        set token(token) {
            if (typeof token === "string") {
                this.#token = Option.Some(token);
                return;
            }
            if (token["__THIS_IS_OPTION__"]) {
                this.#token = token;
                return;
            }
            this.#token = Option.None;
        }
        set model(model) {
            if (typeof model === "string") {
                this.#model = Option.Some(model);
                return;
            }
            if (model["__THIS_IS_OPTION__"]) {
                this.#model = model;
                return;
            }
            this.#model = Option.None;
        }
        set clickNextTimeout(timeout) {
            if (typeof timeout === "number") {
                this.#clickNextTimeout = Option.Some(timeout);
                return;
            }
            if (timeout["__THIS_IS_OPTION__"]) {
                this.#clickNextTimeout = timeout;
                return;
            }
            this.#clickNextTimeout = Option.None;
        }
        get models() {
            const out = [];
            for (const key of this.#models.keys()) out.push(key);
            return out;
        }
    }

    function MatAutoAnswer(fn) {
        if (typeof fn !== "function") throw new TypeError(
            "Expected typeof 'fn' to be 'Function'");
        let env_instance;
        if (!globalThis["MatAutoAnswer"]) {
            env_instance = new Env();
            def("__ENV_INSTANCE__", env_instance, "c+e-w+", this);
        } else {
            env_instance = globalThis["MatAutoAnswer"]["__ENV_INSTANCE__"];
        }
        fn(env_instance);
    }

    /**@type {typeof MatAutoAnswer.nth}*/
    const nth = i => a => a && a[i] ? Option.Some(a[i]) : Option.None;

    function searchForElemByClass(classNames, from = document) {
        const list = from.getElementsByClassName(classNames);
        if (!list || list.length < 1) return Option.None;
        return Option.Some(list);
    }

    /**@type {typeof MatAutoAnswer.findFn}*/
    const findFn = f => items => {
        for (const item of items)
            if (f(item)) return Option.Some(item);
        return Option.None;
    }

    def("Option", Option, MatAutoAnswer);

    def("searchForElemByClass", searchForElemByClass, MatAutoAnswer);
    def("findFn", findFn, MatAutoAnswer);
    def("first", nth(0), MatAutoAnswer);
    def("nth", nth, MatAutoAnswer);
    def("def", def, MatAutoAnswer);

    def("Question", {
        immediatelyAnswerable: answer => ({ requiresAI: false, answer }),
        deferred: prompt => ({ requiresAI: true, prompt }),
    }, MatAutoAnswer);
    def("name", NAME, MatAutoAnswer);

    def("MatAutoAnswer", MatAutoAnswer);
})("v6-dev");

MatAutoAnswer(env => {
    /**
     * @param {MatAutoAnswer.Model} model
     * @param {MatAutoAnswer.Prompt} prompt
     * @param {MatAutoAnswer.Token} token
     * @returns {Promise<MatAutoAnswer.Option<MatAutoAnswer.AIResponse>>}
    */
    async function GeminiMultipleChoice(model, prompt, token) {
        const URL = "https://generativelanguage.googleapis.com/" +
            `v1beta/models/${model}:generateContent?key=${token}`;
        const SYS_PROMPT = "YOU WILL BE PROVIDED WITH A QUESTION, AS WELL " +
            "AS A LIST OF ANSWERS.\nFROM THAT LIST, PEASE SELECT THE BEST " +
            "ANSWER, AND RESPOND WITH IT BOXED.\nFOR EXAMPLE, IF THE " +
            "QUESTION IS 'What is 2 + 2', AND YOUR ANSWER CHOICES ARE:\n" +
            "ANSWER CHOICE 1. 2\nANSWER CHOICE 2. 4\nANSWER CHOICE 3. 6\n\n" +
            "THEN YOU ARE TO RESPOND WITH `ANSWER CHOICE 3: $\\boxed{4}$`\n" +
            "\nMAKE SURE TO THINK STEP BY STEP, AND DON'T MAKE ANY MISTAKES!";
        const CONFIG = {
            contents: [{ parts: [{ text: prompt }] }],
            system_instruction: { parts: { text: SYS_PROMPT } },
            safetySettings: [{
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_ONLY_HIGH",
            }, {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_ONLY_HIGH",
            }, {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_NONE",
            }]
        };
        try {
            const http = await fetch(URL, {
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(CONFIG),
                method: "POST",
            });
            if (!http.ok) return MatAutoAnswer.Option.None;
            /**@type {{candidates:[{content:{parts:[{text:string}]}}]}}*/
            const r = await http.json();
            if (
                !r ||
                !r.candidates ||
                !r.candidates[0] ||
                !r.candidates[0].content ||
                !r.candidates[0].content.parts ||
                !r.candidates[0].content.parts[0] ||
                !r.candidates[0].content.parts[0].text
            ) return MatAutoAnswer.Option.None;
            const res = r.candidates[0].content.parts[0].text;
            return MatAutoAnswer.Option.Some(res);
        } catch (_) {
            return MatAutoAnswer.Option.None;
        }
    }

    const GEMINI_THINKING_NAME = "Gemini 2.0 Multiple-choice Smart";
    const GEMINI_THINKING_ID = "gemini-2.0-flash-thinking-exp-01-21";
    const GEMINI_FAST_NAME = "Gemini Multiple-choice Fast";
    const GEMINI_FAST_ID = "gemini-1.5-flash-8b";

    /**@implements {MatAutoAnswer.QuestionProvider}*/
    class APClassroom {
        /** Fetches the current question context (DIV) */
        get context() {
            return MatAutoAnswer.searchForElemByClass(
                "learnosity-item item-is-loaded"
            ).and(MatAutoAnswer.findFn(/**@param {HTMLElement} e*/ e =>
                e["style"] && e.style.opacity === "1"
            )).map(div => ({
                /**@type {MatAutoAnswer.Option<HTMLElement>}*/
                questionDiv:
                    MatAutoAnswer.searchForElemByClass("lrn_question", div)
                        .and(MatAutoAnswer.first),
                optionsDiv:
                    MatAutoAnswer.searchForElemByClass("lrn-mcq-option", div)
            }));
        }
        /**
         * @param {MatAutoAnswer.Model} model
         * @returns {MatAutoAnswer.Question}
        */
        getLatestQuestion(model) {
            const ctx = this.context;
            if (ctx.isNone()) return MatAutoAnswer.Option.None;
            const { questionDiv, optionsDiv } = ctx.unwrap();

            const q = questionDiv.map(t => this.parseText(t).trim());
            if (q.isNone()) return MatAutoAnswer.Option.None;
            const question = q.unwrap();

            const options = [];
            if (optionsDiv.isNone()) return MatAutoAnswer.Option.None;
            for (const optionDiv of optionsDiv.unwrap()) {
                const op = MatAutoAnswer.searchForElemByClass(
                    "choice_paragraph", optionDiv
                )
                    .and(MatAutoAnswer.first)
                    .map(t => this.parseText(t).trim());
                if (op.isNone()) return MatAutoAnswer.Option.None;
                options.push(op.unwrap());
            }

            if (model === GEMINI_THINKING_NAME) {
                const prompt = "QUESTION:\n" + question + "\n\nOPTIONS:" +
                    options.map((v, i) => `ANSWER OPTION ${i + 1}: ${v}`).join("\n");
                return MatAutoAnswer.Option.Some(
                    MatAutoAnswer.Question.deferred(prompt)
                );
            }

            return MatAutoAnswer.Option.None;
        }
        /**@param {MatAutoAnswer.Answer} answer*/
        trySupply(answer) {
            const ctx = this.context;
            if (ctx.isNone()) return MatAutoAnswer.Option.Some(
                "Couldn't find current question");

            const options = [];
            const { optionsDiv } = ctx.unwrap();
            if (optionsDiv.isNone()) return MatAutoAnswer.Option.Some(
                "Couldn't find current question's options");
            for (const optionDiv of optionsDiv.unwrap()) {
                const op = MatAutoAnswer.searchForElemByClass(
                    "choice_paragraph", optionDiv
                )
                    .and(MatAutoAnswer.first)
                    .map(/**@param {HTMLElement} t*/t => ({
                        text: this.parseText(t).trim(),
                        div: optionDiv,
                    }));
                if (op.isNone()) return MatAutoAnswer.Option.Some(
                    "Couldn't find an answer choice");
                options.push(op.unwrap());
            }

            for (const option of options) {
                if (option.text == answer) {
                    MatAutoAnswer.searchForElemByClass("lrn-label", option.div)
                        .and(MatAutoAnswer.first)
                        .map(/**@param {HTMLElement} elem*/elem =>
                            elem.style.borderColor = "green");
                    return MatAutoAnswer.Option.None;
                }
            }
            console.warn("[APC.S.ANF]", options, answer);

            return MatAutoAnswer.Option.Some(
                `Generated answer '${answer}' is not one of the options!`);
        }
        /**
         * @param {MatAutoAnswer.Model} model
         * @param {MatAutoAnswer.AIResponse} response
         * @returns {MatAutoAnswer.Answer}
        */
        parseAIResponse(model, response) {
            if (model === GEMINI_THINKING_NAME) {
                // I am sorry to whoever has to figure this out...
                const result = response.match(/(\$\\boxed\{).*(\}\$)/g);
                if (!result) return MatAutoAnswer.Option.None;
                const answer = result[0].slice(8).slice(0, -2).trim();
                return MatAutoAnswer.Option.Some(answer);
            }

            return MatAutoAnswer.Option.None;
        }
        /**
         * Trims the input items.
         * @param {string} input Input to trim
         * @returns {string} Trimmed + extra space
        */
        trim(input) {
            let out = input.trim();
            if (out.startsWith(".\n") || out.startsWith(". ")) {
                out = "." + out.substring(1).trim()
            }
            return out + " "
        }
        /**
         * Recursively parses APClassroom's MathJax.
         * @param {HTMLElement} e element to parse.
         * @param {number | undefined} depth Depth ofa iteration.
         * @returns {string} the math as a string.
        */
        parseText(e, depth = 0) {
            if (depth >= 10) return "";
            let out = "";
            try {
                if (e && e.hasAttribute("aria-label")) {
                    return this.trim(e.getAttribute("aria-label"));
                }
                for (const child of e.childNodes) {
                    if (child.nodeName === "#text") {
                        out += this.trim(child.textContent);
                        out += " ";
                    } else {
                        const v = this.parseText(child, depth + 1);
                        if (v === "") continue;
                        out += v + " ";
                    }
                    out = this.trim(out);
                }
            } catch (_) { /* Ignore the error, it doesn't matter :) */ }
            return this.trim(out);
        }
        clickNext() {}
    }

    //     /**@implements {MatAutoAnswer.QuestionProvider}*/
    //     class VocabCom {
    //         /** Fetches the current question context (DIV) */
    //         get context() {
    //             return MatAutoAnswer.tryGetElemsByClass(
    //                 "challenge-slide active selected")
    //                 .and(e => MatAutoAnswer.first(e))
    //                 .and(e => MatAutoAnswer.tryGetElemsByClass("question", e))
    //                 .and(e => MatAutoAnswer.first(e))
    //         }
    //         /**
    //          * @param {MatAutoAnswer.Model} model
    //          * @returns {MatAutoAnswer.Question}
    //         */
    //         getLatestQuestion(model) {
    //             const ctx = this.context;
    //             if (ctx.isNone()) return MatAutoAnswer.Option.None;
    //             const { questionDiv, optionsDiv } = ctx.unwrap();
    // 
    //             const q = questionDiv.map(t => this.parseText(t).trim());
    //             if (q.isNone()) return MatAutoAnswer.Option.None;
    //             const question = q.unwrap();
    // 
    //             const options = [];
    //             if (optionsDiv.isNone()) return MatAutoAnswer.Option.None;
    //             for(const optionDiv of optionsDiv.unwrap()) {
    //                 const op = MatAutoAnswer.searchForElemByClass(
    //                     "choice_paragraph", optionDiv
    //                 )
    //                 .and(MatAutoAnswer.first)
    //                 .map(t => this.parseText(t).trim());
    //                 if (op.isNone()) return MatAutoAnswer.Option.None;
    //                 options.push(op.unwrap());
    //             }
    // 
    //             if (model === GEMINI_THINKING_NAME) {
    //                 const prompt = "QUESTION:\n" + question + "\n\nOPTIONS:" + 
    //                 options.map((v, i) => `ANSWER OPTION ${i+1}: ${v}`).join("\n");
    //                 return MatAutoAnswer.Option.Some(
    //                     MatAutoAnswer.Question.deferred(prompt)
    //                 );
    //             }
    // 
    //             return MatAutoAnswer.Option.None;
    //         }
    //         /**@param {MatAutoAnswer.Answer} answer*/
    //         trySupply(answer) {
    //             const ctx = this.context;
    //             if (ctx.isNone()) return MatAutoAnswer.Option.Some(
    //                 "Couldn't find current question");
    // 
    //             const options = [];
    //             const { optionsDiv } = ctx.unwrap();
    //             if (optionsDiv.isNone()) return MatAutoAnswer.Option.Some(
    //                 "Couldn't find current question's options");
    //             for(const optionDiv of optionsDiv.unwrap()) {
    //                 const op = MatAutoAnswer.searchForElemByClass(
    //                     "choice_paragraph", optionDiv
    //                 )
    //                 .and(MatAutoAnswer.first)
    //                 .map(/**@param {HTMLElement} t*/t => ({
    //                     text: this.parseText(t).trim(),
    //                     div: optionDiv,
    //                 }));
    //                 if (op.isNone()) return MatAutoAnswer.Option.Some(
    //                     "Couldn't find an answer choice");
    //                 options.push(op.unwrap());
    //             }
    // 
    //             for(const option of options) {
    //                 if (option.text == answer) {
    //                     MatAutoAnswer.searchForElemByClass("lrn-label", option.div)
    //                     .and(MatAutoAnswer.first)
    //                     .map(/**@param {HTMLElement} elem*/elem =>
    //                         elem.style.borderColor = "green");
    //                     return MatAutoAnswer.Option.None;
    //                 }
    //             }
    //             console.warn("[APC.S.ANF]", options, answer);
    // 
    //             return MatAutoAnswer.Option.Some(
    //                 `Generated answer '${answer}' is not one of the options!`);
    //         }
    //         /**
    //          * @param {MatAutoAnswer.Model} model
    //          * @param {MatAutoAnswer.AIResponse} response
    //          * @returns {MatAutoAnswer.Answer}
    //         */
    //         parseAIResponse(model, response) {
    //             if (model === GEMINI_THINKING_NAME) {
    //                 // I am sorry to whoever has to figure this out...
    //                 const result = response.match(/(\$\\boxed\{).*(\}\$)/g);
    //                 if(!result) return MatAutoAnswer.Option.None;
    //                 const answer = result[0].slice(8).slice(0, -2).trim();
    //                 return MatAutoAnswer.Option.Some(answer);
    //             }
    // 
    //             return MatAutoAnswer.Option.None;
    //         }
    //         /**
    //          * Trims the input items.
    //          * @param {string} input Input to trim
    //          * @returns {string} Trimmed + extra space
    //         */
    //         trim(input) {
    //             let out = input.trim();
    //             if (out.startsWith(".\n") || out.startsWith(". ")) {
    //                 out = "." + out.substring(1).trim()
    //             }
    //             return out + " "
    //         }
    //         /**
    //          * Recursively parses APClassroom's MathJax.
    //          * @param {HTMLElement} e element to parse.
    //          * @param {number | undefined} depth Depth ofa iteration.
    //          * @returns {string} the math as a string.
    //         */
    //         parseText(e, depth = 0) {
    //             if (depth >= 10) return "";
    //             let out = "";
    //             try {
    //                 if (e && e.hasAttribute("aria-label")) {
    //                     return this.trim(e.getAttribute("aria-label"));
    //                 }
    //                 for(const child of e.childNodes) {
    //                     if (child.nodeName === "#text") {
    //                         out += this.trim(child.textContent);
    //                         out += " ";
    //                     } else {
    //                         const v = this.parseText(child, depth + 1);
    //                         if (v === "") continue;
    //                         out += v + " ";
    //                     }
    //                     out = this.trim(out);
    //                 }
    //             } catch(_){ /* Ignore the error, it doesn't matter :) */ }
    //             return this.trim(out);
    //         }
    //     }

    env.addQuestionProvider(/apclassroom\.collegeboard\.org/,
        new APClassroom());
    // env.addQuestionProvider(/vocabulary\.com/,
    //     new VocabCom(), GEMINI_FAST_NAME);

    env.addAIModel(GEMINI_THINKING_NAME, (prompt, token) =>
        GeminiMultipleChoice(GEMINI_THINKING_ID, prompt, token));
    env.addAIModel(GEMINI_FAST_NAME, (prompt, token) =>
        GeminiMultipleChoice(GEMINI_FAST_ID, prompt, token));
});

/** The UI Aspect */
MatAutoAnswer(env => {
    let panicmode = false;

    let div = document.getElementById(MatAutoAnswer.name);
    if (!div) {
        div = document.createElement("div");
        document.body.appendChild(div);
    }
    else div.textContent = "";
    div.id = MatAutoAnswer.name;
    div.style.borderBottomRightRadius = "10px";
    div.style.backgroundColor = "gray";
    div.style.position = "absolute";
    div.style.padding = "10px";
    div.style.height = "100px";
    div.style.zIndex = "999999";
    div.style.width = "300px";
    div.style.opacity = "0";
    div.style.left = "0px";
    div.style.top = "0px";

    document.addEventListener("keydown", async function (e) {
        if (panicmode) return;
        if (e.code === "Delete") {
            console.warn("PANIC MODE ACTIVATED!");
            div.style.opacity = "0";
            panicmode = true;
            return;
        }
        if (e.code !== "Insert") return;
        if (e.ctrlKey) {
            if (div.style.opacity !== "0") div.style.opacity = "0";
            else div.style.opacity = "1";
            return;
        }
        await env.call()
    });

    const selector = document.createElement("select");
    selector.setAttribute("align", "center");
    selector.style.margin = "5px";
    selector.oninput = () => env.model = selector.value;
    for (const modelName of env.models) {
        const option = document.createElement("option");
        option.value = modelName;
        option.text = modelName;
        selector.appendChild(option);
    }
    div.appendChild(selector);

    const textbox = document.createElement("input");
    textbox.setAttribute("align", "center");
    textbox.style.margin = "5px";
    textbox.oninput = () => env.token = textbox.value;
    textbox.type = "password";
    div.appendChild(textbox);

    selector.oninput(void 0);
    textbox.oninput(void 0);
});
