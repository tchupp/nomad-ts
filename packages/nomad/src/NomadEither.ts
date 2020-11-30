/**
 * ```ts
 * type NomadEither<Effect, Left, Right> = Left<Left> | Right<Right>
 * ```
 *
 * Represents a value of one of two possible types (a disjoint union).
 *
 * An instance of `Either` is either an instance of `Left` or `Right`.
 *
 * Right common use of `Either` is as an alternative to `Option` for dealing with possible missing values. In this usage,
 * `None` is replaced with a `Left` which can contain useful information. `Right` takes the place of `Some`. Convention
 * dictates that `Left` is used for failure and `Right` is used for success.
 *
 * @since 1.0.0
 */
import {flow, identity, Lazy, pipe} from "fp-ts/function";
import {Monad3, Monad3C} from "fp-ts/Monad";
import {Applicative3, Applicative3C} from "fp-ts/Applicative";
import {Bifunctor3} from "fp-ts/Bifunctor";
import {Alt3, Alt3C} from "fp-ts/Alt";
import {MonadThrow3, MonadThrow3C} from "fp-ts/MonadThrow";
import {Semigroup} from "fp-ts/Semigroup";
import {Monoid} from "fp-ts/Monoid";
import {Functor3} from "fp-ts/Functor";
import * as E from "fp-ts/Either";
import * as N from "./Nomad";
import {Eq} from "fp-ts/Eq";
import {getEq as getEqArray} from "fp-ts/ReadonlyArray";
import {bind_, bindTo_} from "./bind";


// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------
import Either = E.Either;
import Nomad = N.Nomad;

