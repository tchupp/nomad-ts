import test from "ava";

import {pipe} from "fp-ts/function";
import {monoidSum} from "fp-ts/Monoid";
import {semigroupSum} from "fp-ts/Semigroup";
import * as E from "fp-ts/Either";
import * as IO from "fp-ts/IO";
import * as IOE from "fp-ts/IOEither";
import * as N from "../src/Nomad";
import * as NE from "../src/NomadEither";
import * as TN from "../src/TaskNomad";
import * as TNE from "../src/TaskNomadEither";

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

test("constructors - left", async t => {
    const actual = TNE.left("hold dis, left");

    const expected = {
        effects: [],
        value: E.left("hold dis, left"),
    }

    t.deepEqual(await actual(), expected);
});

test("constructors - right", async t => {
    const actual = TNE.right("hold dis, right");

    const expected = {
        effects: [],
        value: E.right("hold dis, right"),
    }

    t.deepEqual(await actual(), expected);
});

test("constructors - leftIO", async t => {
    const actual = pipe(
        IO.of("hold dis, left"),
        TNE.leftIO
    );

    const expected = {
        effects: [],
        value: E.left("hold dis, left"),
    }

    t.deepEqual(await actual(), expected);
});

test("constructors - rightIO", async t => {
    const actual = pipe(
        IO.of("hold dis, right"),
        TNE.rightIO
    );

    const expected = {
        effects: [],
        value: E.right("hold dis, right"),
    }

    t.deepEqual(await actual(), expected);
});

test("constructors - leftNomad", async t => {
    const actual = pipe(
        N.pure("hold dis, left"),
        TNE.leftNomad
    );

    const expected = {
        effects: [],
        value: E.left("hold dis, left"),
    }

    t.deepEqual(await actual(), expected);
});

test("constructors - rightNomad", async t => {
    const actual = pipe(
        N.pure("hold dis, right"),
        TNE.rightNomad
    );

    const expected = {
        effects: [],
        value: E.right("hold dis, right"),
    }

    t.deepEqual(await actual(), expected);
});

test("constructors - fromEither - right", async t => {
    const actual = pipe(
        E.right("hold dis, right"),
        TNE.fromEither,
    );

    const expected = {
        effects: [],
        value: E.right("hold dis, right"),
    }

    t.deepEqual(await actual(), expected);
});

test("constructors - fromEither - left", async t => {
    const actual = pipe(
        E.left("hold dis, left"),
        TNE.fromEither,
    );

    const expected = {
        effects: [],
        value: E.left("hold dis, left"),
    }

    t.deepEqual(await actual(), expected);
});

test("constructors - fromIOEither - right", async t => {
    const actual = pipe(
        IOE.right("hold dis, right"),
        TNE.fromIOEither,
    );

    const expected = {
        effects: [],
        value: E.right("hold dis, right"),
    }

    t.deepEqual(await actual(), expected);
});

test("constructors - fromIOEither - left", async t => {
    const actual = pipe(
        IOE.left("hold dis, left"),
        TNE.fromIOEither,
    );

    const expected = {
        effects: [],
        value: E.left("hold dis, left"),
    }

    t.deepEqual(await actual(), expected);
});

test("constructors - effect", async t => {
    const actual = pipe(
        TNE.right("hold dis, right"),
        TNE.effect(1),
        TNE.effect(2),
        TNE.effect(3),
        TNE.effect(4),
    );

    const expected = {
        effects: [1, 2, 3, 4],
        value: E.right("hold dis, right"),
    }

    t.deepEqual(await actual(), expected);
});

test("constructors - effectRight", async t => {
    const actual = pipe(
        TNE.right("hold dis, right"),
        TNE.effectRight((value) => value.length),
        TNE.effectRight((value) => value.length + 1),
        TNE.effectLeft((_) => 0),
    );

    const expected = {
        effects: [15, 16],
        value: E.right("hold dis, right"),
    }

    t.deepEqual(await actual(), expected);
});

test("constructors - effectLeft", async t => {
    const actual = pipe(
        TNE.left("hold dis, left"),
        TNE.effectLeft((value) => value.length),
        TNE.effectLeft((value) => value.length + 1),
        TNE.effectRight((_) => 0),
    );

    const expected = {
        effects: [14, 15],
        value: E.left("hold dis, left"),
    }

    t.deepEqual(await actual(), expected);
});

