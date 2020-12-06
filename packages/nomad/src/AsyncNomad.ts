/**
 * `AsyncNomad<Dep, Effect, Left, Right>` represents an asynchronous computation that either yields a value of type `Right` or fails yielding an
 * error of type `Left`.
 *
 * @since 1.0.0
 */
import {flow, identity, Lazy, pipe} from "fp-ts/function";
import {IOEither} from "fp-ts/IOEither";
import {IO} from "fp-ts/IO";
import {Monad4} from "fp-ts/Monad";
import {Bifunctor4} from "fp-ts/Bifunctor";
import {Alt4} from "fp-ts/Alt";
import {Applicative4} from "fp-ts/Applicative";
import {MonadThrow4} from "fp-ts/MonadThrow";
import {Semigroup} from "fp-ts/Semigroup";
import {Monoid} from "fp-ts/Monoid";
import {bind_, bindTo_} from "./bind";
import {Alt4C, Applicative4C, Monad4C, MonadThrow4C} from "./HKT4C";
import * as E from "fp-ts/Either";
import * as R from "fp-ts/Reader";
import * as T from "fp-ts/Task";
import * as TE from "fp-ts/TaskEither";
import * as N from "./Nomad";
import * as NE from "./NomadEither";
import * as TN from "./TaskNomad";
import * as TNE from "./TaskNomadEither";

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------
import Either = E.Either;
import Task = T.Task;
import TaskEither = TE.TaskEither;
import Reader = R.Reader;
import Nomad = N.Nomad;
import NomadEither = NE.NomadEither;
import TaskNomad = TN.TaskNomad;
import TaskNomadEither = TNE.TaskNomadEither;

/**
 * @category model
 * @since 1.0.0
 */
