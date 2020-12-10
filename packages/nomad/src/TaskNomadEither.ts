/**
 * `TaskNomadEither<Effect, Left, Right>` represents an asynchronous computation that either yields a value of type `Right` or fails yielding an
 * error of type `Left`.
 *
 * @since 1.0.0
 */
import {flow, identity, Lazy, pipe} from "fp-ts/function";
import {IOEither} from "fp-ts/IOEither";
import {IO} from "fp-ts/IO";
import {Monad3, Monad3C} from "fp-ts/Monad";
import {Bifunctor3} from "fp-ts/Bifunctor";
import {Alt3, Alt3C} from "fp-ts/Alt";
import {Applicative3, Applicative3C} from "fp-ts/Applicative";
import {MonadThrow3, MonadThrow3C} from "fp-ts/MonadThrow";
import {Semigroup} from "fp-ts/Semigroup";
import {Monoid} from "fp-ts/Monoid";
import {bind_, bindTo_} from "./bind";
import * as E from "fp-ts/Either";
import * as T from "fp-ts/Task";
import * as TE from "fp-ts/TaskEither";
import * as N from "./Nomad";
import * as NE from "./NomadEither";
import * as TN from "./TaskNomad";

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------
import Either = E.Either;
import Task = T.Task;
import Nomad = N.Nomad;
import TaskEither = TE.TaskEither;
import NomadEither = NE.NomadEither;
import TaskNomad = TN.TaskNomad;

/**
 * @category model
 * @since 1.0.0
 */
