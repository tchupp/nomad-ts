import {Applicative2} from "fp-ts/Applicative";
import {Eq} from "fp-ts/Eq";
import {Functor2} from "fp-ts/Functor";
import {Lazy, pipe} from "fp-ts/function";
import {Monad2} from "fp-ts/lib/Monad";
import {getEq as getEqArray} from "fp-ts/ReadonlyArray";
import {Semigroup} from "fp-ts/Semigroup";
import {bind_, bindTo_} from "./bind";

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 1.0.0
 */
export type Nomad<Effect, Value> = {
    readonly effects: ReadonlyArray<Effect>
    readonly value: Value
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
export const pure = <Effect = never, Value = never>(value: Value): Nomad<Effect, Value> => ({effects: [], value});

/**
 * Constructs a new Nomad given an effect and an existing Nomad.
 *
 * @category constructors
 * @since 1.0.0
 */
export const effect = <Effect>(eff: Effect) => <Value>(f: Nomad<Effect, Value>): Nomad<Effect, Value> => ({
    effects: f.effects.concat([eff]),
    value: f.value,
});

/**
 * Constructs a new Nomad given a lazy effect and an existing Nomad.
 *
 * @category constructors
 * @since 1.0.0
 */
export const effectL = <Effect>(eff: Lazy<Effect>) => <Value>(f: Nomad<Effect, Value>): Nomad<Effect, Value> => ({
    effects: f.effects.concat([eff()]),
    value: f.value,
});

/**
 * Constructs a new Nomad given an effect constructor and an existing Nomad.
 *
 * @category constructors
 * @since 1.0.0
 */
export const effectV = <Effect, Value>(eff: (val: Value) => Effect) => (f: Nomad<Effect, Value>): Nomad<Effect, Value> => ({
    effects: f.effects.concat([eff(f.value)]),
    value: f.value,
});

/**
 * Constructs a new Nomad given a list of effects and an existing Nomad.
 *
 * @category constructors
 * @since 1.0.0
 */
export const effects = <Effect>(effs: ReadonlyArray<Effect>) => <Value>(f: Nomad<Effect, Value>): Nomad<Effect, Value> => ({
    effects: f.effects.concat(effs),
    value: f.value,
});

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
export const map: <Value, Value2>(f: (a: Value) => Value2) => <Effect>(fa: Nomad<Effect, Value>) => Nomad<Effect, Value2> =
    (f) => (fa) => ({
        effects: fa.effects,
        value: f(fa.value)
    });

/**
 * Less strict version of [`ap`](#ap).
 *
 * @category Apply
 * @since 1.0.0
 */
export const apW: <Effect, Right>(fa: Nomad<Effect, Right>) => <Right2>(fab: Nomad<Effect, (a: Right) => Right2>) => Nomad<Effect, Right2> =
    (fa) => (fab) => ({
        effects: fa.effects.concat(fab.effects),
        value: fab.value(fa.value),
    });

/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 1.0.0
 */
export const ap: <Effect, Right>(fa: Nomad<Effect, Right>) => <Right2>(fab: Nomad<Effect, (a: Right) => Right2>) => Nomad<Effect, Right2> = apW;

/**
 * Wrap a value into the type constructor.
 *
 * Equivalent to [`pure`](#pure).
 *
 * @example
 * import * as N from "nomad/Nomad"
 *
 * assert.deepStrictEqual(N.of("a"), N.pure("a"))
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
export const chain: <Effect, A, B>(f: (a: A) => Nomad<Effect, B>) => (ma: Nomad<Effect, A>) => Nomad<Effect, B> =
    (f) => ma => {
        const mb = f(ma.value);
        return {
            effects: ma.effects.concat(mb.effects),
            value: mb.value,
        };
    }


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
export const URI = "Nomad";


/**
 * @category instances
 * @since 1.0.0
 */
export type URI = typeof URI

declare module "fp-ts/lib/HKT" {
    interface URItoKind2<E, A> {
        readonly [URI]: Nomad<E, A>
    }
}

/**
 * @category instances
 * @since 1.0.0
 */
export const getEq = <Effect, Value>(eqEffect: Eq<Effect>, eqValue: Eq<Value>): Eq<Nomad<Effect, Value>> => ({
    equals(x, y) {
        if (x === y) {
            return true
        }

        const eqArray = getEqArray(eqEffect);
        return eqArray.equals(x.effects, y.effects) && eqValue.equals(x.value, y.value);
    }
});

/**
 * Constructs a new Nomad where the inner values are concatenated using the provided `Semigroup`
 *
 * @example
 * import { getSemigroup, pure, effect } from "nomad/Nomad"
 * import { semigroupSum } from "fp-ts/Semigroup"
 *
 * const S = getSemigroup<string, number>(semigroupSum)
 * assert.deepStrictEqual(S.concat(pure(1), pure(2)), pure(3))
 *
 * const nomad1 = pipe(
 *   pure(1),
 *   effect("one"),
 * )
 * const nomad2 = pipe(
 *   pure(2),
 *   effect("two"),
 * )
 *
 * const expected = pipe(
 *   pure(3),
 *   effect("one"),
 *   effect("two"),
 * )
 *
 * assert.deepStrictEqual(S.concat(nomad1, nomad2), expected)
 *
 * @category instances
 * @since 1.0.0
 */
export const getSemigroup = <E, A>(S: Semigroup<A>): Semigroup<Nomad<E, A>> => ({
    concat: (x, y) => ({
        effects: x.effects.concat(y.effects),
        value: S.concat(x.value, y.value),
    })
});

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
export const nomad: Monad2<URI> = {
    URI,
    map: map_,
    ap: ap_,
    of,
    chain: chain_
}

// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------

/**
 * @since 1.0.0
 */
export const Do: Nomad<never, {}> = of({})

/**
 * @since 1.0.0
 */
export const bindTo = <N extends string>(name: N): <Effect, Value>(fa: Nomad<Effect, Value>) => Nomad<Effect, { [K in N]: Value }> =>
    map(bindTo_(name))

/**
 * @since 1.0.0
 */
export const bindW = <N extends string, Value, Effect, Value2>(
    name: Exclude<N, keyof Value>,
    f: (a: Value) => Nomad<Effect, Value2>
): ((fa: Nomad<Effect, Value>) => Nomad<Effect, { [K in keyof Value | N]: K extends keyof Value ? Value[K] : Value2 }>) =>
    chain((a) =>
        pipe(
            f(a),
            map((b) => bind_(a, name, b))
        )
    )

/**
 * @since 1.0.0
 */
export const bind: <N extends string, A, E, B>(
    name: Exclude<N, keyof A>,
    f: (a: A) => Nomad<E, B>
) => (fa: Nomad<E, A>) => Nomad<E, { [K in keyof A | N]: K extends keyof A ? A[K] : B }> = bindW
