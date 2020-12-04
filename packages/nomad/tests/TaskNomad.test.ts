import test from "ava";

import {pipe} from "fp-ts/function";
import {semigroupSum} from "fp-ts/Semigroup";
import * as N from "../src/Nomad";
import * as TN from "../src/TaskNomad";

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

test("constructors - pure", async t => {
    const actual = TN.pure("hold dis");

    const expected = {
        effects: [],
        value: "hold dis",
    }

    t.deepEqual(await actual(), expected);
});

test("constructors - effect", async t => {
    const actual = pipe(
        TN.pure("hold dis"),
        TN.effect(1),
        TN.effect(2),
        TN.effect(3),
        TN.effect(4),
    );

    const expected = {
        effects: [1, 2, 3, 4],
        value: "hold dis",
    }

    t.deepEqual(await actual(), expected);
});

test("constructors - effectV", async t => {
    const actual = pipe(
        TN.pure("hold dis"),
        TN.effectV((value) => value.length),
        TN.effectV((value) => value.length + 1),
    );

    const expected = {
        effects: [8, 9],
        value: "hold dis",
    }

    t.deepEqual(await actual(), expected);
});

test("constructors - effectL", async t => {
    const actual = pipe(
        TN.pure("hold dis"),
        TN.effectL(() => 1),
        TN.effectL(() => 2),
    );

    const expected = {
        effects: [1, 2],
        value: "hold dis",
    }

    t.deepEqual(await actual(), expected);
});

test("constructors - effects", async t => {
    const actual = pipe(
        TN.pure("hold dis"),
        TN.effects([1, 2]),
        TN.effects([3, 4]),
    );

    const expected = {
        effects: [1, 2, 3, 4],
        value: "hold dis",
    }

    t.deepEqual(await actual(), expected);
});

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

test("Nomad is a functor: URI", async t => {
    {
        t.deepEqual("TaskNomad", TN.taskNomad.URI);
    }
});

test("Nomad is a functor: map", async t => {
    const initial = TN.pure("hold dis");
    const expected = N.pure(8);

    {
        const actual = TN.map((a: string) => a.length)(initial);
        t.deepEqual(await actual(), expected);
    }
    {
        const actual = TN.taskNomad.map(initial, (a: string) => a.length);
        t.deepEqual(await actual(), expected);
    }
});

test("Nomad is applicative: of", async t => {
    const actual = TN.taskNomad.of("hold dis");

    const expected = N.pure("hold dis");
    t.deepEqual(await actual(), expected);
});

test("Nomad is applicative: ap", async t => {
    const fab = pipe(
        TN.taskNomad.of<string, (n: number) => number>(n => n * 2),
        TN.effect("that effect"),
    );

    const initial = pipe(
        TN.taskNomad.of<string, number>(1),
        TN.effect("this effect"),
    );
    const expected = pipe(
        N.nomad.of<string, number>(2),
        N.effect("this effect"),
        N.effect("that effect"),
    );

    const actual1 = TN.ap(initial)(fab);
    const actual2 = TN.taskNomad.ap(fab, initial);
    t.deepEqual(await actual1(), expected);
    t.deepEqual(await actual2(), expected);
});

test("Nomad is a monad: chain", async t => {
    const initial = pipe(
        TN.pure("world"),
        TN.effect(1),
    );

    const expected = {
        effects: [1, 2],
        value: "hello, world!",
    };

    {
        const actual = TN.chain(a => pipe(
            TN.pure(`hello, ${a}!`),
            TN.effect(2),
        ))(initial);
        t.deepEqual(await actual(), expected);
    }
    {
        const actual = TN.taskNomad.chain(initial, a => pipe(
            TN.pure(`hello, ${a}!`),
            TN.effect(2),
        ));
        t.deepEqual(await actual(), expected);
    }
});

test("getSemigroup - result is order dependent", async t => {
    const actual1 = pipe(
        TN.pure(952),
        TN.effect("one"),
    );
    const actual2 = pipe(
        TN.pure(17),
        TN.effect("two"),
    );

    const S = TN.getSemigroup(semigroupSum);

    {
        const actual = S.concat(actual1, actual2);

        const expected = {
            effects: ["one", "two"],
            value: 969,
        };

        t.deepEqual(await actual(), expected);
    }
    {
        const actual = S.concat(actual2, actual1);

        const expected = {
            effects: ["two", "one"],
            value: 969,
        };

        t.deepEqual(await actual(), expected);
    }
});

// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------

test("do notation - bind returns a Nomad with an option with one key/value pair", async t => {
    const actual = pipe(
        TN.Do,
        TN.bind("key", ({}) => TN.pure("value")),
    );

    const expected = {
        effects: [],
        value: {
            key: "value"
        }
    };

    t.deepEqual(await actual(), expected);
});

test("do notation - bindTo returns a Nomad with an option with one key/value pair", async t => {
    const actual = pipe(
        TN.pure("value"),
        TN.bindTo("key"),
    );

    const expected = {
        effects: [],
        value: {
            key: "value"
        }
    };

    t.deepEqual(await actual(), expected);
});
