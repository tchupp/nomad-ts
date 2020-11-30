import test from "ava";

import {pipe} from "fp-ts/function";
import {eqNumber, eqString} from "fp-ts/Eq";
import {semigroupSum} from "fp-ts/Semigroup";
import * as N from "../src/Nomad";

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

test("constructors - pure", t => {
    const actual = N.pure("hold dis");

    const expected = {
        effects: [],
        value: "hold dis",
    }

    t.deepEqual(actual, expected);
});

test("constructors - effect", t => {
    const actual = pipe(
        N.pure("hold dis"),
        N.effect(1),
        N.effect(2),
        N.effect(3),
        N.effect(4),
    );

    const expected = {
        effects: [1, 2, 3, 4],
        value: "hold dis",
    }

    t.deepEqual(actual, expected);
});

test("constructors - effectV", t => {
    const actual = pipe(
        N.pure("hold dis"),
        N.effectV((value) => value.length),
        N.effectV((value) => value.length + 1),
    );

    const expected = {
        effects: [8, 9],
        value: "hold dis",
    }

    t.deepEqual(actual, expected);
});

test("constructors - effectL", t => {
    const actual = pipe(
        N.pure("hold dis"),
        N.effectL(() => 1),
        N.effectL(() => 2),
    );

    const expected = {
        effects: [1, 2],
        value: "hold dis",
    }

    t.deepEqual(actual, expected);
});

test("constructors - effects", t => {
    const actual = pipe(
        N.pure("hold dis"),
        N.effects([1, 2]),
        N.effects([3, 4]),
    );

    const expected = {
        effects: [1, 2, 3, 4],
        value: "hold dis",
    }

    t.deepEqual(actual, expected);
});

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

test("Nomad is a functor: URI", t => {
    {
        t.deepEqual("Nomad", N.nomad.URI);
    }
});

test("Nomad is a functor: map", t => {
    const initial = N.pure("hold dis");
    const expected = N.pure(8);

    {
        const actual = N.map((a: string) => a.length)(initial);
        t.deepEqual(expected, actual);
    }
    {
        const actual = N.nomad.map(initial, (a: string) => a.length);
        t.deepEqual(expected, actual);
    }
});

test("Nomad is applicative: of", t => {
    const actual = N.nomad.of("hold dis");

    const expected = N.pure("hold dis");
    t.deepEqual(expected, actual);
});

test("Nomad is applicative: ap", t => {
    const fab = pipe(
        N.nomad.of<string, (n: number) => number>(n => n * 2),
        N.effect("that effect"),
    );

    const initial: N.Nomad<string, number> = pipe(
        N.nomad.of<string, number>(1),
        N.effect("this effect"),
    );
    const expected: N.Nomad<string, number> = pipe(
        N.nomad.of<string, number>(2),
        N.effect("this effect"),
        N.effect("that effect"),
    );

    t.deepEqual(expected, N.ap(initial)(fab));
    t.deepEqual(expected, N.nomad.ap(fab, initial));
});

test("Nomad is a monad: chain", t => {
    const initial = pipe(
        N.pure("world"),
        N.effect(1),
    );

    const expected = {
        effects: [1, 2],
        value: "hello, world!",
    };

    {
        const actual = N.chain(a => pipe(
            N.pure(`hello, ${a}!`),
            N.effect(2),
        ))(initial);
        t.deepEqual(expected, actual);
    }
    {
        const actual = N.nomad.chain(initial, a => pipe(
            N.pure(`hello, ${a}!`),
            N.effect(2),
        ));
        t.deepEqual(expected, actual);
    }
    {
        const actual = pipe(
            initial,
            N.map(a => `hello, ${a}!`),
            N.effect(2),
        );
        t.deepEqual(expected, actual);
    }
});

test("getEq - return true when values and effects are the same", t => {
    const thing = {
        effects: [1, 2, 3, 4],
        value: "hold dis",
    }

    const eq = N.getEq(eqNumber, eqString);
    t.truthy(eq.equals(thing, thing));
});

test("getEq - return true when values and effects are equal", t => {
    const actual = pipe(
        N.pure("hold dis"),
        N.effect(1),
        N.effect(2),
        N.effect(3),
        N.effect(4),
    );

    const expected = {
        effects: [1, 2, 3, 4],
        value: "hold dis",
    }

    t.deepEqual(actual, expected);

    const eq = N.getEq(eqNumber, eqString);
    t.truthy(eq.equals(actual, expected));
});

test("getEq - return false when values and effects are not equal", t => {
    const actual = pipe(
        N.pure("hold dis"),
        N.effect(1),
    );

    const expected = {
        effects: [1, 2, 3, 4],
        value: "not dis",
    }

    const eq = N.getEq(eqNumber, eqString);
    t.falsy(eq.equals(actual, expected));
});

test("getSemigroup - result is order dependent", t => {
    const actual1 = pipe(
        N.pure(952),
        N.effect("one"),
    );
    const actual2 = pipe(
        N.pure(17),
        N.effect("two"),
    );

    const S = N.getSemigroup(semigroupSum);

    {
        const actual = S.concat(actual1, actual2);

        const expected = {
            effects: ["one", "two"],
            value: 969,
        };

        t.deepEqual(actual, expected);
    }
    {
        const actual = S.concat(actual2, actual1);

        const expected = {
            effects: ["two", "one"],
            value: 969,
        };

        t.deepEqual(actual, expected);
    }
});

test("do notation - bind returns a Nomad with an option with one key/value pair", t => {
    const actual = pipe(
        N.Do,
        N.bind("key", ({}) => N.pure("value")),
    );

    const expected = {
        effects: [],
        value: {
            key: "value"
        }
    };

    t.deepEqual(actual, expected);
});

test("do notation - bindTo returns a Nomad with an option with one key/value pair", t => {
    const actual = pipe(
        N.pure("value"),
        N.bindTo("key"),
    );

    const expected = {
        effects: [],
        value: {
            key: "value"
        }
    };

    t.deepEqual(actual, expected);
});
