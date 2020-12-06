import {Kind4, URIS4} from "fp-ts/HKT";
import {Lazy} from "fp-ts/function";

/**
 * @category type classes
 * @since 1.0.0
 */
export interface Functor4C<F extends URIS4, E> {
    readonly URI: F
    readonly _E: E
    readonly map: <S, R, A, B>(fa: Kind4<F, S, R, E, A>, f: (a: A) => B) => Kind4<F, S, R, E, B>
}

/**
 * @category type classes
 * @since 1.0.0
 */
export interface Apply4C<F extends URIS4, E> extends Functor4C<F, E> {
    readonly ap: <S, R, A, B>(fab: Kind4<F, S, R, E, (a: A) => B>, fa: Kind4<F, S, R, E, A>) => Kind4<F, S, R, E, B>
}

/**
 * @category type classes
 * @since 1.0.0
 */
export interface Applicative4C<F extends URIS4, E> extends Apply4C<F, E> {
    readonly of: <S, R, A>(a: A) => Kind4<F, S, R, E, A>
}

/**
 * @category type classes
 * @since 1.0.0
 */
export interface Chain4C<F extends URIS4, E> extends Apply4C<F, E> {
    readonly chain: <S, R, A, B>(fa: Kind4<F, S, R, E, A>, f: (a: A) => Kind4<F, S, R, E, B>) => Kind4<F, S, R, E, B>
}


/**
 * @category type classes
 * @since 1.0.0
 */
export interface Monad4C<M extends URIS4, E> extends Applicative4C<M, E>, Chain4C<M, E> {
}

/**
 * @category type classes
 * @since 1.0.0
 */
export interface MonadThrow4C<M extends URIS4, E> extends Monad4C<M, E> {
    readonly throwError: <S, R, A>(e: E) => Kind4<M, S, R, E, A>
}

/**
 * @category type classes
 * @since 1.0.0
 */
export interface Alt4C<F extends URIS4, E> extends Functor4C<F, E> {
    readonly alt: <S, R, A>(fa: Kind4<F, S, R, E, A>, that: Lazy<Kind4<F, S, R, E, A>>) => Kind4<F, S, R, E, A>
}
