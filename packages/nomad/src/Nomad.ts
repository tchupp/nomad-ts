export const URI = "Nomad";
export type URI = typeof URI

declare module "fp-ts/lib/HKT" {
    interface URI2HKT2<L, A> {
        Nomad: Nomad<L, A>
    }
}

export class Nomad<Effect, Value> {
    readonly _URI!: URI;

    constructor(readonly effects: ReadonlyArray<Effect>, readonly value: Value) {
    }

    concat(effect: Effect | ReadonlyArray<Effect>): Nomad<Effect, Value> {
        return new Nomad(this.effects.concat(effect), this.value);
    }

    concatL(effectL: () => Effect | ReadonlyArray<Effect>): Nomad<Effect, Value> {
        return new Nomad(this.effects.concat(effectL()), this.value);
    }

    concatValue(effectValue: (a: Value) => Effect | ReadonlyArray<Effect>): Nomad<Effect, Value> {
        return new Nomad(this.effects.concat(effectValue(this.value)), this.value);
    }

    map<Value2>(f: (a: Value) => Value2): Nomad<Effect, Value2> {
        return new Nomad(this.effects, f(this.value));
    }

    ap<Value2>(fab: Nomad<Effect, (a: Value) => Value2>): Nomad<Effect, Value2> {
        const b = fab.value(this.value);
        return new Nomad(this.effects.concat(fab.effects), b);
    }

    chain<Value2>(f: (a: Value) => Nomad<Effect, Value2>): Nomad<Effect, Value2> {
        const b = f(this.value);
        return new Nomad(this.effects.concat(b.effects), b.value);
    }
}

const map = <Effect, Value, Value2>(f: (a: Value) => Value2) => (fa: Nomad<Effect, Value>): Nomad<Effect, Value2> =>
    fa.map(f);

const of = <Effect, Value>(value: Value): Nomad<Effect, Value> =>
    new Nomad<Effect, Value>([], value);

const ap = <Effect, Value, Value2>(fab: Nomad<Effect, (a: Value) => Value2>) => (fa: Nomad<Effect, Value>): Nomad<Effect, Value2> =>
    fa.ap(fab);

const chain = <Effect, Value, Value2>(f: (a: Value) => Nomad<Effect, Value2>) => (fa: Nomad<Effect, Value>): Nomad<Effect, Value2> =>
    fa.chain(f);

export const nomad = {
    URI,
    map,
    ap,
    of,
    chain
};