export interface AsyncNomad<Dep, Effect, Left, Right> {
    (dep: Dep): TaskNomadEither<Effect, Left, Right>
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 1.0.0
 */
export const fromTaskNomadEither: <Dep, Effect, Left, Right>(fa: TaskNomadEither<Effect, Left, Right>) => AsyncNomad<Dep, Effect, Left, Right> =
    /*#__PURE__*/
    R.of

/**
 * @category constructors
 * @since 1.0.0
 */
export const left: <Dep, Effect = never, Left = never, Right = never>(l: Left) => AsyncNomad<Dep, Effect, Left, Right> =
    /*#__PURE__*/
    flow(TNE.left, fromTaskNomadEither)

/**
 * @category constructors
 * @since 1.0.0
 */
export const right: <Dep, Effect = never, Left = never, Right = never>(r: Right) => AsyncNomad<Dep, Effect, Left, Right> =
    /*#__PURE__*/
    flow(TNE.right, fromTaskNomadEither)

/**
 * @category constructors
 * @since 1.0.0
 */
export const leftTask: <Dep, Effect = never, Left = never, Right = never>(me: Task<Left>) => AsyncNomad<Dep, Effect, Left, Right> =
    /*#__PURE__*/
    flow(TNE.leftTask, fromTaskNomadEither)

/**
 * @category constructors
 * @since 1.0.0
 */
export const rightTask: <Dep, Effect = never, Left = never, Right = never>(ma: Task<Right>) => AsyncNomad<Dep, Effect, Left, Right> =
    /*#__PURE__*/
    flow(TNE.rightTask, fromTaskNomadEither)
/**
 * @category constructors
 * @since 1.0.0
 */
export const leftIO: <Dep, Effect = never, Left = never, Right = never>(me: IO<Left>) => AsyncNomad<Dep, Effect, Left, Right> =
    /*#__PURE__*/
    flow(TNE.leftIO, fromTaskNomadEither)

/**
 * @category constructors
 * @since 1.0.0
 */
export const rightIO: <Dep, Effect = never, Left = never, Right = never>(ma: IO<Right>) => AsyncNomad<Dep, Effect, Left, Right> =
    /*#__PURE__*/
    flow(TNE.rightIO, fromTaskNomadEither)

/**
 * @category constructors
 * @since 1.0.0
 */
export const leftNomad: <Dep, Effect = never, Left = never, Right = never>(me: Nomad<Effect, Left>) => AsyncNomad<Dep, Effect, Left, Right> =
    /*#__PURE__*/
    flow(TNE.leftNomad, fromTaskNomadEither)

/**
 * @category constructors
 * @since 1.0.0
 */
export const rightNomad: <Dep, Effect = never, Left = never, Right = never>(ma: Nomad<Effect, Right>) => AsyncNomad<Dep, Effect, Left, Right> =
    /*#__PURE__*/
    flow(TNE.rightNomad, fromTaskNomadEither)

/**
 * @category constructors
 * @since 1.0.0
 */
export const fromIOEither: <Dep, Effect, Left, Right>(fa: IOEither<Left, Right>) => AsyncNomad<Dep, Effect, Left, Right> =
    /*#__PURE__*/
    flow(TNE.fromIOEither, fromTaskNomadEither)

/**
 * Derivable from `MonadThrow`.
 *
 * @category constructors
 * @since 1.0.0
 */
export const fromEither: <Dep, Effect, Left, Right>(ma: Either<Left, Right>) => AsyncNomad<Dep, Effect, Left, Right> =
    /*#__PURE__*/
    flow(TNE.fromEither, fromTaskNomadEither)

/**
 * @category constructors
 * @since 1.0.0
 */
export const effect: <Effect>(eff: Effect) => <Dep, Left, Right>(f: AsyncNomad<Dep, Effect, Left, Right>) => AsyncNomad<Dep, Effect, Left, Right> =
    /*#__PURE__*/
    eff => R.map(TNE.effect(eff))

/**
 * @category constructors
 * @since 1.0.0
 */
export const effectL: <Effect>(eff: Lazy<Effect>) => <Dep, Left, Right>(f: AsyncNomad<Dep, Effect, Left, Right>) => AsyncNomad<Dep, Effect, Left, Right> =
    /*#__PURE__*/
    eff => R.map(TNE.effectL(eff))

/**
 * @category constructors
 * @since 1.0.0
 */
export const effectRight: <Effect, Right>(eff: (r: Right) => Effect) => <Dep, Left>(f: AsyncNomad<Dep, Effect, Left, Right>) => AsyncNomad<Dep, Effect, Left, Right> =
    /*#__PURE__*/
    eff => R.map(TNE.effectRight(eff))

/**
 * @category constructors
 * @since 1.0.0
 */
export const effectLeft: <Effect, Left>(eff: (l: Left) => Effect) => <Dep, Right>(f: AsyncNomad<Dep, Effect, Left, Right>) => AsyncNomad<Dep, Effect, Left, Right> =
    /*#__PURE__*/
    eff => R.map(TNE.effectLeft(eff))

/**
 * @category constructors
 * @since 1.0.0
 */
export const effects: <Effect>(effs: ReadonlyArray<Effect>) => <Dep, Left, Right>(f: AsyncNomad<Dep, Effect, Left, Right>) => AsyncNomad<Dep, Effect, Left, Right> =
    /*#__PURE__*/
    eff => R.map(TNE.effects(eff))

// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------

/**
 * @category destructors
 * @since 1.0.0
 */
export const fold: <Dep, Effect, Left, Right, Value>(
    onLeft: (l: Left) => Reader<Dep, TaskNomad<Effect, Value>>,
    onRight: (r: Right) => Reader<Dep, TaskNomad<Effect, Value>>
) => (ma: AsyncNomad<Dep, Effect, Left, Right>) => Reader<Dep, TaskNomad<Effect, Value>> =
    (onLeft, onRight) => ma => dep =>
        pipe(
            ma(dep),
            TNE.fold(
                l => onLeft(l)(dep),
                l => onRight(l)(dep),
            )
        )

/**
 * Less strict version of [`getOrElse`](#getOrElse).
 *
 * @category destructors
 * @since 1.0.0
 */
export const getOrElseW = <Dep, Effect, Left, Right2>(onLeft: (l: Left) => Reader<Dep, TaskNomad<Effect, Right2>>) =>
    <Dep2, Right>(ma: AsyncNomad<Dep2, Effect, Left, Right>) =>
        (dep: Dep & Dep2) => pipe(ma(dep), TNE.getOrElseW((l: Left) => onLeft(l)(dep)));

/**
 * @category destructors
 * @since 1.0.0
 */
export const getOrElse: <Dep, Effect, Left, Right>(onLeft: (l: Left) => Reader<Dep, TaskNomad<Effect, Right>>) =>
    <Dep2>(ma: AsyncNomad<Dep2, Effect, Left, Right>) => Reader<Dep & Dep2, TaskNomad<Effect, Right>> = getOrElseW

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 1.0.0
 */
export const orElse = <Dep, Effect, Left, Left2, Right>(onLeft: (l: Left) => AsyncNomad<Dep, Effect, Left2, Right>) => (ma: AsyncNomad<Dep, Effect, Left, Right>): AsyncNomad<Dep, Effect, Left2, Right> =>
    dep => pipe(ma(dep), TNE.orElse((l: Left) => onLeft(l)(dep)));

/**
 * @category combinators
 * @since 1.0.0
 */
export const swap: <Dep, Effect, Left, Right>(ma: AsyncNomad<Dep, Effect, Left, Right>) => AsyncNomad<Dep, Effect, Right, Left> =
    /*#__PURE__*/
    R.map(TNE.swap)

/**
 * @category combinators
 * @since 1.0.0
 */
export const local: <Dep, Dep2>(f: (f: Dep) => Dep2) => <Effect, Left, Right>(ma: AsyncNomad<Dep2, Effect, Left, Right>) => AsyncNomad<Dep, Effect, Left, Right> =
    R.local

// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------

/* istanbul ignore next */
const map_: Monad4<URI>["map"] = (fa, f) => pipe(fa, map(f))
/* istanbul ignore next */
const bimap_: Bifunctor4<URI>["bimap"] = (fa, f, g) => pipe(fa, bimap(f, g))
/* istanbul ignore next */
const mapLeft_: Bifunctor4<URI>["mapLeft"] = (fa, f) => pipe(fa, mapLeft(f))
/* istanbul ignore next */
const ap_: Monad4<URI>["ap"] = (fab, fa) => pipe(fab, ap(fa))
/* istanbul ignore next */
const chain_: Monad4<URI>["chain"] = (ma, f) => pipe(ma, chain(f))
/* istanbul ignore next */
const alt_: Alt4<URI>["alt"] = (fa, that) => pipe(fa, alt(that))

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

/**
 * `map` can be used to turn functions `(r: Right) => Right2` into functions `(fa: F<Right>) => F<Right2>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 1.0.0
 */
export const map: <Right, Right2>(f: (r: Right) => Right2) => <Dep, Effect, Left>(fa: AsyncNomad<Dep, Effect, Left, Right>) => AsyncNomad<Dep, Effect, Left, Right2> = (f) =>
    R.map(TNE.map(f))

/**
 * Map a pair of functions over the two last type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 1.0.0
 */
export const bimap: <Left, Left2, Right, Right2>(
    f: (l: Left) => Left2,
    g: (r: Right) => Right2
) => <Dep, Effect = never>(fa: AsyncNomad<Dep, Effect, Left, Right>) => AsyncNomad<Dep, Effect, Left2, Right2> =
    /*#__PURE__*/
    (f, g) => R.map(TNE.bimap(f, g))

/**
 * Map a function over the second type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 1.0.0
 */
export const mapLeft: <Left, Left2>(f: (l: Left) => Left2) => <Dep, Effect, Right>(fa: AsyncNomad<Dep, Effect, Left, Right>) => AsyncNomad<Dep, Effect, Left2, Right> = (f) =>
    R.map(TNE.mapLeft(f))

/**
 * Less strict version of [`ap`](#ap).
 *
 * @category Apply
 * @since 1.0.0
 */
export const apW = <Dep, Effect, Left, Right>(fa: AsyncNomad<Dep, Effect, Left, Right>): <Left2, Right2>(fab: AsyncNomad<Dep, Effect, Left2, (r: Right) => Right2>) => AsyncNomad<Dep, Effect, Left | Left2, Right2> =>
    flow(
        R.map(gab => (ga: TaskNomadEither<Effect, Left, Right>) => TNE.apW(ga)(gab)),
        R.ap(fa),
    )

/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 1.0.0
 */
export const ap: <Dep, Effect, Left, Right>(fa: AsyncNomad<Dep, Effect, Left, Right>) =>
    <Right2>(fab: AsyncNomad<Dep, Effect, Left, (r: Right) => Right2>) => AsyncNomad<Dep, Effect, Left, Right2> = apW;

/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * Derivable from `Apply`.
 *
 * @category combinators
 * @since 1.0.0
 */
export const apFirst:
    <Dep, Effect, Left, Right2>(fb: AsyncNomad<Dep, Effect, Left, Right2>) =>
        <Right>(fa: AsyncNomad<Dep, Effect, Left, Right>) => AsyncNomad<Dep, Effect, Left, Right> =
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
    <Dep, Effect, Left, Right2>(fb: AsyncNomad<Dep, Effect, Left, Right2>):
        <Right>(fa: AsyncNomad<Dep, Effect, Left, Right>) => AsyncNomad<Dep, Effect, Left, Right2> =>
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
export const of: Applicative4<URI>["of"] = right

/**
 * Less strict version of [`chain`](#chain).
 *
 * @category Monad
 * @since 1.0.0
 */
export const chainW = <Dep, Effect, Left, Right, Right2>(onRight: (r: Right) => AsyncNomad<Dep, Effect, Left, Right2>) => <Dep2, Left2>(an: AsyncNomad<Dep2, Effect, Left2, Right>): AsyncNomad<Dep & Dep2, Effect, Left2 | Left, Right2> =>
    dep => pipe(an(dep), TNE.chainW(r => onRight(r)(dep)));

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 1.0.0
 */
export const chain:
    <Dep, Effect, Left, Right, Right2>(f: (r: Right) => AsyncNomad<Dep, Effect, Left, Right2>) =>
        (ma: AsyncNomad<Dep, Effect, Left, Right>) => AsyncNomad<Dep, Effect, Left, Right2> = chainW

/**
 * Less strict version of [`chainFirst`](#chainFirst)
 *
 * Derivable from `Monad`.
 *
 * @category combinators
 * @since 1.0.0
 */
export const chainFirstW: <Dep, Effect, Left, Right, Right2>(f: (r: Right) => AsyncNomad<Dep, Effect, Left, Right2>) =>
    <Dep2, Left2>(ma: AsyncNomad<Dep2, Effect, Left2, Right>) => AsyncNomad<Dep & Dep2, Effect, Left | Left2, Right> =
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
export const chainFirst: <Dep, Effect, Left, Right, Right2>(f: (r: Right) => AsyncNomad<Dep, Effect, Left, Right2>) =>
    (ma: AsyncNomad<Dep, Effect, Left, Right>) =>
        AsyncNomad<Dep, Effect, Left, Right> = chainFirstW

/**
 * Derivable from `Monad`.
 *
 * @category combinators
 * @since 1.0.0
 */
export const flatten: <Dep, Effect, Left, Right>(mma: AsyncNomad<Dep, Effect, Left, AsyncNomad<Dep, Effect, Left, Right>>) => AsyncNomad<Dep, Effect, Left, Right> =
    /*#__PURE__*/
    chain(identity)

/**
 * Less strict version of [`alt`](#alt).
 *
 * @category Alt
 * @since 1.0.0
 */
export const altW =
    <Dep2, Effect, Left2, Right2>(that: () => AsyncNomad<Dep2, Effect, Left2, Right2>) =>
        <Dep, Left, Right>(fa: AsyncNomad<Dep, Effect, Left, Right>): AsyncNomad<Dep & Dep2, Effect, Left | Left2, Right | Right2> => dep => pipe(
            fa(dep),
            TNE.altW(() => that()(dep)),
        )

/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category Alt
 * @since 1.0.0
 */
export const alt: <Dep, Effect, Left, Right>(that: () => AsyncNomad<Dep, Effect, Left, Right>) =>
    (fa: AsyncNomad<Dep, Effect, Left, Right>) => AsyncNomad<Dep, Effect, Left, Right> = altW

/**
 * @category MonadThrow
 * @since 1.0.0
 */
export const throwError: MonadThrow4<URI>["throwError"] = left

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 1.0.0
 */
export const URI = "AsyncNomad"

/**
 * @category instances
 * @since 1.0.0
 */
export type URI = typeof URI

declare module "fp-ts/HKT" {
    interface URItoKind4<S, R, E, A> {
        readonly [URI]: AsyncNomad<S, R, E, A>
    }
}

/**
 * Semigroup returning the left-most non-`Left` value. If both operands are `Right`s then the inner values are
 * concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 1.0.0
 */
export function getSemigroup<Dep, Effect, Left, Right>(S: Semigroup<Right>): Semigroup<AsyncNomad<Dep, Effect, Left, Right>> {
    return R.getSemigroup(TNE.getSemigroup(S))
}

/**
 * @category instances
 * @since 1.0.0
 */
export function getMonoid<Dep, Effect, Left, Right>(M: Monoid<Right>): Monoid<AsyncNomad<Dep, Effect, Left, Right>> {
    return {
        concat: getSemigroup<Dep, Effect, Left, Right>(M).concat,
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
export function getApplySemigroup<Dep, Effect, Left, Right>(S: Semigroup<Right>): Semigroup<AsyncNomad<Dep, Effect, Left, Right>> {
    return R.getSemigroup(TNE.getApplySemigroup(S))
}

/**
 * @category instances
 * @since 1.0.0
 */
export function getApplyMonoid<Dep, Effect, Left, Right>(M: Monoid<Right>): Monoid<AsyncNomad<Dep, Effect, Left, Right>> {
    return {
        concat: getApplySemigroup<Dep, Effect, Left, Right>(M).concat,
        empty: right(M.empty)
    }
}

/**
 * @category instances
 * @since 1.0.0
 */
export function getApplicativeNomadValidation<Left>(SE: Semigroup<Left>): Applicative4C<URI, Left> {
    const AV = TNE.getApplicativeTaskNomadEitherValidation(SE)
    const app = <Dep, Effect, Right>(fga: AsyncNomad<Dep, Effect, Left, Right>): <Right2>(fgab: AsyncNomad<Dep, Effect, Left, (r: Right) => Right2>) => AsyncNomad<Dep, Effect, Left, Right2> =>
        flow(
            R.map((gab) => (ga: TaskNomadEither<Effect, Left, Right>) => AV.ap(gab, ga)),
            R.ap(fga)
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
export function getAltTaskNomadEitherValidation<Left>(SL: Semigroup<Left>): Alt4C<URI, Left> {
    const V = TNE.getAltTaskNomadEitherValidation(SL);

    return {
        URI,
        _E: undefined as any,
        map: map_,
        alt: (an1, an2L) => dep => V.alt(an1(dep), () => an2L()(dep)),
    }
}

/**
 * @category instances
 * @since 1.0.0
 */
export function getAsyncNomadValidation<Left>(
    SE: Semigroup<Left>
): Monad4C<URI, Left> & Bifunctor4<URI> & Alt4C<URI, Left> & MonadThrow4C<URI, Left> {
    const applicativeNomadValidation = getApplicativeNomadValidation(SE)
    const altNomadValidation = getAltTaskNomadEitherValidation(SE)
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
export const asyncNomad: Monad4<URI> & Bifunctor4<URI> & Alt4<URI> & MonadThrow4<URI> = {
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
// utils
// -------------------------------------------------------------------------------------

/**
 * Run a computation in the `AsyncNomad` monad, discarding the effects
 *
 * @since 1.0.0
 */
/* istanbul ignore next */
export const evaluate = <Dep>(dep: Dep) => <Effect, Left, Right>(ma: AsyncNomad<Dep, Effect, Left, Right>): TaskEither<Left, Right> =>
    pipe(
        ma(dep),
        T.map(n => n.value),
    )

/**
 * Run a computation in the `AsyncNomad` monad
 *
 * @since 1.0.0
 */
/* istanbul ignore next */
export const execute = <Dep>(dep: Dep) => <Effect, Left, Right>(ma: AsyncNomad<Dep, Effect, Left, Right>): TaskNomadEither<Effect, Left, Right> =>
    ma(dep)

/**
 * Run a computation in the `AsyncNomad` monad, discarding the final state
 *
 * @since 1.0.0
 */
/* istanbul ignore next */
export const evaluatePromise = <Dep>(dep: Dep) => <Effect, Left, Right>(ma: AsyncNomad<Dep, Effect, Left, Right>): Promise<Either<Left, Right>> =>
    pipe(
        ma(dep),
        T.map(n => n.value),
    )()
/**
 * Run a computation in the `AsyncNomad` monad discarding the result
 *
 * @since 1.0.0
 */
/* istanbul ignore next */
export const executePromise = <Dep>(dep: Dep) => <Effect, Left, Right>(ma: AsyncNomad<Dep, Effect, Left, Right>): Promise<NomadEither<Effect, Left, Right>> =>
    ma(dep)()

// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------

/**
 * @since 1.0.0
 */
export const Do: AsyncNomad<unknown, never, never, {}> = of({})

/**
 * @since 1.0.0
 */
export const bindTo = <Key extends string>(name: Key): <Dep, Effect, Left, Right>(fa: AsyncNomad<Dep, Effect, Left, Right>) => AsyncNomad<Dep, Effect, Left, { [K in Key]: Right }> =>
    map(bindTo_(name))

/**
 * @since 1.0.0
 */
export const bindW = <Key extends string, Left, Right, Dep, Effect, Right2>(
    name: Exclude<Key, keyof Right>,
    f: (r: Right) => AsyncNomad<Dep, Effect, Left, Right2>
): (fa: AsyncNomad<Dep, Effect, Left, Right>) => AsyncNomad<Dep, Effect, Left, { [K in keyof Right | Key]: K extends keyof Right ? Right[K] : Right2 }> =>
    chain((a) =>
        pipe(
            f(a),
            map((b) => bind_(a, name, b))
        )
    )

/**
 * @since 1.0.0
 */
export const bind: <Key extends string, Left, Right, Dep, Effect, Right2>(
    name: Exclude<Key, keyof Right>,
    f: (r: Right) => AsyncNomad<Dep, Effect, Left, Right2>
) => (fa: AsyncNomad<Dep, Effect, Left, Right>) => AsyncNomad<Dep, Effect, Left, { [K in keyof Right | Key]: K extends keyof Right ? Right[K] : Right2 }> = bindW
