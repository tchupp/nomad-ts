import {task, Task} from "fp-ts/lib/Task";
import {either, Either, left as eitherLeft, right as eitherRight} from "fp-ts/lib/Either";
import {TaskEither} from "fp-ts/lib/TaskEither";

import {nomad, Nomad} from "./Nomad";
import {fromNomadTE, NomadRTE} from "./NomadRTE";
import {pipe} from "fp-ts/lib/pipeable";

export const URI = "NomadTE";
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
    interface URI2HKT3<U, L, A> {
        NomadTE: NomadTE<U, L, A>
    }
}

export class NomadTE<Effect, Left, Right> {
    readonly _URI!: URI;

    constructor(readonly inner: Task<Nomad<Effect, Either<Left, Right>>>) {
    }

    async run(): Promise<[Either<Left, Right>, ReadonlyArray<Effect>]> {
        const n = await this.inner.run();
        return [n.value, n.effects] as [Either<Left, Right>, ReadonlyArray<Effect>];
    }

    async eval(): Promise<Either<Left, Right>> {
        const n = await this.inner.run();
        return n.value;
    }

    concat(effect: Effect | ReadonlyArray<Effect>): NomadTE<Effect, Left, Right> {
        return pipe(
            task.map(this.inner, innerNomad => innerNomad.concat(effect)),
            (newInner) => new NomadTE(newInner),
        );
    }

    concatL(effectL: () => Effect | ReadonlyArray<Effect>): NomadTE<Effect, Left, Right> {
        return pipe(
            task.map(this.inner, innerNomad => innerNomad.concatL(effectL)),
            (newInner) => new NomadTE(newInner),
        );
    }

    concatLeft(effectLeft: (l: Left) => Effect | ReadonlyArray<Effect>): NomadTE<Effect, Left, Right> {
        return pipe(
            task.map(this.inner, innerNomad =>
                innerNomad.concatValue(innerEither =>
                    innerEither.fold(
                        l => effectLeft(l),
                        () => []
                    ))),
            (newInner) => new NomadTE(newInner),
        );
    }

    concatRight(effectRight: (a: Right) => Effect | ReadonlyArray<Effect>): NomadTE<Effect, Left, Right> {
        return pipe(
            task.map(this.inner, innerNomad =>
                innerNomad.concatValue(innerEither =>
                    innerEither.fold(
                        () => [],
                        r => effectRight(r)
                    ))),
            (newInner) => new NomadTE(newInner),
        );
    }

    map<Right2>(f: (a: Right) => Right2): NomadTE<Effect, Left, Right2> {
        const newInner = this.inner.map(innerNomad => innerNomad.map(innerEither => innerEither.map(a => f(a))));
        return new NomadTE(newInner);
    }

    mapLeft<Left2>(f: (l: Left) => Left2): NomadTE<Effect, Left2, Right> {
        const newInner = this.inner.map(innerNomad => innerNomad.map(innerEither => innerEither.mapLeft(a => f(a))));
        return new NomadTE(newInner);
    }

    bimap<Left2, Right2>(f: (l: Left) => Left2, g: (a: Right) => Right2): NomadTE<Effect, Left2, Right2> {
        const newInner = this.inner.map(innerNomad => innerNomad.map(innerEither => innerEither.bimap(f, g)));
        return new NomadTE(newInner);
    }

    fold<Result>(leftValue: (l: Left) => Result, rightValue: (a: Right) => Result): Task<Nomad<Effect, Result>> {
        return this.inner.map(innerNomad => innerNomad.map(innerEither => innerEither.fold(leftValue, rightValue)));
    }

    ap<Right2>(fab: NomadTE<Effect, Left, (a: Right) => Right2>): NomadTE<Effect, Left, Right2> {
        const newInner = Promise.all([this.inner.run(), fab.inner.run()])
            .then(([current, f]) => current.chain(innerEither => f.map(ff => innerEither.ap(ff))));

        return new NomadTE(new Task(() => newInner));
    }

    chain<Right2>(f: (a: Right) => NomadTE<Effect, Left, Right2>): NomadTE<Effect, Left, Right2> {
        const newInner = this.inner.run()
            .then(async (currentInner: Nomad<Effect, Either<Left, Right>>): Promise<Nomad<Effect, Either<Left, Right2>>> => {
                const innerEither: Either<Left, Right> = currentInner.value;

                if (innerEither.isLeft()) {
                    return currentInner.map(() => eitherLeft(innerEither.value));
                } else {
                    const {effects, value} = await f(innerEither.value).inner.run();
                    return new Nomad(currentInner.effects.concat(effects), value);
                }
            });

        return new NomadTE(new Task(() => newInner));
    }