export interface TaskNomadEither<Effect, Left, Right> extends Task<NomadEither<Effect, Left, Right>> {
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 1.0.0
 */
export const left: <Effect = never, Left = never, Right = never>(l: Left) => TaskNomadEither<Effect, Left, Right> =
    /*#__PURE__*/
    flow(NE.left, T.of)

/**
 * @category constructors
 * @since 1.0.0
 */
export const right: <Effect = never, Left = never, Right = never>(r: Right) => TaskNomadEither<Effect, Left, Right> =
    /*#__PURE__*/
    flow(NE.right, T.of)

/**
 * @category constructors
 * @since 1.0.0
 */
export const leftTask: <Effect = never, Left = never, Right = never>(me: Task<Left>) => TaskNomadEither<Effect, Left, Right> =
    /*#__PURE__*/
    T.map(NE.left)

/**
 * @category constructors
 * @since 1.0.0
 */
export const rightTask: <Effect = never, Left = never, Right = never>(ma: Task<Right>) => TaskNomadEither<Effect, Left, Right> =
    /*#__PURE__*/
    T.map(NE.right)

/**
 * @category constructors
 * @since 1.0.0
 */
export const leftIO: <Effect = never, Left = never, Right = never>(me: IO<Left>) => TaskNomadEither<Effect, Left, Right> =
    /*#__PURE__*/
    flow(T.fromIO, leftTask)

/**
 * @category constructors
 * @since 1.0.0
 */
export const rightIO: <Effect = never, Left = never, Right = never>(ma: IO<Right>) => TaskNomadEither<Effect, Left, Right> =
    /*#__PURE__*/
    flow(T.fromIO, rightTask)

/**
 * @category constructors
 * @since 1.0.0
 */
export const leftNomad: <Effect = never, Left = never, Right = never>(me: Nomad<Effect, Left>) => TaskNomadEither<Effect, Left, Right> =
    /*#__PURE__*/
    flow(NE.leftNomad, T.of)

/**
 * @category constructors
 * @since 1.0.0
 */
export const rightNomad: <Effect = never, Left = never, Right = never>(ma: Nomad<Effect, Right>) => TaskNomadEither<Effect, Left, Right> =
    /*#__PURE__*/
    flow(NE.rightNomad, T.of)

/**
 * @category constructors
 * @since 1.0.0
 */
export const fromIOEither: <Effect = never, Left = never, Right = never>(fa: IOEither<Left, Right>) => TaskNomadEither<Effect, Left, Right> =
    flow(
        T.fromIO,
        T.map(N.pure),
    )

/**
 * @category constructors
 * @since 1.0.0
 */
export const fromTaskEither: <Effect = never, Left = never, Right = never>(fa: TaskEither<Left, Right>) => TaskNomadEither<Effect, Left, Right> =
    flow(
        T.map(N.pure),
    )

/**
 * Derivable from `MonadThrow`.
 *
 * @category constructors
 * @since 1.0.0
 */
export const fromEither: <Effect = never, Left = never, Right = never>(ma: Either<Left, Right>) => TaskNomadEither<Effect, Left, Right> =
    /*#__PURE__*/
    E.fold(left, (a) => right(a))

/**
 * @category constructors
 * @since 1.0.0
 */
export const effect: <Effect>(eff: Effect) => <Left = never, Right = never>(f: TaskNomadEither<Effect, Left, Right>) => TaskNomadEither<Effect, Left, Right> =
    /*#__PURE__*/
    eff => T.map(NE.effect(eff))

/**
 * @category constructors
 * @since 1.0.0
 */
export const effectL: <Effect>(eff: Lazy<Effect>) => <Left = never, Right = never>(f: TaskNomadEither<Effect, Left, Right>) => TaskNomadEither<Effect, Left, Right> =
    /*#__PURE__*/
    eff => T.map(NE.effectL(eff))

/**
 * @category constructors
 * @since 1.0.0
 */
export const effectRight: <Effect, Right>(eff: (r: Right) => Effect) => <Left = never>(f: TaskNomadEither<Effect, Left, Right>) => TaskNomadEither<Effect, Left, Right> =
    /*#__PURE__*/
    eff => T.map(NE.effectRight(eff))

/**
 * @category constructors
 * @since 1.0.0
 */
export const effectLeft: <Effect, Left>(eff: (l: Left) => Effect) => <Right = never>(f: TaskNomadEither<Effect, Left, Right>) => TaskNomadEither<Effect, Left, Right> =
    /*#__PURE__*/
    eff => T.map(NE.effectLeft(eff))

/**
 * @category constructors
 * @since 1.0.0
 */
export const effects: <Effect>(effs: ReadonlyArray<Effect>) => <Left, Right>(f: TaskNomadEither<Effect, Left, Right>) => TaskNomadEither<Effect, Left, Right> =
    /*#__PURE__*/
    effs => T.map(NE.effects(effs))

// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------

/**
 * @category destructors
 * @since 1.0.0
 */
export const fold: <Effect, Left, Right, Value>(
    onLeft: (e: Left) => TaskNomad<Effect, Value>,
    onRight: (a: Right) => TaskNomad<Effect, Value>
) => (ma: TaskNomadEither<Effect, Left, Right>) => TaskNomad<Effect, Value> =
    (onLeft, onRight) =>
        TN.chain(
            E.fold(
                l => onLeft(l),
                r => onRight(r),
            )
        )

/**
 * Less strict version of [`getOrElse`](#getOrElse).
 *
 * @category destructors
 * @since 1.0.0
 */
export const getOrElseW = <Effect, Left, Right2>(onLeft: (e: Left) => TaskNomad<Effect, Right2>) =>
    <Right>(ma: TaskNomadEither<Effect, Left, Right>) => pipe(ma, TN.chain(E.fold(onLeft, r => TN.of<Effect, Right | Right2>(r))))

/**
 * @category destructors
 * @since 1.0.0
 */
export const getOrElse: <Effect, Left, Right>(onLeft: (e: Left) => TaskNomad<Effect, Right>) =>
    (ma: TaskNomadEither<Effect, Left, Right>) => TaskNomad<Effect, Right> = getOrElseW

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 1.0.0
 */
export const orElse = <Effect, Left, Left2, Right>(onLeft: (l: Left) => TaskNomadEither<Effect, Left2, Right>): ((ma: TaskNomadEither<Effect, Left, Right>) => TaskNomadEither<Effect, Left2, Right>) =>
    TN.chain(E.fold<Left, Right, TaskNomadEither<Effect, Left2, Right>>(onLeft, right));

/**
 * @category combinators
 * @since 1.0.0
 */
export const swap: <Effect, Left, Right>(ma: TaskNomadEither<Effect, Left, Right>) => TaskNomadEither<Effect, Right, Left> =
    /*#__PURE__*/
    T.map(NE.swap)

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
export const map: <Right, Right2>(f: (a: Right) => Right2) => <Effect, Left>(fa: TaskNomadEither<Effect, Left, Right>) => TaskNomadEither<Effect, Left, Right2> = (f) =>
    T.map(NE.map(f))

/**
 * Map a pair of functions over the two last type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 1.0.0
 */
export const bimap: <Left, Left2, Right, Right2>(
    f: (e: Left) => Left2,
    g: (a: Right) => Right2
) => <Effect = never>(fa: TaskNomadEither<Effect, Left, Right>) => TaskNomadEither<Effect, Left2, Right2> =
    /*#__PURE__*/
    (f, g) => T.map(NE.bimap(f, g))

/**
 * Map a function over the second type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 1.0.0
 */
export const mapLeft: <Left, Left2>(f: (e: Left) => Left2) => <Effect, Right>(fa: TaskNomadEither<Effect, Left, Right>) => TaskNomadEither<Effect, Left2, Right> = (f) =>
    T.map(NE.mapLeft(f))

/**
 * Less strict version of [`ap`](#ap).
 *
 * @category Apply
 * @since 1.0.0
 */
export const apW = <Effect, Left, Right>(fa: TaskNomadEither<Effect, Left, Right>): <Left2, Right2>(fab: TaskNomadEither<Effect, Left2, (a: Right) => Right2>) => TaskNomadEither<Effect, Left | Left2, Right2> =>
    flow(
        T.map(gab => (ga: NomadEither<Effect, Left, Right>) => NE.apW(ga)(gab)),
        T.ap(fa),
    )

/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 1.0.0
 */
export const ap: <Effect, Left, Right>(fa: TaskNomadEither<Effect, Left, Right>) =>
    <Right2>(fab: TaskNomadEither<Effect, Left, (a: Right) => Right2>) => TaskNomadEither<Effect, Left, Right2> = apW;

/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * Derivable from `Apply`.
 *
 * @category combinators
 * @since 1.0.0
 */
export const apFirst:
    <Effect, Left, Right2>(fb: TaskNomadEither<Effect, Left, Right2>) =>
        <Right>(fa: TaskNomadEither<Effect, Left, Right>) => TaskNomadEither<Effect, Left, Right> =
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
    <Effect, Left, Right2>(fb: TaskNomadEither<Effect, Left, Right2>):
        <Right>(fa: TaskNomadEither<Effect, Left, Right>) =>
            TaskNomadEither<Effect, Left, Right2> =>
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
export const chainW = <Effect, Left, Left2, Right, Right2>(onRight: (a: Right) => TaskNomadEither<Effect, Left, Right2>): ((an: TaskNomadEither<Effect, Left2, Right>) => TaskNomadEither<Effect, Left2 | Left, Right2>) =>
    TN.chain(E.fold<Left2, Right, TaskNomadEither<Effect, Left2 | Left, Right2>>(left, onRight));

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 1.0.0
 */
export const chain:
    <Effect, Left, Right, Right2>(f: (a: Right) => TaskNomadEither<Effect, Left, Right2>) =>
        (ma: TaskNomadEither<Effect, Left, Right>) =>
            TaskNomadEither<Effect, Left, Right2> = chainW

/**
 * Less strict version of [`chainFirst`](#chainFirst)
 *
 * Derivable from `Monad`.
 *
 * @category combinators
 * @since 1.0.0
 */
export const chainFirstW: <Effect, Left, Right, Right2>(f: (a: Right) => TaskNomadEither<Effect, Left, Right2>) =>
    <Left2>(ma: TaskNomadEither<Effect, Left2, Right>) =>
        TaskNomadEither<Effect, Left | Left2, Right> =
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
export const chainFirst: <Effect, Left, Right, Right2>(f: (a: Right) => TaskNomadEither<Effect, Left, Right2>) =>
    (ma: TaskNomadEither<Effect, Left, Right>) =>
        TaskNomadEither<Effect, Left, Right> = chainFirstW

/**
 * Derivable from `Monad`.
 *
 * @category combinators
 * @since 1.0.0
 */
export const flatten: <Effect, Left, Right>(mma: TaskNomadEither<Effect, Left, TaskNomadEither<Effect, Left, Right>>) => TaskNomadEither<Effect, Left, Right> =
    /*#__PURE__*/
    chain(identity)

/**
 * Less strict version of [`alt`](#alt).
 *
 * @category Alt
 * @since 1.0.0
 */
export const altW =
    <Effect, Left2, Right2>(that: () => TaskNomadEither<Effect, Left2, Right2>) =>
        <Left, Right>(fa: TaskNomadEither<Effect, Left, Right>): TaskNomadEither<Effect, Left | Left2, Right | Right2> => pipe(
            fa,
            TN.chain(E.fold<Left, Right, TaskNomadEither<Effect, Left | Left2, Right | Right2>>(that, right))
        )

/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category Alt
 * @since 1.0.0
 */
export const alt: <Effect, Left, Right>(that: () => TaskNomadEither<Effect, Left, Right>) =>
    (fa: TaskNomadEither<Effect, Left, Right>) => TaskNomadEither<Effect, Left, Right> = altW

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
export const URI = "TaskNomadEither"

/**
 * @category instances
 * @since 1.0.0
 */
export type URI = typeof URI

declare module "fp-ts/HKT" {
    interface URItoKind3<R, E, A> {
        readonly [URI]: TaskNomadEither<R, E, A>
    }
}

/**
 * Semigroup returning the left-most non-`Left` value. If both operands are `Right`s then the inner values are
 * concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 1.0.0
 */
export function getSemigroup<Effect, Left, Right>(S: Semigroup<Right>): Semigroup<TaskNomadEither<Effect, Left, Right>> {
    return T.getSemigroup(NE.getSemigroup(S))
}

/**
 * @category instances
 * @since 1.0.0
 */
export function getMonoid<Effect, Left, Right>(M: Monoid<Right>): Monoid<TaskNomadEither<Effect, Left, Right>> {
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
export function getApplySemigroup<Effect, Left, Right>(S: Semigroup<Right>): Semigroup<TaskNomadEither<Effect, Left, Right>> {
    return T.getSemigroup(NE.getApplySemigroup(S))
}

/**
 * @category instances
 * @since 1.0.0
 */
export function getApplyMonoid<Effect, Left, Right>(M: Monoid<Right>): Monoid<TaskNomadEither<Effect, Left, Right>> {
    return {
        concat: getApplySemigroup<Effect, Left, Right>(M).concat,
        empty: right(M.empty)
    }
}

/**
 * @category instances
 * @since 1.0.0
 */
export function getApplicativeTaskNomadEitherValidation<Left>(SE: Semigroup<Left>): Applicative3C<URI, Left> {
    const AV = NE.getApplicativeNomadEitherValidation(SE)
    const app: <Effect, Right>(fga: TaskNomadEither<Effect, Left, Right>) => <Right2>(fgab: TaskNomadEither<Effect, Left, (a: Right) => Right2>) => TaskNomadEither<Effect, Left, Right2> =
        <Effect, Right>(fga: TaskNomadEither<Effect, Left, Right>): <Right2>(fgab: TaskNomadEither<Effect, Left, (a: Right) => Right2>) => TaskNomadEither<Effect, Left, Right2> =>
            flow(
                T.map((gab) => (ga: NomadEither<Effect, Left, Right>) => AV.ap(gab, ga)),
                T.ap(fga)
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
export function getAltTaskNomadEitherValidation<Left>(SL: Semigroup<Left>): Alt3C<URI, Left> {
    return {
        URI,
        _E: undefined as any,
        map: map_,
        alt: <Effect, Right>(an1: TaskNomadEither<Effect, Left, Right>, an2L: Lazy<TaskNomadEither<Effect, Left, Right>>): TaskNomadEither<Effect, Left, Right> => {
            const V = NE.getAltNomadValidation(SL);
            return pipe(
                an1,
                T.chain(ne1 =>
                    E.isRight(ne1.value)
                        ? T.of(ne1)
                        : pipe(
                        an2L(),
                        T.map(ne2 => V.alt(ne1, () => ne2)),
                        )
                )
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
    const applicativeNomadValidation = getApplicativeTaskNomadEitherValidation(SE)
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
export const taskNomadEither: Monad3<URI> & Bifunctor3<URI> & Alt3<URI> & MonadThrow3<URI> = {
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
export const Do: TaskNomadEither<never, never, {}> = of({})

/**
 * @since 1.0.0
 */
export const bindTo = <Key extends string>(name: Key): <Effect, Left, Right>(fa: TaskNomadEither<Effect, Left, Right>) => TaskNomadEither<Effect, Left, { [K in Key]: Right }> =>
    map(bindTo_(name))

/**
 * @since 1.0.0
 */
export const bindW = <Key extends string, Left, Right, Effect, Right2>(
    name: Exclude<Key, keyof Right>,
    f: (a: Right) => TaskNomadEither<Effect, Left, Right2>
): ((fa: TaskNomadEither<Effect, Left, Right>) => TaskNomadEither<Effect, Left, { [K in keyof Right | Key]: K extends keyof Right ? Right[K] : Right2 }>) =>
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
    f: (a: Right) => TaskNomadEither<Effect, Left, Right2>
) => (fa: TaskNomadEither<Effect, Left, Right>) => TaskNomadEither<Effect, Left, { [K in keyof Right | Key]: K extends keyof Right ? Right[K] : Right2 }> = bindW