test("constructors - effectL", async t => {
    const actual = pipe(
        TNE.right("hold dis, right"),
        TNE.effectL(() => 1),
        TNE.effectL(() => 2),
    );

    const expected = {
        effects: [1, 2],
        value: E.right("hold dis, right"),
    }

    t.deepEqual(await actual(), expected);
});

test("constructors - effects", async t => {
    const actual = pipe(
        TNE.right("hold dis, right"),
        TNE.effects([1, 2]),
        TNE.effects([3, 4]),
    );

    const expected = {
        effects: [1, 2, 3, 4],
        value: E.right("hold dis, right"),
    }

    t.deepEqual(await actual(), expected);
});

// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------

test("fold", async t => {
    const fold = TNE.fold(
        (l: string) => pipe(
            TN.pure(l.length),
            TN.effect("was left"),
        ),
        (r: string) => pipe(
            TN.pure(r.length),
            TN.effect("was right"),
        ),
    );

    {
        const initial = pipe(
            TNE.right("hold dis, right"),
            TNE.effect("is right"),
        );
        const actual = fold(initial);
        const expected = {
            effects: ["is right", "was right"],
            value: 15,
        }

        t.deepEqual(await actual(), expected);
    }
    {
        const initial = pipe(
            TNE.left("hold dis, left"),
            TNE.effect("is left"),
        );
        const actual = fold(initial);
        const expected = {
            effects: ["is left", "was left"],
            value: 14,
        }

        t.deepEqual(await actual(), expected);
    }
});

test("getOrElse", async t => {
    const elseNomad = pipe(
        TN.pure("else this, right"),
        TN.effect(123),
    );
    const getOrElse = TNE.getOrElse(
        (l: string) => elseNomad,
    );

    {
        const initial = pipe(
            TNE.right("hold dis, right"),
            TNE.effect(456),
        );
        const actual = getOrElse(initial);
        const expected = {
            effects: [456],
            value: "hold dis, right",
        }

        t.deepEqual(await actual(), expected);
    }
    {
        const initial = pipe(
            TNE.left("hold dis, left"),
            TNE.effect(789),
        );
        const actual = getOrElse(initial);
        const expected = {
            effects: [789, 123],
            value: "else this, right",
        }

        t.deepEqual(await actual(), expected);
    }
});

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

test("orElse", async t => {
    const orElse = TNE.orElse((l: string) => pipe(
        TNE.right("recovered from left"),
        TNE.effect(`left had ${l.length} characters`)
    ));

    {
        const initial = pipe(
            TNE.left("hold dis, left"),
            TNE.effect("started as left"),
        );

        const actual = orElse(initial);

        const expected = pipe(
            NE.right("recovered from left"),
            NE.effect("started as left"),
            NE.effect(`left had 14 characters`),
        );

        t.deepEqual(await actual(), expected);
    }
    {
        const initial = pipe(
            TNE.right("hold dis, right"),
            TNE.effect("started as right"),
        );

        const actual = orElse(initial);

        t.deepEqual(await actual(), await initial());
    }
})

test("swap", async t => {
    const initial = pipe(
        TNE.right("this started as right"),
        TNE.effect("was right"),
    );
    const expected = pipe(
        NE.left("this started as right"),
        NE.effect("was right"),
    );

    const actual1 = TNE.swap(initial);
    t.deepEqual(await actual1(), expected);

    // swap(swap(initial)) == initial
    const actual2 = TNE.swap(actual1);
    t.deepEqual(await actual2(), await initial());
})

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

test("TaskNomadEither is a functor: URI", async t => {
    {
        t.deepEqual("TaskNomadEither", TNE.taskNomadEither.URI);
    }
});

test("TaskNomadEither is a functor: map", async t => {
    const initial = TNE.right("hold dis, right");
    const expected = NE.right(15);

    {
        const actual = TNE.map((a: string) => a.length)(initial);
        t.deepEqual(await actual(), expected);
    }
    {
        const actual = TNE.taskNomadEither.map(initial, (a: string) => a.length);
        t.deepEqual(await actual(), expected);
    }
});

test("TaskNomadEither is a functor: map ignores 'left' Either", async t => {
    const initial = TNE.left("hold dis, left");
    const expected = NE.left("hold dis, left");

    {
        const actual = TNE.map((a: string) => a.length)(initial);
        t.deepEqual(await actual(), expected);
    }
    {
        const actual = TNE.taskNomadEither.map(initial, (a: string) => a.length);
        t.deepEqual(await actual(), expected);
    }
});

