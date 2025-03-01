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

/// <reference lib = "DOM" />

/**
 * # Mat's Auto-Answer Multi-tool.
 * 
 * This is the main entry-point of the utility.
 * It takes a {@link fn Function parameter},
 * which in itself takes a shared instance of
 * {@link MatAutoAnswer.MatAutoAnswerEnv env}.
 * That means that even if this method is called multiple times,
 * the environment will be persistent.
 * 
 * ### Examples of the setup phase
 * 
 * Example adding an AI model:
 * 
 * ```js
 * MatAutoAnswer(env => {
 *     env.addAIModel("My AI", function(prompt, token) {
 *         // Code here...
 *     });
 * });
 * ```
 * 
 * Example adding a new question provider:
 * 
 * ```js
 * MatAutoAnswer(env => {
 *     class TestExampleCom {
 *         getLatestQuestion(model) {
 *             // Get the question by parsing the site...
 *             
 *             // If the question does not need AI to be answered:
 *             // return MatAutoAnswer.Option.Some(
 *             //     MatAutoAnswer.Question.immediate("Answer")
 *             // );
 *             
 *             // If the question requires AI intervention:
 *             return MatAutoAnswer.Option.Some(
 *                 MatAutoAnswer.Question.deferred("AI Prompt")
 *             );
 *         }
 *         trySupply(answer) {
 *             // Supply the answer, or highlight it.
 *         }
 *         parseAIResponse(model, response) {
 *             // Parse AI response and return the answer.
 *             return `${model} suggests: ${response}`;
 *         }
 *         clickNext() {
 *             // If possible, click and go to the next question.
 *         }
 *     }
 * 
 *     env.addQuestionProvider(/tests\.example\.com/, new TestExampleCom());
 * });
 * ```
 * 
 * ### Examples of the UI phase
 * 
 * Example listening for keyboard input to call the magic function:
 * 
 * ```js
 * MatAutoAnswer(env => {
 *     document.addEventListener("keydown", async function (e) {
 *         if (e.code !== "Insert") return;
 *         await env.call();
 *     });
 * });
 * ```
 * 
 * @param fn invocation closure.
*/
declare function MatAutoAnswer(
    fn: (env: MatAutoAnswer.MatAutoAnswerEnv) => void
): void;
declare namespace MatAutoAnswer {
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
    type _Indexable<T> = { [index: number]: T; }
    /**
     * # **DO NOT USE**
     * 
     * This does not actually exist, but rather is used for type-hinting.
     * 
     * @private
    */
    type _S = "Some" | "None" | "ANY";
    /**
     * # **DO NOT USE**
     * 
     * This does not actually exist, but rather is used for type-hinting.
     * 
     * @private
    */
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
    /**
     * # **DO NOT USE**
     * 
     * This does not actually exist, but rather is used for type-hinting.
     * 
     * @private
    */
    type _Flatten<
        T,
        _V extends _S = "ANY",
        _V2 extends _S = "ANY",
    > = _And<T, _V, _V2>; // Rare circumstance, don't count on it :)