    orElse<Left2 = Left>(f: (l: Left) => NomadTE<Effect, Left2, Right>): NomadTE<Effect, Left2, Right> {
        const newInner = this.inner.run()
            .then(async (currentInner: Nomad<Effect, Either<Left, Right>>): Promise<Nomad<Effect, Either<Left2, Right>>> => {
                const innerEither: Either<Left, Right> = currentInner.value;

                if (innerEither.isRight()) {
                    return currentInner.map(() => eitherRight(innerEither.value));
                } else {
                    const {effects, value} = await f(innerEither.value).inner.run();
                    return new Nomad(currentInner.effects.concat(effects), value);
                }
            });

        return new NomadTE(new Task(() => newInner));
    }

    orElseNull(): NomadTE<Effect, Left, Right | null> {
        return this
            .map<Right | null>(value => value)
            .orElse(() => right(null))
    }

    toNomadRTE<E>(): NomadRTE<E, Effect, Left, Right> {
        return fromNomadTE(this);
    }
}

export const fromEither = <Effect, Left, Right>(eitherValue: Either<Left, Right>): NomadTE<Effect, Left, Right> =>
    new NomadTE(task.of(nomad.of(eitherValue)));

export const fromTaskEither = <Effect, Left, Right>(fa: TaskEither<Left, Right>): NomadTE<Effect, Left, Right> =>
    new NomadTE(fa.value.map(a => nomad.of(a)));

export const fromNomad = <Effect, Left, Right>(f: Nomad<Effect, Right>): NomadTE<Effect, Left, Right> =>
    new NomadTE(task.of(f.map(a => either.of(a))));

export const left = <Effect, Left, Right = never>(l: Left): NomadTE<Effect, Left, Right> =>
    new NomadTE(task.of(nomad.of(eitherLeft(l))));

export const right = <Effect, Left, Right>(a: Right): NomadTE<Effect, Left, Right> =>
    new NomadTE(task.of(nomad.of(eitherRight(a))));

const map = <Effect, Left, Right, Right2>(f: (a: Right) => Right2) => (fa: NomadTE<Effect, Left, Right>): NomadTE<Effect, Left, Right2> =>
    fa.map(f);

const of = <Effect, Left, Right>(value: Right): NomadTE<Effect, Left, Right> =>
    right(value);

const ap = <Effect, Left, Right, Right2>(fab: NomadTE<Effect, Left, (a: Right) => Right2>) => (fa: NomadTE<Effect, Left, Right>): NomadTE<Effect, Left, Right2> =>
    fa.ap(fab);

const chain = <Effect, Left, Right, Right2, Left2 extends Left = Left>(f: (a: Right) => NomadTE<Effect, Left2, Right2>) => (fa: NomadTE<Effect, Left, Right>): NomadTE<Effect, Left, Right2> =>
    fa.chain(f);

const combine = function <Effect, Left, Right, Left2 = Left>(nomads: NomadTE<Effect, Left2, Right>[]): NomadTE<Effect, Left, Right[]> {
    const initialValue = nomadTE.of<Effect, Left, Right[]>([]);

    return nomads
        .reduce(
            (final: NomadTE<Effect, Left, Right[]>, next: NomadTE<Effect, Left2, Right>) =>
                final.chain((results: Right[]) =>
                    next.map(nextResult => [...results, nextResult])
                        .orElse<Left>(() => of<Effect, Left, Right[]>(results))
                ),
            initialValue
        );
};

const concatRight = <Effect, Left, Right>(effectRight: (a: Right) => Effect | ReadonlyArray<Effect>) => (fa: NomadTE<Effect, Left, Right>): NomadTE<Effect, Left, Right> =>
    fa.concatRight(effectRight);

const concatLeft = <Effect, Left, Right>(effectLeft: (l: Left) => Effect | ReadonlyArray<Effect>) => (fa: NomadTE<Effect, Left, Right>): NomadTE<Effect, Left, Right> =>
    fa.concatLeft(effectLeft);

export const nomadTE = {
    URI,
    map,
    ap,
    of,
    right,
    left,
    chain,
    combine,
    concatRight,
    concatLeft,
    fromEither,
    fromTaskEither,
    fromNomad
};