test("TaskNomadEither is a bifunctor: bimap - left", async t => {
    const initial = TNE.left("hold dis, left");
    const expected = NE.left(14);

    {
        const actual = TNE.bimap(
            (s: string) => s.length,
            (n: number) => n + 1,
        )(initial);
        t.deepEqual(await actual(), expected);
    }
    {
        const actual = TNE.taskNomadEither.bimap(
            initial,
            (s: string) => s.length,
            (n: number) => n + 1,
        );
        t.deepEqual(await actual(), expected);
    }
});

test("TaskNomadEither is a bifunctor: bimap - right", async t => {
    const initial = TNE.right("hold dis, right");
    const expected = NE.right(15);

    {
        const actual = TNE.bimap(
            (n: number) => n + 1,
            (s: string) => s.length,
        )(initial);
        t.deepEqual(await actual(), expected);
    }
    {
        const actual = TNE.taskNomadEither.bimap(
            initial,
            (n: number) => n + 1,
            (s: string) => s.length,
        );
        t.deepEqual(await actual(), expected);
    }
});

test("TaskNomadEither is a bifunctor: mapLeft", async t => {
    const initial = TNE.left("hold dis, left");
    const expected = NE.left(14);

    {
        const actual = TNE.mapLeft((a: string) => a.length)(initial);
        t.deepEqual(await actual(), expected);
    }
    {
        const actual = TNE.taskNomadEither.mapLeft(initial, (a: string) => a.length);
        t.deepEqual(await actual(), expected);
    }
});

test("TaskNomadEither is a functor: mapLeft ignores 'right' Either", async t => {
    const initial = TNE.right("hold dis, right");
    const expected = NE.right("hold dis, right");

    {
        const actual = TNE.mapLeft((a: string) => a.length)(initial);
        t.deepEqual(await actual(), expected);
    }
    {
        const actual = TNE.taskNomadEither.mapLeft(initial, (a: string) => a.length);
        t.deepEqual(await actual(), expected);
    }
});

test("TaskNomadEither is applicative: of", async t => {
    const actual = TNE.taskNomadEither.of("hold dis, right");

    const expected = NE.right("hold dis, right");
    t.deepEqual(await actual(), expected);
});

test("TaskNomadEither is applicative: ap", async t => {
    const fab = pipe(
        TNE.right((n: number) => n * 2),
        TNE.effect("that effect"),
    );
    const initial = pipe(
        TNE.right(1),
        TNE.effect("this effect"),
    );

    const expected = pipe(
        NE.right(2),
        NE.effect("this effect"),
        NE.effect("that effect"),
    );

    t.deepEqual(expected, await TNE.ap(initial)(fab)());
    t.deepEqual(expected, await TNE.taskNomadEither.ap(fab, initial)());
});

test("apFirst - bundles the effects from both", async t => {
    const first = pipe(
        TNE.right(1),
        TNE.effect("that effect"),
    );
    const second = pipe(
        TNE.right(2),
        TNE.effect("this effect"),
    );

    const actual = TNE.apFirst(second)(first);

    const expected = pipe(
        NE.right(1),
        NE.effect("this effect"),
        NE.effect("that effect"),
    );

    t.deepEqual(await actual(), expected);
});

test("apSecond - bundles the effects from both", async t => {
    const first = pipe(
        TNE.right(1),
        TNE.effect("that effect"),
    );
    const second = pipe(
        TNE.right(2),
        TNE.effect("this effect"),
    );

    const actual = TNE.apSecond(second)(first);

    const expected = pipe(
        NE.right(2),
        NE.effect("this effect"),
        NE.effect("that effect"),
    );

    t.deepEqual(await actual(), expected);
});

test("TaskNomadEither is a monad: chain", async t => {
    const initial = pipe(
        TNE.right("world"),
        TNE.effect(1),
    );

    const expected = {
        effects: [1, 2],
        value: E.right("hello, world!"),
    };

    {
        const actual = TNE.chain(a => pipe(
            TNE.right(`hello, ${a}!`),
            TNE.effect(2),
        ))(initial);
        t.deepEqual(await actual(), expected);
    }
    {
        const actual = TNE.taskNomadEither.chain(initial, a => pipe(
            TNE.right(`hello, ${a}!`),
            TNE.effect(2),
        ));
        t.deepEqual(await actual(), expected);
    }
    {
        const actual = pipe(
            initial,
            TNE.map(a => `hello, ${a}!`),
            TNE.effect(2),
        );
        t.deepEqual(await actual(), expected);
    }
});