    /** The version of the current library */
    export type Version = "v6b-dev";
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
    /**
     * The environment / state of the multi-tool.
     * 
     * As an developer/maintainer of this multi-tool,
     * feel free to call any method necessary.
     * 
     * Useful methods during the setup phase:
     * - {@link addQuestionProvider}: Adds support for a new platform.
     * - {@link addAIModel}: Adds support for a new AI Model.
     * 
     * Useful methods for the UI phase:
     * - {@link token}: Gets/Sets the current AI token.
     * - {@link model}: Gets/Sets the current AI Model.
     * - {@link models}: Gets the list of all AI Models.
     * - {@link clickNextTimeout}: Gets/Sets the time between clicking next.
     * - {@link call}: The function that does all the "magic".
    */
    export interface MatAutoAnswerEnv {
        /** A list of all AI Models added using {@link addAIModel}. */
        readonly models: Model[];
        /**
         * The function that does all the magic, this returns a promise,
         * that you can either invoke once, or repeatedly.
         * 
         * This is almost always going to be called from the UI phase.
        */
        call(): Promise<void>;
        /**
         * Adds a new question provider / platform.
         * 
         * Every time that {@link call} is invoked, {@link hostname} will be
         * regex-matched the on the current [`document.location.origin`](
         * https://developer.mozilla.org/docs/Web/API/Location/origin).
         * 
         * @param hostname Regex-like pattern that will be matched
         * @param provider 
        */
        addQuestionProvider(
            hostname: string | RegExp,
            provider: QuestionProvider
        ): void;
        addAIModel(modelName: Model, modelFunc: AIModel): void;
        get token(): Option<Token>;
        set token(token: Token | undefined | Option<Token>);
        get model(): Option<Model>;
        set model(id: Model | undefined | Option<Model>);
        get clickNextTimeout(): Option<Timeout>;
        set clickNextTimeout(timeout: Timeout | undefined | Option<Timeout>);
    }
    /**
     * A basic interface for all questions.
     * 
     * As an end-user, the only APIs you should be worried about are:
     * {@link QuestionConstructor.immediate `Question.immediate`},
     * which is to be used if no AI is needed to answer the quesion;
     * or {@link QuestionConstructor.deferred `Question.deferred`},
     * which is what you should use if AI is needed to answer the question.
     * 
     * DO NOT EXTEND THIS INTERFACE DIRECTLY.
     * 
     * If a question does NOT require AI,
     * it must extend {@link ImmediatelyAnswerableQuestion}.
     * Otherwise, it assumed to be a superset of {@link DeferedQuestion}.
    */
    export interface Question<RequiresAI extends boolean = boolean> {
        /**
         * Wether or not AI is required.
         * 
         * **Implementation detail:**
         * 
         * If this is false, then it is assumed that the type is a superset of
         * {@link ImmediatelyAnswerableQuestion}.
         * Otherwise it is assumed to be a superset of
         * {@link DeferedQuestion}.
        */
        readonly requiresAI: RequiresAI;
    }
    /**
     * An interface that signals that the question is immediatly answerable.
     * 
     * DO NOT EXTEND THIS INTERFACE DIRECTLY.
     * 
     * Use {@link QuestionConstructor.immediate `Question.immediate`} to
     * construct new instances of answers to questions that do not require AI.
    */
    export interface ImmediatelyAnswerableQuestion extends Question<false> {
        /** An immediate answer to the question: AI will not be prompted. */
        readonly answer: Answer;
    }
    /**
     * An interface that signals that the question requires AI to be answered.
     * 
     * DO NOT EXTEND THIS INTERFACE DIRECTLY.
     * 
     * Use {@link QuestionConstructor.deferred `Question.deferred`} to
     * construct new instances of answers to questions that do require AI.
    */
    export interface DeferedQuestion extends Question<true> {
        /**
         * A prompt that will be provided to an AI model,
         * after which the {@link AIResponse response} is to be parsed by
         * the {@link QuestionProvider provider} via the
         * {@link QuestionProvider.parseAIResponse parseAIResponse} method.
        */
        readonly prompt: Prompt;
    }
    export interface QuestionConstructor {
        immediate(answer: Answer): ImmediatelyAnswerableQuestion;
        deferred(prompt: Prompt): DeferedQuestion;
    }
    export interface QuestionProvider {
        /**
         * This method will automatically be called on the question provider.
         * 
         * This is a method that is required to return an {@link Option}.
         * It is to be the latest question,
         * or {@link Option.None None} if it could not be found.
         * 
         * @param model Currently selected {@link Model AI Model}.
         * @returns A potential latest question.
        */
        getLatestQuestion(model: Model): Option<Question>;
        trySupply(answer: Answer): Option<Err>;
        parseAIResponse(
            model: Model,
            response: AIResponse
        ): Option<Answer>;
        clickNext(): void;
    }
    /**
     * A function representing a handler for AI Models.
     * Basically, the end user will be calling this function,
     * by providing a `token`, as well as the `prompt`.
     * The entire job of this function is to in some way,
     * communicate with the AI Model (over HTTP for example),
     * and return a Promise of the AI's response.
    */
    export type AIModel = (
        prompt: Prompt,
        token: Token
    ) => Promise<Option<AIResponse>>;
    /**
     * A safe construct for handling potentially missing values.
     * 
     * Think of this as Haskel's `Maybe` type.
     * 
     * You can construct a new Option using {@link Option.Some Some}
     * where you have some data.
     * Or if you don't have a value, you can use {@link Option.None None}.
    */
    export interface Option<T, _V extends _S = "ANY"> {
        /** Wether or not the Option is a {@link Option.Some Some} variant. */
        get isSome():
            _V extends "ANY" ? boolean :
                _V extends "Some" ? true : false;
        /** Wether or not the Option is a {@link Option.None None} variant. */
        get isNone():
            _V extends "ANY" ? boolean :
                _V extends "None" ? true : false;
        /**
         * Unwraps the Option,
         * assuming that it is a {@link Option.Some Some} variant.
         * 
         * This can be used for both quick prototyping,
         * and also in production assuming you check via
         * {@link Option.isSome isSome} or
         * {@link Option.isNone isNone} beforehand.
         * 
         * Do watch out, this may throw an error,
         * but if it does throw, then you are doing something wrong.
         * 
         * @throws If the option is {@link Option.None None}.
         * @returns the Option's inner value.
        */
        unwrap():
            _V extends "Some" ? T :
                _V extends "ANY" ? T | never : never;
        /**
         * Either unwraps the inner value, or returns the {@link other} value.
         * 
         * @param other Value that will be returned if the option is None.
         * @returns Some value, either Option's inner, or {@link other}.
        */
        unwrapOr(other: T): T;
        /**
         * Essentially {@link Option.unwrap unwrap},
         * but you can pass your own error message.
         * 
         * @param msg Message to pass
         */
        expect(...msg: string[]):
            _V extends "ANY" ? T | never :
                _V extends "Some" ? T : never;
        /**
         * Maps the inner value of the option by calling {@link fn} on it.
         * If the options is none, then nothing is done
         * 
         * @param fn function that will be called on the option's inner value.
         * @returns an new option with the inner value changed.
        */
        map<O>(fn: (self: T) => O): Option<O, _V>;
        /**
         * Basically {@link Option.map map},
         * except the inner function is allowed to return an option itself.
         * 
         * This is especially useful for getting the first element in arrays:
         * 
         * ```js
         * const first = Option.Some([3, 2, 1]).and(MatAutoAnswer.first);
         * console.log(first); // 3
         * ```
         * 
         * @param fn function that will be called on the option's inner value.
         * @returns an new option with the inner value changed.
        */
        and<O, _VO extends _S>(
            fn: (self: T) => Option<O, _VO>
        ): _And<O, _V, _VO>;
        /**
         * Flattens a double option into one.
         * 
         * Basically turns `Option<Option<T>>` -> `Option<T>`.
         * 
         * @returns A flattened variant of this option
        */
        flatten<_V2 extends _S>(
            this: Option<Option<T, _V2>, _V>
        ): _Flatten<T, _V, _V2>;
    }
    /** Statically accessable items of any {@link Option}. */
    export interface OptionConstructor {
        /**
         * Creates a new {@link Option} with some data filled in.
         * Example:
         * 
         * ```js
         * const val = MatAutoAnswer.Option.Some("Value!");
         * ```
         * 
         * @template T Type of the Option's value
         * @param {T} value Value to wrap in the option.
        */
        Some<T>(value: T): Option<T, "Some">;
        /**
         * An empty {@link Option}.
         * Example:
         * 
         * ```js
         * const val = MatAutoAnswer.Option.None;
         * ```
        */
        // deno-lint-ignore no-explicit-any
        readonly None: Option<any, "None">;
    }
    /**
     * Basically the better version of {@link document.getElementsByClassName}.
     * 
     * This variant starts looking from the
     * {@link from specified} parent element.
     * 
     * @param classNames List of class names to look for.
     * @param from what element to use as parent.
     * @returns An {@link Option} of Html Elements.
    */
    export function tryGetElemsByClass(
        classNames: string,
        from: Element
    ): Option<HTMLCollectionOf<Element>>;
    /**
     * Basically the better version of {@link document.getElementsByClassName}.
     * 
     * This variant starts looks through all elements of the document.
     * 
     * @param classNames List of class names to look for.
     * @returns An {@link Option} of Html Elements.
    */
    export function tryGetElemsByClass(
        classNames: string
    ): Option<HTMLCollectionOf<Element>>;
    /**
     * Retrieves the first element of an
     * {@link HTMLCollectionOf<Element> HTMLCollection}.
     * 
     * @param list list of {@link Element Element}s
    */
    export function first(list: HTMLCollectionOf<Element>): Option<Element>;
    /**
     * Retrieves the first element of any number-indexable object
     * (including arrays).
     * 
     * @param indexable Indexable object to look in.
    */
    export function first<T>(indexable: _Indexable<T>): Option<T>;
    /**
     * Creates a function that iterates over a collection,
     * applying {@link fn} to each,
     * to check wether or not that is the element that you are searching for.
     * The way it determines "correctness" is if {@link fn} returns true.
     * This function produces another function,
     * which will find the first occurance of the "correct" value,
     * and return it wrapped in an option.
     * 
     * @param fn function deteriming "correctness"
     * @returns The function that will iterate and check for "correctness"
    */
    export function find<T>(fn: (item: T) => boolean): typeof first<T>;
    /**
     * Basically like {@link first}, except for you can specify the index.
     * 
     * @param index index to search for
     * @returns The function that will iterate until {@link index}.
    */
    export function nth<T>(index: number): typeof first<T>;
    export const Question: QuestionConstructor;
    export const Option: OptionConstructor;
    /** The name and version of the multi-tool. */
    export const name: `Mat's Auto Answer Multi-tool ${Version}`;
}
