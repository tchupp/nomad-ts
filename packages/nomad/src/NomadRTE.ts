import {
    fromEither as teFromEither,
    fromNomad as teFromNomad,
    fromTaskEither as teFromTaskEither,
    NomadTE,
    nomadTE
} from "./NomadTE";
import {Nomad} from "./Nomad";

import {left2v as taskEitherLeft2v, TaskEither} from "fp-ts/lib/TaskEither";
import {Either} from "fp-ts/lib/Either";
import {Reader} from "fp-ts/lib/Reader";
import {Task} from "fp-ts/lib/Task";

export const URI = "NomadRTE";
export type URI = typeof URI

declare module "fp-ts/lib/HKT" {
    interface URI2HKT4<X, U, L, A> {
        NomadRTE: NomadRTE<X, U, L, A>
    }
}

export class NomadRTE<Context, Effect, Left, Right> {
    readonly _URI!: URI;

    constructor(readonly inner: (e: Context) => NomadTE<Effect, Left, Right>) {
    }

    run(e: Context): Promise<[Either<Left, Right>, ReadonlyArray<Effect>]> {
        return this.inner(e).run();
    }

    eval(e: Context): Promise<Either<Left, Right>> {
        return this.inner(e).eval();
    }

    concat(effect: Effect | ReadonlyArray<Effect>): NomadRTE<Context, Effect, Left, Right> {
        return new NomadRTE(e => this.inner(e).concat(effect));
    }

    concatL(effectL: () => Effect | ReadonlyArray<Effect>): NomadRTE<Context, Effect, Left, Right> {
        return new NomadRTE(e => this.inner(e).concatL(effectL));
    }

    concatLeft(effectLeft: (l: Left) => Effect | ReadonlyArray<Effect>): NomadRTE<Context, Effect, Left, Right> {
        return new NomadRTE(e => this.inner(e).concatLeft(effectLeft));
    }

    concatRight(effectRight: (a: Right) => Effect | ReadonlyArray<Effect>): NomadRTE<Context, Effect, Left, Right> {
        return new NomadRTE(e => this.inner(e).concatRight(effectRight));
    }

    map<Right2>(f: (a: Right) => Right2): NomadRTE<Context, Effect, Left, Right2> {
        return new NomadRTE(e => this.inner(e).map(f));
    }

    mapLeft<Left2>(f: (l: Left) => Left2): NomadRTE<Context, Effect, Left2, Right> {
        return new NomadRTE(e => this.inner(e).mapLeft(f));
    }

    bimap<Left2, Right2>(f: (l: Left) => Left2, g: (a: Right) => Right2): NomadRTE<Context, Effect, Left2, Right2> {
        return new NomadRTE(e => this.inner(e).bimap(f, g));
    }

    fold<Result>(leftValue: (l: Left) => Result, rightValue: (a: Right) => Result): Reader<Context, Task<Nomad<Effect, Result>>> {
        return new Reader(e => this.inner(e).fold(leftValue, rightValue));
    }

    ap<Right2>(fab: NomadRTE<Context, Effect, Left, (a: Right) => Right2>): NomadRTE<Context, Effect, Left, Right2> {
        return new NomadRTE(e => this.inner(e).ap(fab.inner(e)));
    }

    chain<Right2>(f: (a: Right) => NomadRTE<Context, Effect, Left, Right2>): NomadRTE<Context, Effect, Left, Right2> {
        return new NomadRTE((e: Context) => this.inner(e).chain(a => f(a).inner(e)));
    }

    orElse<Left2 = Left>(f: (l: Left) => NomadRTE<Context, Effect, Left2, Right>): NomadRTE<Context, Effect, Left2, Right> {
        return new NomadRTE(e => this.inner(e).orElse(l => f(l).inner(e)));
    }

    orElseNull(): NomadRTE<Context, Effect, Left, Right | null> {
        return new NomadRTE(e => this.inner(e).orElseNull());
    }

    local<Context2 = Context>(f: (e: Context2) => Context): NomadRTE<Context2, Effect, Left, Right> {
        return new NomadRTE<Context2, Effect, Left, Right>(e2 => this.inner(f(e2)));
    }
}

export const fromEither = <Context, Effect, Left, Right>(eitherValue: Either<Left, Right>): NomadRTE<Context, Effect, Left, Right> =>
    teFromEither<Effect, Left, Right>(eitherValue).toNomadRTE();