export interface NomadEither<Effect, Left, Right> extends Nomad<Effect, Either<Left, Right>> {
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 1.0.0
 */
export const left: <Effect = never, Left = never, Right = never>(l: Left) => NomadEither<Effect, Left, Right> =
    /*#__PURE__*/
    <Effect, Left, Right>(l: Left) => N.of(E.left(l))

/**
 * @category constructors
 * @since 1.0.0
 */
export const right: <Effect = never, Left = never, Right = never>(r: Right) => NomadEither<Effect, Left, Right> =
    /*#__PURE__*/
    <Effect, Left, Right>(r: Right) => N.of(E.right(r))

/**
 * @category constructors
 * @since 1.0.0
 */
export const leftNomad: <Effect, Left = never, Right = never>(nl: Nomad<Effect, Left>) => NomadEither<Effect, Left, Right> =
    /*#__PURE__*/
    N.map(E.left)

/**
 * @category constructors
 * @since 1.0.0
 */
export const rightNomad: <Effect, Left = never, Right = never>(nr: Nomad<Effect, Right>) => NomadEither<Effect, Left, Right> =
    /*#__PURE__*/
    N.map(E.right)

/**
 * @category constructors
 * @since 1.0.0
 */
export const effect: <Effect>(eff: Effect) => <Left, Right>(f: NomadEither<Effect, Left, Right>) => NomadEither<Effect, Left, Right> =
    /*#__PURE__*/
    N.effect;

/**
 * @category constructors
 * @since 1.0.0
 */
export const effectL: <Effect>(eff: Lazy<Effect>) => <Left, Right>(f: NomadEither<Effect, Left, Right>) => NomadEither<Effect, Left, Right> =
    /*#__PURE__*/
    N.effectL;

/**
 * @category constructors
 * @since 1.0.0
 */
export const effectRight: <Effect, Right>(eff: (r: Right) => Effect) => <Left>(f: NomadEither<Effect, Left, Right>) => NomadEither<Effect, Left, Right> =
    eff => f => {
        if (E.isRight(f.value)) {
            return N.effect(eff(f.value.right))(f);
        }
        return f;
    };

/**
 * @category constructors
 * @since 1.0.0
 */
export const effectLeft: <Effect, Left>(eff: (l: Left) => Effect) => <Right>(f: NomadEither<Effect, Left, Right>) => NomadEither<Effect, Left, Right> =
    eff => f => {
        if (E.isLeft(f.value)) {
            return N.effect(eff(f.value.left))(f);
        }
        return f;
    };

/**
 * @category constructors
 * @since 1.0.0
 */
export const effects: <Effect>(effs: ReadonlyArray<Effect>) => <Left, Right>(f: NomadEither<Effect, Left, Right>) => NomadEither<Effect, Left, Right> =
    effs => f => N.effects(effs)(f);

/**
 * Derivable from `MonadThrow`.
 *
 * @category constructors
 * @since 1.0.0
 */
export const fromEither: <Effect, Left, Right>(ma: E.Either<Left, Right>) => NomadEither<Effect, Left, Right> =
    /*#__PURE__*/
    <Effect, Left, Right>(e: Either<Left, Right>) => E.fold(
        (l: Left) => left<Effect, Left, Right>(l),
        (r: Right) => right<Effect, Left, Right>(r),
    )(e);

// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------

/**
 * @category destructors
 * @since 1.0.0
 */
export const fold: <Effect, Left, Right, Value>(
    onLeft: (e: Left) => Nomad<Effect, Value>,
    onRight: (a: Right) => Nomad<Effect, Value>
) => (ma: NomadEither<Effect, Left, Right>) => Nomad<Effect, Value> =
    /*#__PURE__*/
    flow(E.fold, N.chain)

/**
 * Less strict version of [`getOrElse`](#getOrElse).
 *
 * @category destructors
 * @since 1.0.0
 */
export const getOrElseW =
    <Effect, Left, Right2>(onLeft: (e: Left) => Nomad<Effect, Right2>) =>
        <Right>(ma: NomadEither<Effect, Left, Right>): Nomad<Effect, Right | Right2> =>
            pipe(ma, N.chain(E.fold<Left, Right, N.Nomad<Effect, Right | Right2>>(onLeft, N.of)))

/**
 * @category destructors
 * @since 1.0.0
 */
export const getOrElse: <Effect, Left, Right>(
    onLeft: (e: Left) => Nomad<Effect, Right>
) => (ma: NomadEither<Effect, Left, Right>) => Nomad<Effect, Right> = getOrElseW

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 1.0.0
 */
export const orElse: <Effect, Left, Left2, Right>(onLeft: (e: Left) => NomadEither<Effect, Left2, Right>) =>
    (ma: NomadEither<Effect, Left, Right>) =>
        NomadEither<Effect, Left2, Right> =
    (f) => N.chain(E.fold(f, right))

/**
 * @category combinators
 * @since 1.0.0
 */
export const swap: <Effect, Left, Right>(ma: NomadEither<Effect, Left, Right>) => NomadEither<Effect, Right, Left> =
    /*#__PURE__*/
    N.map(E.swap)

// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------

/* istanbul ignore next */
const map_: Monad3<URI>["map"] = (fa, f) => pipe(fa, map(f))
/* istanbul ignore next */
const bimap_: Bifunctor3<URI>["bimap"] = (fa, f, g) => pipe(fa, bimap(f, g))
/* istanbul ignore next */
const mapLeft_: Bifunctor3<URI>["mapLeft"] = (fa, f) => pipe(fa, mapLeft(f))
/* istanbul ignore next */
const ap_: Monad3<URI>["ap"] = (fab, fa) => pipe(fab, ap(fa))
/* istanbul ignore next */
const chain_: Monad3<URI>["chain"] = (ma, f) => pipe(ma, chain(f))
/* istanbul ignore next */
const alt_: Alt3<URI>["alt"] = (fa, that) => pipe(fa, alt(that))

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

/**
 * `map` can be used to turn functions `(a: Right) => Right2` into functions `(fa: F<Right>) => F<Right2>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 1.0.0
 */
export const map: <Right, Right2>(f: (a: Right) => Right2) => <Effect, Left>(fa: NomadEither<Effect, Left, Right>) => NomadEither<Effect, Left, Right2> = (f) =>
    N.map(E.map(f))

/**
 * Map a pair of functions over the two last type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 1.0.0
 */
export const bimap: <Left, Left2, Right, Right2>(
    f: (e: Left) => Left2,
    g: (a: Right) => Right2
) => <Effect>(fa: NomadEither<Effect, Left, Right>) => NomadEither<Effect, Left2, Right2> =
    /*#__PURE__*/
    flow(E.bimap, N.map)

/**
 * Map a function over the second type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 1.0.0
 */
export const mapLeft: <Left, Left2>(f: (e: Left) => Left2) => <Effect, Right>(fa: NomadEither<Effect, Left, Right>) => NomadEither<Effect, Left2, Right> = (f) =>
    N.map(E.mapLeft(f))

/**
 * Less strict version of [`ap`](#ap).
 *
 * @category Apply
 * @since 1.0.0
 */
export const apW = <Effect, Left, Right>(
    fa: NomadEither<Effect, Left, Right>
): (<Left2, Right2>(fab: NomadEither<Effect, Left2, (a: Right) => Right2>) => NomadEither<Effect, Left | Left2, Right2>) =>
    flow(
        N.map((gab) => (ga: E.Either<Left, Right>) => E.apW(ga)(gab)),
        N.apW(fa)
    )

/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 1.0.0
 */
export const ap: <Effect, Left, Right>(
    fa: NomadEither<Effect, Left, Right>
) => <B>(fab: NomadEither<Effect, Left, (a: Right) => B>) => NomadEither<Effect, Left, B> = apW

/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * Derivable from `Apply`.
 *
 * @category combinators
 * @since 1.0.0
 */
export const apFirst:
    <Effect, Left, Right2>(fb: NomadEither<Effect, Left, Right2>) =>
        <Right>(fa: NomadEither<Effect, Left, Right>) =>
            NomadEither<Effect, Left, Right> =
    (fb) =>
        flow(
            map((a) => () => a),
            ap(fb)
        )

/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * Derivable from `Apply`.
 *
 * @category combinators
 * @since 1.0.0
 */
export const apSecond =
    <Effect, Left, Right2>(fb: NomadEither<Effect, Left, Right2>):
        <Right>(fa: NomadEither<Effect, Left, Right>) =>
            NomadEither<Effect, Left, Right2> =>
        flow(
            map(() => (b: Right2) => b),
            ap(fb)
        );

/**
 * Wrap a value into the type constructor.
 *
 * Equivalent to [`right`](#right).
 *
 * @category Applicative
 * @since 1.0.0
 */
export const of: Applicative3<URI>["of"] = right

/**
 * Less strict version of [`chain`](#chain).
 *
 * @category Monad
 * @since 1.0.0
 */
export const chainW =
    <Effect, Left, Right, Right2>(f: (a: Right) => NomadEither<Effect, Left, Right2>) =>
        <Left2>(ma: NomadEither<Effect, Left2, Right>): NomadEither<Effect, Left2 | Left, Right2> =>
            pipe(ma, N.chain(E.fold<Left2, Right, NomadEither<Effect, Left2 | Left, Right2>>(left, f)))

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 1.0.0
 */
export const chain:
    <Effect, Left, Right, Right2>(f: (a: Right) => NomadEither<Effect, Left, Right2>) =>
        (ma: NomadEither<Effect, Left, Right>) =>
            NomadEither<Effect, Left, Right2> = chainW

/**
 * Less strict version of [`chainFirst`](#chainFirst)
 *
 * Derivable from `Monad`.
 *
 * @category combinators
 * @since 1.0.0
 */
export const chainFirstW: <Effect, Left, Right, Right2>(f: (a: Right) => NomadEither<Effect, Left, Right2>) =>
    <Left2>(ma: NomadEither<Effect, Left2, Right>) =>
        NomadEither<Effect, Left | Left2, Right> =
    (f) => chainW((a) => pipe(
        f(a),
        map(() => a)
        )
    )

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * Derivable from `Monad`.
 *
 * @category combinators
 * @since 1.0.0
 */
export const chainFirst: <Effect, Left, Right, Right2>(f: (a: Right) => NomadEither<Effect, Left, Right2>) =>
    (ma: NomadEither<Effect, Left, Right>) =>
        NomadEither<Effect, Left, Right> = chainFirstW

/**
 * Derivable from `Monad`.
 *
 * @category combinators
 * @since 1.0.0
 */
export const flatten: <Effect, Left, Right>(mma: NomadEither<Effect, Left, NomadEither<Effect, Left, Right>>) => NomadEither<Effect, Left, Right> =
    /*#__PURE__*/
    chain(identity)

/**
 * Less strict version of [`alt`](#alt).
 *
 * @category Alt
 * @since 1.0.0
 */
export const altW =
    <Effect, Left2, Right2>(that: () => NomadEither<Effect, Left2, Right2>) =>
        <Left, Right>(fa: NomadEither<Effect, Left, Right>): NomadEither<Effect, Left | Left2, Right | Right2> =>
            pipe(
                fa,
                N.chain(E.fold<Left, Right, NomadEither<Effect, Left | Left2, Right | Right2>>(that, right))
            )

/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category Alt
 * @since 1.0.0
 */
export const alt: <Effect, Left, Right>(that: () => NomadEither<Effect, Left, Right>) =>
    (fa: NomadEither<Effect, Left, Right>) =>
        NomadEither<Effect, Left, Right> = altW

/**
 * @category MonadThrow
 * @since 1.0.0
 */
export const throwError: MonadThrow3<URI>["throwError"] = left

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 1.0.0
 */
export const URI = "NomadEither"

/**
 * @category instances
 * @since 1.0.0
 */
export type URI = typeof URI

declare module "fp-ts/HKT" {
    interface URItoKind3<R, E, A> {
        readonly [URI]: NomadEither<R, E, A>
    }
}

/**
 * @category instances
 * @since 1.0.0
 */
export const getEq = <Effect, Left, Right>(eqEffect: Eq<Effect>, eqLeft: Eq<Left>, eqRight: Eq<Right>): Eq<NomadEither<Effect, Left, Right>> => ({
    equals(x, y) {
        if (x === y) {
            return true
        }

        const eqEither = E.getEq(eqLeft, eqRight);
        const eqArray = getEqArray(eqEffect);
        return eqArray.equals(x.effects, y.effects) && eqEither.equals(x.value, y.value);
    }
});

/**
 * Semigroup returning the left-most non-`Left` value. If both operands are `Right`s then the inner values are
 * concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 1.0.0
 */
export function getSemigroup<Effect, Left, Right>(S: Semigroup<Right>): Semigroup<NomadEither<Effect, Left, Right>> {
    return N.getSemigroup(E.getSemigroup(S))
}

/**
 * @category instances
 * @since 1.0.0
 */
export function getMonoid<Effect, Left, Right>(M: Monoid<Right>): Monoid<NomadEither<Effect, Left, Right>> {
    return {
        concat: getSemigroup<Effect, Left, Right>(M).concat,
        empty: right(M.empty)
    }
}

/**
 * Semigroup returning the left-most `Left` value. If both operands are `Right`s then the inner values
 * are concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 1.0.0
 */
export function getApplySemigroup<Effect, Left, Right>(S: Semigroup<Right>): Semigroup<NomadEither<Effect, Left, Right>> {
    return N.getSemigroup(E.getApplySemigroup(S))
}

/**
 * @category instances
 * @since 1.0.0
 */
export function getApplyMonoid<Effect, Left, Right>(M: Monoid<Right>): Monoid<NomadEither<Effect, Left, Right>> {
    return {
        concat: getApplySemigroup<Effect, Left, Right>(M).concat,
        empty: right(M.empty)
    }
}

/**
 * @category instances
 * @since 1.0.0
 */
export function getApplicativeNomadValidation<Left>(SE: Semigroup<Left>): Applicative3C<URI, Left> {
    const AV = E.getApplicativeValidation(SE)
    const app: <Effect, Right>(fga: NomadEither<Effect, Left, Right>) => <Right2>(fgab: NomadEither<Effect, Left, (a: Right) => Right2>) => NomadEither<Effect, Left, Right2> =
        <Effect, Right>(fga: NomadEither<Effect, Left, Right>): <Right2>(fgab: NomadEither<Effect, Left, (a: Right) => Right2>) => NomadEither<Effect, Left, Right2> =>
            flow(
                N.map((gab) => (ga: E.Either<Left, Right>) => AV.ap(gab, ga)),
                N.ap(fga)
            )
    return {
        URI,
        _E: undefined as any,
        map: map_,
        ap: (fab, fa) => pipe(fab, app(fa)),
        of
    }
}

/**
 * @category instances
 * @since 1.0.0
 */
export function getAltNomadValidation<Left>(SL: Semigroup<Left>): Alt3C<URI, Left> {
    return {
        URI,
        _E: undefined as any,
        map: map_,
        alt: function <Effect, Right>(me: NomadEither<Effect, Left, Right>, thatL: Lazy<NomadEither<Effect, Left, Right>>): NomadEither<Effect, Left, Right> {
            if (E.isRight(me.value)) {
                return me;
            }

            const that = thatL();

            const V = E.getAltValidation(SL);
            return pipe(
                V.alt(me.value, () => that.value),
                N.pure,
                effects(me.effects),
                effects(that.effects),
            );
        }
    }
}

/**
 * @category instances
 * @since 1.0.0
 */
export function getNomadValidation<Left>(
    SE: Semigroup<Left>
): Monad3C<URI, Left> & Bifunctor3<URI> & Alt3C<URI, Left> & MonadThrow3C<URI, Left> {
    const applicativeNomadValidation = getApplicativeNomadValidation(SE)
    const altNomadValidation = getAltNomadValidation(SE)
    return {
        URI,
        _E: undefined as any,
        map: map_,
        ap: applicativeNomadValidation.ap,
        of,
        chain: chain_,
        bimap: bimap_,
        mapLeft: mapLeft_,
        alt: altNomadValidation.alt,
        throwError
    }
}

/**
 * @category instances
 * @since 1.0.0
 */
export const Functor: Functor3<URI> = {
    URI,
    map: map_
}

/**
 * @category instances
 * @since 1.0.0
 */
export const Applicative: Applicative3<URI> = {
    URI,
    map: map_,
    ap: ap_,
    of
}

/**
 * @category instances
 * @since 1.0.0
 */
export const Monad: Monad3<URI> = {
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
export const Bifunctor: Bifunctor3<URI> = {
    URI,
    bimap: bimap_,
    mapLeft: mapLeft_
}

/**
 * @category instances
 * @since 1.0.0
 */
export const Alt: Alt3<URI> = {
    URI,
    map: map_,
    alt: alt_
}

/**
 * @category instances
 * @since 1.0.0
 */
export const MonadThrow: MonadThrow3<URI> = {
    URI,
    map: map_,
    ap: ap_,
    of,
    chain: chain_,
    throwError
}

/**
 * @category instances
 * @since 1.0.0
 */
export const nomadEither: Monad3<URI> & Bifunctor3<URI> & Alt3<URI> & MonadThrow3<URI> = {
    URI,
    bimap: bimap_,
    mapLeft: mapLeft_,
    map: map_,
    of,
    ap: ap_,
    chain: chain_,
    alt: alt_,
    throwError: left
}

// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------

/**
 * @since 1.0.0
 */
export const Do: NomadEither<never, never, {}> = of({})

/**
 * @since 1.0.0
 */
export const bindTo = <Key extends string>(name: Key): <Effect, Left, Right>(fa: NomadEither<Effect, Left, Right>) => NomadEither<Effect, Left, { [K in Key]: Right }> =>
    map(bindTo_(name))

/**
 * @since 1.0.0
 */
export const bindW = <Key extends string, Left, Right, Effect, Right2>(
    name: Exclude<Key, keyof Right>,
    f: (a: Right) => NomadEither<Effect, Left, Right2>
): ((fa: NomadEither<Effect, Left, Right>) => NomadEither<Effect, Left, { [K in keyof Right | Key]: K extends keyof Right ? Right[K] : Right2 }>) =>
    chain((a) =>
        pipe(
            f(a),
            map((b) => bind_(a, name, b))
        )
    )

/**
 * @since 1.0.0
 */
export const bind: <Key extends string, Left, Right, Effect, Right2>(
    name: Exclude<Key, keyof Right>,
    f: (a: Right) => NomadEither<Effect, Left, Right2>
) => (fa: NomadEither<Effect, Left, Right>) => NomadEither<Effect, Left, { [K in keyof Right | Key]: K extends keyof Right ? Right[K] : Right2 }> = bindW
