/**
 * `TaskNomad<Effect, Value>` represents an asynchronous that never fails.
 *
 * @since 1.0.0
 */

import {Applicative2} from "fp-ts/Applicative";
import {Monad2} from "fp-ts/Monad";
import {flow, Lazy, pipe} from "fp-ts/function";
import {Functor2} from "fp-ts/Functor";
import {bind_, bindTo_} from "./bind";
import * as T from "fp-ts/Task";
import * as N from "./Nomad";
import {Semigroup} from "fp-ts/Semigroup";

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------
import Task = T.Task;
import Nomad = N.Nomad;

/**
 * @category model
 * @since 1.0.0
 */
export interface TaskNomad<Effect, Value> extends Task<Nomad<Effect, Value>> {
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * Constructs a new Nomad holding the given value with an empty list of effects.
 *
 * @category constructors
 * @since 1.0.0
 */
export const pure = <Effect = never, Value = never>(value: Value): TaskNomad<Effect, Value> => T.of(N.pure(value));

/**
 * @category constructors
 * @since 1.0.0
 */
export const fromTask: <Effect = never, Value = never>(ma: Task<Value>) => TaskNomad<Effect, Value> =
    /*#__PURE__*/
    T.map(N.pure)

/**
 * @category constructors
 * @since 1.0.0
 */
export const fromNomad: <Effect = never, Value = never>(ma: Nomad<Effect, Value>) => TaskNomad<Effect, Value> =
    /*#__PURE__*/
    T.of

/**
 * Constructs a new TaskNomad given an effect and an existing TaskNomad.
 *
 * @category constructors
 * @since 1.0.0
 */
export const effect = <Effect>(eff: Effect): <Value>(f: TaskNomad<Effect, Value>) => TaskNomad<Effect, Value> =>
    T.map(N.effect(eff));

/**
 * Constructs a new TaskNomad given a lazy effect and an existing TaskNomad.
 *
 * @category constructors
 * @since 1.0.0
 */
export const effectL = <Effect>(eff: Lazy<Effect>): <Value>(f: TaskNomad<Effect, Value>) => TaskNomad<Effect, Value> =>
    T.map(N.effectL(eff));

/**
 * Constructs a new TaskNomad given an effect constructor and an existing TaskNomad.
 *
 * @category constructors
 * @since 1.0.0
 */
export const effectV = <Effect, Value>(eff: (val: Value) => Effect): (f: TaskNomad<Effect, Value>) => TaskNomad<Effect, Value> =>
    T.map(N.effectV(eff));

/**
 * Constructs a new TaskNomad given a list of effects and an existing TaskNomad.
 *
 * @category constructors
 * @since 1.0.0
 */
export const effects = <Effect>(effs: ReadonlyArray<Effect>): <Value>(f: TaskNomad<Effect, Value>) => TaskNomad<Effect, Value> =>
    T.map(N.effects(effs));

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

/**
 * `map` can be used to turn functions `(a: Left) => Left` into functions `(fa: F<Left>) => F<Left>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * Here, `map` can be used to transform the value held by an instance of `Nomad` without changing the effects
 *
 * @category Functor
 * @since 1.0.0
 */
export const map = <Value, Value2>(f: (a: Value) => Value2): <Effect>(fa: TaskNomad<Effect, Value>) => TaskNomad<Effect, Value2> =>
    T.map(N.map(f))

/**
 * Less strict version of [`ap`](#ap).
 *
 * @category Apply
 * @since 1.0.0
 */
export const apW = <Effect, Value>(fa: TaskNomad<Effect, Value>): <Value2>(fab: TaskNomad<Effect, (a: Value) => Value2>) => TaskNomad<Effect, Value2> =>
    flow(
        T.map(gab => (ga: Nomad<Effect, Value>) => N.apW(ga)(gab)),
        T.ap(fa),
    )

/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 1.0.0
 */
export const ap: <Effect, Value>(fa: TaskNomad<Effect, Value>) =>
    <Value2>(fab: TaskNomad<Effect, (a: Value) => Value2>) =>
        TaskNomad<Effect, Value2> = apW;

/**
 * Wrap a value into the type constructor.
 *
 * Equivalent to [`pure`](#pure).
 *
 * @example
 * import * as TN from "nomad/TaskNomad"
 *
 * assert.deepStrictEqual(TN.of("a"), TN.pure("a"))
 *
 * @category Applicative
 * @since 1.0.0
 */
export const of: Applicative2<URI>["of"] = pure;

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 1.0.0
 */
export const chain = <Effect, Value, Value2>(f: (a: Value) => TaskNomad<Effect, Value2>): (ma: TaskNomad<Effect, Value>) => TaskNomad<Effect, Value2> =>
    T.chain((a: Nomad<Effect, Value>): TaskNomad<Effect, Value2> => pipe(
        f(a.value),
        T.map((ab: Nomad<Effect, Value2>) => N.chain(() => ab)(a)),
    ))

// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------

const map_: Monad2<URI>["map"] = (fa, f) => pipe(fa, map(f))
const ap_: Monad2<URI>["ap"] = (fab, fa) => pipe(fab, ap(fa))
const chain_: Monad2<URI>["chain"] = (ma, f) => pipe(ma, chain(f))

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 1.0.0
 */
export const URI = "TaskNomad";

/**
 * @category instances
 * @since 1.0.0
 */
export type URI = typeof URI

declare module "fp-ts/lib/HKT" {
    interface URItoKind2<E, A> {
        readonly [URI]: TaskNomad<E, A>
    }
}

/**
 * Constructs a new Nomad where the inner values are concatenated using the provided `Semigroup`
 *
 * @example
 * import * as N from "nomad/Nomad"
 * import * as TN from "nomad/TaskNomad"
 * import { semigroupSum } from "fp-ts/Semigroup"
 *
 * const S = TN.getSemigroup<string, number>(semigroupSum)
 *
 * const nomad1 = pipe(
 *   TN.pure(1),
 *   TN.effect("one"),
 * )
 * const nomad2 = pipe(
 *   TN.pure(2),
 *   TN.effect("two"),
 * )
 *
 * const expected = pipe(
 *   N.pure(3),
 *   N.effect("one"),
 *   N.effect("two"),
 * )
 *
 * const actual = S.concat(nomad1, nomad2)
 *
 * assert.deepStrictEqual(await actual(), expected)
 *
 * @category instances
 * @since 1.0.0
 */
export const getSemigroup = <Effect, Value>(S: Semigroup<Value>): Semigroup<TaskNomad<Effect, Value>> =>
    T.getSemigroup(N.getSemigroup(S));

/**
 * @category instances
 * @since 1.0.0
 */
export const Functor: Functor2<URI> = {
    URI,
    map: map_
}

/**
 * @category instances
 * @since 1.0.0
 */
export const Applicative: Applicative2<URI> = {
    URI,
    map: map_,
    ap: ap_,
    of
}

/**
 * @category instances
 * @since 1.0.0
 */
export const Monad: Monad2<URI> = {
    URI,
    map: map_,
    ap: ap_,
    of,
    chain: chain_
}

/**
 * @category instances
 * @since 1.0.0
 */
export const taskNomad: Monad2<URI> = {
    URI,
    map: map_,
    of,
    ap: ap_,
    chain: chain_,
}

// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------

/**
 * @since 1.0.0
 */
export const Do: TaskNomad<never, {}> = of({})

/**
 * @since 1.0.0
 */
export const bindTo = <Key extends string>(name: Key): <Effect, Value>(fa: TaskNomad<Effect, Value>) => TaskNomad<Effect, { [K in Key]: Value }> =>
    map(bindTo_(name))

/**
 * @since 1.0.0
 */
export const bindW = <Key extends string, Value, Effect, Value2>(
    name: Exclude<Key, keyof Value>,
    f: (a: Value) => TaskNomad<Effect, Value2>
): ((fa: TaskNomad<Effect, Value>) => TaskNomad<Effect, { [K in keyof Value | Key]: K extends keyof Value ? Value[K] : Value2 }>) =>
    chain((a) =>
        pipe(
            f(a),
            map((b) => bind_(a, name, b))
        )
    )

/**
 * @since 1.0.0
 */
export const bind: <Key extends string, Value, Effect, Value2>(
    name: Exclude<Key, keyof Value>,
    f: (a: Value) => TaskNomad<Effect, Value2>
) => (fa: TaskNomad<Effect, Value>) => TaskNomad<Effect, { [K in keyof Value | Key]: K extends keyof Value ? Value[K] : Value2 }> = bindW