test("TaskNomadEither is a monad: chain ignores 'left' Either", async t => {
    const initial = pipe(
        TNE.left("left, mon"),
        TNE.effect(1),
    );

    const expected = {
        effects: [1],
        value: E.left("left, mon"),
    };

    {
        const actual = TNE.chain(a => pipe(
            TNE.right<number, string, string>(`hello, ${a}!`),
            TNE.effect(2),
        ))(initial);
        t.deepEqual(await actual(), expected);
    }
    {
        const actual = TNE.taskNomadEither.chain(initial, a => pipe(
            TNE.right(`hello, ${a}!`),
            TNE.effect(2),
        ));
        t.deepEqual(await actual(), expected);
    }
});

test("chainFirst - bundles the effects from both", async t => {
    const initial = pipe(
        TNE.right("world"),
        TNE.effect(1),
    );

    const expected = {
        effects: [1, 2],
        value: E.right("world"),
    };

    const actual = TNE.chainFirst(a => pipe(
        TNE.right(`hello, ${a}!`),
        TNE.effect(2),
    ))(initial);
    t.deepEqual(await actual(), expected);
});

test("getMonoid - returns first non-'left' value. combines if both are 'right' values", async t => {
    const M = TNE.getMonoid(monoidSum);

    {
        const initial1 = TNE.right(952);
        const initial2 = TNE.right(17);
        const actual = M.concat(initial1, initial2);

        const expected = NE.right(969);
        t.deepEqual(await actual(), expected);
    }
    {
        const initial1 = TNE.right(952);
        const initial2 = TNE.left(17);
        const actual = M.concat(initial1, initial2);

        const expected = NE.right(952);
        t.deepEqual(await actual(), expected);
    }
    {
        const initial1 = TNE.left(952);
        const initial2 = TNE.right(17);
        const actual = M.concat(initial1, initial2);

        const expected = NE.right(17);
        t.deepEqual(await actual(), expected);
    }
    {
        const initial1 = TNE.left(952);
        const initial2 = TNE.left(17);
        const actual = M.concat(initial1, initial2);

        const expected = NE.left(952);
        t.deepEqual(await actual(), expected);
    }
});

test("getMonoid - result is order dependent", async t => {
    const initial1 = pipe(
        TNE.right(952),
        TNE.effect("one"),
    );
    const initial2 = pipe(
        TNE.left(17),
        TNE.effect("two"),
    );

    const M = TNE.getMonoid(monoidSum);

    {
        const actual = M.concat(initial1, initial2);

        const expected = {
            effects: ["one", "two"],
            value: E.right(952),
        };

        t.deepEqual(await actual(), expected);
    }
    {
        const actual = M.concat(initial2, initial1);

        const expected = {
            effects: ["two", "one"],
            value: E.right(952),
        };

        t.deepEqual(await actual(), expected);
    }
});

test("getApplyMonoid - returns first 'left' value. combines if both are 'right' values", async t => {
    const M = TNE.getApplyMonoid(monoidSum);

    {
        const initial1 = TNE.right(952);
        const initial2 = TNE.right(17);
        const actual = M.concat(initial1, initial2);

        const expected = NE.right(969);
        t.deepEqual(await actual(), expected);
    }
    {
        const initial1 = TNE.right(952);
        const initial2 = TNE.left(17);
        const actual = M.concat(initial1, initial2);

        const expected = NE.left(17);
        t.deepEqual(await actual(), expected);
    }
    {
        const initial1 = TNE.left(952);
        const initial2 = TNE.right(17);
        const actual = M.concat(initial1, initial2);

        const expected = NE.left(952);
        t.deepEqual(await actual(), expected);
    }
    {
        const initial1 = TNE.left(952);
        const initial2 = TNE.left(17);
        const actual = M.concat(initial1, initial2);

        const expected = NE.left(952);
        t.deepEqual(await actual(), expected);
    }
});

test("getApplyMonoid - result is order dependent", async t => {
    const initial1 = pipe(
        TNE.left(952),
        TNE.effect("one"),
    );
    const initial2 = pipe(
        TNE.right(17),
        TNE.effect("two"),
    );

    const M = TNE.getApplyMonoid(monoidSum);

    {
        const actual = M.concat(initial1, initial2);

        const expected = {
            effects: ["one", "two"],
            value: E.left(952),
        };

        t.deepEqual(await actual(), expected);
    }
    {
        const actual = M.concat(initial2, initial1);

        const expected = {
            effects: ["two", "one"],
            value: E.left(952),
        };

        t.deepEqual(await actual(), expected);
    }
});