export const fromTaskEither = <Context, Effect, Left, Right>(taskEitherValue: TaskEither<Left, Right>): NomadRTE<Context, Effect, Left, Right> =>
    teFromTaskEither<Effect, Left, Right>(taskEitherValue).toNomadRTE();

export const fromNomadTE = <Context, Effect, Left, Right>(fa: NomadTE<Effect, Left, Right>): NomadRTE<Context, Effect, Left, Right> =>
    new NomadRTE(() => fa);

export const fromNomad = <Context, Effect, Left, Right>(fa: Nomad<Effect, Right>): NomadRTE<Context, Effect, Left, Right> =>
    new NomadRTE(() => teFromNomad(fa));

export const left = <Context, Effect = never, Left = never, Right = never>(l: Left): NomadRTE<Context, Effect, Left, Right> =>
    fromNomadTE(teFromTaskEither(taskEitherLeft2v(l)));

export const right = <Context, Effect, Left, Right>(value: Right): NomadRTE<Context, Effect, Left, Right> =>
    fromNomadTE(nomadTE.of(value));

export const fromReader = <Context, Effect, Left, Right>(fa: Reader<Context, Right>): NomadRTE<Context, Effect, Left, Right> =>
    new NomadRTE<Context, Effect, Left, Context>(e => nomadTE.of(e))
        .map(e => fa.run(e));

export const ask = <Context, Effect, Left>(): NomadRTE<Context, Effect, Left, Context> =>
    new NomadRTE(e => nomadTE.of(e));

export const asks = <Context, Effect, Left, Right>(f: (e: Context) => Right): NomadRTE<Context, Effect, Left, Right> =>
    new NomadRTE<Context, Effect, Left, Context>(e => nomadTE.of(e))
        .map(e => f(e));

const map = <Context, Effect, Left, Right, Right2>(f: (a: Right) => Right2) => (fa: NomadRTE<Context, Effect, Left, Right>): NomadRTE<Context, Effect, Left, Right2> =>
    fa.map(f);

const mapLeft = <Context, Effect, Left, Right, Left2>(f: (a: Left) => Left2) => (fa: NomadRTE<Context, Effect, Left, Right>): NomadRTE<Context, Effect, Left2, Right> =>
    fa.mapLeft(f);

const of = <Context, Effect, Left, Right>(value: Right): NomadRTE<Context, Effect, Left, Right> =>
    right(value);

const ap = <Context, Effect, Left, Right, Right2>(fab: NomadRTE<Context, Effect, Left, (a: Right) => Right2>) => (fa: NomadRTE<Context, Effect, Left, Right>): NomadRTE<Context, Effect, Left, Right2> =>
    fa.ap(fab);

const chain = <Context, Effect, Left, Right, Right2>(f: (a: Right) => NomadRTE<Context, Effect, Left, Right2>) => (fa: NomadRTE<Context, Effect, Left, Right>): NomadRTE<Context, Effect, Left, Right2> =>
    fa.chain(f);

const combine = <Context, Effect, Left, Right, Left2 = Left>(nomads: NomadRTE<Context, Effect, Left2, Right>[]): NomadRTE<Context, Effect, Left, Right[]> =>
    new NomadRTE(e =>
        nomadTE.combine(
            nomads.map(n => n.inner(e))));

const concatRight = <Context, Effect, Left, Right>(effectRight: (a: Right) => Effect | ReadonlyArray<Effect>) => (fa: NomadRTE<Context, Effect, Left, Right>): NomadRTE<Context, Effect, Left, Right> =>
    fa.concatRight(effectRight);

const concatLeft = <Context, Effect, Left, Right>(effectLeft: (l: Left) => Effect | ReadonlyArray<Effect>) => (fa: NomadRTE<Context, Effect, Left, Right>): NomadRTE<Context, Effect, Left, Right> =>
    fa.concatLeft(effectLeft);

export const nomadRTE = {
    URI,
    map,
    mapLeft,
    ap,
    of,
    chain,
    combine,
    concatRight,
    concatLeft,
    ask,
    asks,
    right,
    left,
    fromEither,
    fromTaskEither,
    fromNomadTE,
    fromNomad,
    fromReader
};
