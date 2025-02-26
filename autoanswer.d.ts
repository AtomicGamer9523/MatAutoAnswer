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

/**
 * Runs Mat's Auto-Answer Multi-tool.
 * 
 * @param {(env: MatAutoAnswer.MatAutoAnswerEnv) => void} fn invocation closure.
*/
declare function MatAutoAnswer(
    fn: (env: MatAutoAnswer.MatAutoAnswerEnv) => void
): void;

declare namespace MatAutoAnswer {
    /** The version of the current library */
    export type Version = "v6-dev";
    /**
     * # **DO NOT USE**
     * 
     * This does not actually exist, but rather is used for type-hinting.
     * 
     * @private
    */
    interface _Guard<ID extends string> {
        /**
         * # **DO NOT USE**
         * 
         * This does not actually exist, but rather is used for type-hinting.
         * 
         * @private
        */
        readonly __GUARD__: ID | never;
    }
    /**
     * # **DO NOT USE**
     * 
     * This does not actually exist, but rather is used for type-hinting.
     * 
     * @private
    */
    type _Indexable<T> = { [index: number]: T }
    /** Guards a certain type, this is only useful for type-hinting. */
    export type Guard<T, ID extends string> = T & _Guard<ID>;

    /** An AI-Response type. Essentially a {@link string} */
    export type AIResponse = Guard<string, "AIResponse">;
    /** An AI-Prompt type. Essentially a {@link string} */
    export type Prompt = Guard<string, "Prompt">;
    /** A Question's Answer type. Essentially a {@link string} */
    export type Answer = Guard<string, "Answer">;
    /** An AI-Model Access Token. Essentially a {@link string} */
    export type Token = Guard<string, "Token">;
    /** An AI-Model Name/ID. Essentially a {@link string} */
    export type Model = Guard<string, "Model">;
    /** An Error type. Essentially a {@link string} */
    export type Err = Guard<string, "Err">;
    /** A Timeout number type. Essentially a {@link number} */
    export type Timeout = Guard<number, "Timeout">;

    type _DSConfigurable = "c" | "c+" | "c-";
    type _DSEnumerable = "e" | "e+" | "e-";
    type _DSWritable = "w" | "w+" | "w-";
    export type DefSettings =
        _DSConfigurable | _DSEnumerable | _DSWritable |
        `${_DSConfigurable}${_DSEnumerable}` |
        `${_DSConfigurable}${_DSWritable}` |
        `${_DSEnumerable}${_DSWritable}` |
        `${_DSConfigurable}${_DSEnumerable}${_DSWritable}`;

    export interface MatAutoAnswerEnv {
        call(): Promise<void>;
        addQuestionProvider(
            hostname: string | RegExp,
            provider: QuestionProvider
        ): this;
        addAIModel(modelName: Model, modelFunc: AIModel): this;
        get token(): Option<Token>;
        set token(token: Token | undefined | Option<Token>);
        get model(): Option<Model>;
        set model(id: Model | undefined | Option<Model>);
        get models(): Model[];
        get clickNextTimeout(): Option<Timeout>;
        set clickNextTimeout(timeout: Timeout | undefined | Option<Timeout>);
    }

    /**
     * A basic interface for all questions.
     * 
     * If a question does NOT require AI,
     * it must extend {@link ImmediatelyAnswerableQuestion}!
     * Otherwise, it must to extend {@link DeferedQuestion}!
     * It can not be by itself!
    */
    export interface Question<RequiresAI extends boolean = boolean> {
        /** @returns Wether or not AI is required. */
        readonly requiresAI: RequiresAI;
    }
    /** Extend this if the question is immediatly answerable without AI. */
    export interface ImmediatelyAnswerableQuestion extends Question<false> {
        readonly answer: Answer;
    }
    /** Extend this if AI is required to answer the question. */
    export interface DeferedQuestion extends Question<true> {
        readonly prompt: Prompt;
    }
    export interface QuestionConstructor {
        immediatelyAnswerable(answer: Answer): ImmediatelyAnswerableQuestion;
        deferred(prompt: Prompt): DeferedQuestion;
    }
    export interface QuestionProvider {
        /**
         * This method will automatically be called on the question provider.
         * 
         * This is a method that is required to return a {@link Question}.
         * It is to be the latest question
         * 
         * @param {Model} model Currently selected {@link Model AI Model}.
         * @returns {Question} Latest question.
         */
        getLatestQuestion(model: Model): Option<Question>;
        trySupply(answer: Answer): Option<Err>;
        parseAIResponse(
            model: Model,
            response: AIResponse
        ): Option<Answer>;
        clickNext(): void;
    }

    export type AIModel = (
        prompt: Prompt,
        token: Token
    ) => Promise<Option<AIResponse>>;
    export namespace Option {
        type _S = "Some" | "None" | "ANY";
        type _And<
            O,
            _V extends _S = "ANY",
            _V2 extends _S = "ANY",
        > = 
            _V extends "Some" ? 
                _V2 extends "Some" ?
                    Option<O, "Some"> :
                Option<O, "None"> :
            Option<O, "None">;
        
        type _Flatten<
            T,
            _V extends _S = "ANY",
            _V2 extends _S = "ANY",
        > = _And<T, _V, _V2>; // Rare circumstance, don't count on it :)
    
        interface _Option<T, _V extends _S = "ANY"> {
            isSome():
                _V extends "ANY" ? boolean :
                    _V extends "Some" ? true : false;
            isNone():
                _V extends "ANY" ? boolean :
                    _V extends "None" ? true : false;
            unwrap():
                _V extends "Some" ? T :
                    _V extends "ANY" ? T | never : never;
            unwrapOr(other: T): T;
            expect(msg: string):
                _V extends "ANY" ? T | never :
                    _V extends "Some" ? T : never;
            map<O>(fn: (self: T) => O): Option<O, _V>;
            and<O, _VO extends _S>(
                other: (self: T) => Option<O, _VO>
            ): _And<O, _V, _VO>;
            flatten<_V2 extends _S>(
                this: Option<Option<T, _V2>, _V>
            ): _Flatten<T, _V, _V2>;
        }
        export type Some<T> = _Option<T, "Some">;
        export function Some<T>(v: T): Some<T>;
        export type None<T> = _Option<T, "None">;
        export const None: None<any>;
    }
    export type Option<T, _V extends Option._S = "ANY"> = 
        _V extends "Some" ? Option.Some<T> :
        _V extends "None" ? Option.None<T> :
        Option.Some<T> | Option.None<T>;
    export function tryGetElemsByClass(
        classNames: string,
        from: Element
    ): Option<HTMLCollectionOf<Element>>;
    export function tryGetElemsByClass(
        classNames: string
    ): Option<HTMLCollectionOf<Element>>;
    export function findFn<T>(
        f: (item: T) => boolean
    ): (items: T[]) => Option<T>;
    export function first(c: HTMLCollectionOf<Element>): Option<Element>;
    export function first<T>(indexable: _Indexable<T>): Option<T>;
    export function nth<T>(n: number): typeof first<T>;
    export function def<T>(
        name: string, type: T
    ): void;
    export function def<T>(
        name: string, type: T,
        settings: DefSettings
    ): void;
    export function def<T, S>(
        name: string, type: T,
        scope: S
    ): void;
    export function def<T, S>(
        name: string, type: T,
        settings: DefSettings,
        scope: S
    ): void;
    export const Question: QuestionConstructor;
    export const name: `Mat's Auto Answer Multi-tool ${Version}`;
}