test("NomadValidation.ap - acts like Apply, but will combine if there are two lefts", async t => {
    const V = TNE.getNomadValidation(semigroupSum);

    {
        const initial1 = pipe(
            TNE.right((a: string) => `hello, ${a}!`),
            TNE.effect("two")
        );
        const initial2 = pipe(
            TNE.right("world"),
            TNE.effect("one")
        );
        const actual = V.ap(initial1, initial2);

        const expected = pipe(
            NE.right("hello, world!"),
            NE.effects(["one", "two"])
        );
        t.deepEqual(await actual(), expected);
    }
    {
        const initial1 = pipe(
            TNE.right((a: string) => `hello, ${a}!`),
            TNE.effect("two")
        );
        const initial2 = pipe(
            TNE.left(17),
            TNE.effect("one")
        );
        const actual = V.ap(initial1, initial2);

        const expected = pipe(
            NE.left(17),
            NE.effects(["one", "two"])
        );
        t.deepEqual(await actual(), expected);
    }
    {
        const initial1 = pipe(
            TNE.left(952),
            TNE.effect("two")
        );
        const initial2 = pipe(
            TNE.right("world"),
            TNE.effect("one")
        );
        const actual = V.ap(initial1, initial2);

        const expected = pipe(
            NE.left(952),
            NE.effects(["one", "two"])
        );
        t.deepEqual(await actual(), expected);
    }
    {
        const initial1 = pipe(
            TNE.left(952),
            TNE.effect("two")
        );
        const initial2 = pipe(
            TNE.left(17),
            TNE.effect("one")
        );
        const actual = V.ap(initial1, initial2);

        const expected = pipe(
            NE.left(969),
            NE.effects(["one", "two"])
        );
        t.deepEqual(await actual(), expected);
    }
});

test("NomadValidation.alt - acts like Alt, but will combine if there are two lefts", async t => {
    const V = TNE.getNomadValidation(semigroupSum);

    {
        const initial1 = pipe(
            TNE.right("one"),
            TNE.effect("one"),
        );
        const initial2 = pipe(
            TNE.right("two"),
            TNE.effect("two")
        );
        const actual1 = V.alt(initial1, () => initial2);
        const actual2 = TNE.taskNomadEither.alt(initial1, () => initial2);

        const expected = pipe(
            NE.right("one"),
            NE.effect("one"),
        );
        t.deepEqual(await actual1(), expected);
        t.deepEqual(await actual2(), expected);
    }
    {
        const initial1 = pipe(
            TNE.right("one"),
            TNE.effect("one"),
        );
        const initial2 = pipe(
            TNE.left(17),
            TNE.effect("two"),
        );
        const actual1 = V.alt(initial1, () => initial2);
        const actual2 = TNE.taskNomadEither.alt(initial1, () => initial2);

        const expected = pipe(
            NE.right("one"),
            NE.effect("one"),
        );
        t.deepEqual(await actual1(), expected);
        t.deepEqual(await actual2(), expected);
    }
    {
        const initial1 = pipe(
            TNE.left(952),
            TNE.effect("one"),
        );
        const initial2 = pipe(
            TNE.right("two"),
            TNE.effect("two"),
        );
        const actual1 = V.alt(initial1, () => initial2);
        const actual2 = TNE.taskNomadEither.alt(initial1, () => initial2);

        const expected = pipe(
            NE.right("two"),
            NE.effect("one"),
            NE.effect("two"),
        );
        t.deepEqual(await actual1(), expected);
        t.deepEqual(await actual2(), expected);
    }
    {
        const initial1 = pipe(
            TNE.left(952),
            TNE.effect("one"),
        );
        const initial2 = pipe(
            TNE.left(17),
            TNE.effect("two")
        );
        const actual = V.alt(initial1, () => initial2);

        const expected = pipe(
            NE.left(969),
            NE.effect("one"),
            NE.effect("two"),
        );
        t.deepEqual(await actual(), expected);
    }
});

// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------

test("do notation - bind returns a Nomad with an option with one key/value pair", async t => {
    const actual = pipe(
        TNE.Do,
        TNE.bind("key", ({}) => TNE.right("value")),
    );

    const expected = {
        effects: [],
        value: E.right({
            key: "value",
        }),
    };

    t.deepEqual(await actual(), expected);
});

test("do notation - bindTo returns a Nomad with an option with one key/value pair", async t => {
    const actual = pipe(
        TNE.right("value"),
        TNE.bindTo("key"),
    );

    const expected = {
        effects: [],
        value: E.right({
            key: "value",
        })
    };

    t.deepEqual(await actual(), expected);
});
