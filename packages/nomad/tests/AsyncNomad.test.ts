import test from "ava";

import {pipe} from "fp-ts/function";
import {monoidSum} from "fp-ts/Monoid";
import {semigroupSum} from "fp-ts/Semigroup";
import * as E from "fp-ts/Either";
import * as IO from "fp-ts/IO";
import * as IOE from "fp-ts/IOEither";
import * as N from "../src/Nomad";
import * as NE from "../src/NomadEither";
import * as AN from "../src/AsyncNomad";

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

test("constructors - left", async t => {
    const actual = AN.left("hold dis, left");

    const expected = {
        effects: [],
        value: E.left("hold dis, left"),
    }

    t.deepEqual(await actual(), expected);
});

test("constructors - right", async t => {
    const actual = AN.right("hold dis, right");

    const expected = {
        effects: [],
        value: E.right("hold dis, right"),
    }

    t.deepEqual(await actual(), expected);
});

test("constructors - leftIO", async t => {
    const actual = pipe(
        IO.of("hold dis, left"),
        AN.leftIO
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
        AN.rightIO
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
        AN.leftNomad
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
        AN.rightNomad
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
        AN.fromEither,
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
        AN.fromEither,
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
        AN.fromIOEither,
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
        AN.fromIOEither,
    );

    const expected = {
        effects: [],
        value: E.left("hold dis, left"),
    }

    t.deepEqual(await actual(), expected);
});

test("constructors - effect", async t => {
    const actual = pipe(
        AN.right("hold dis, right"),
        AN.effect(1),
        AN.effect(2),
        AN.effect(3),
        AN.effect(4),
    );

    const expected = {
        effects: [1, 2, 3, 4],
        value: E.right("hold dis, right"),
    }

    t.deepEqual(await actual(), expected);
});

test("constructors - effectRight", async t => {
    const actual = pipe(
        AN.right("hold dis, right"),
        AN.effectRight((value) => value.length),
        AN.effectRight((value) => value.length + 1),
        AN.effectLeft((_) => 0),
    );

    const expected = {
        effects: [15, 16],
        value: E.right("hold dis, right"),
    }

    t.deepEqual(await actual(), expected);
});

test("constructors - effectLeft", async t => {
    const actual = pipe(
        AN.left("hold dis, left"),
        AN.effectLeft((value) => value.length),
        AN.effectLeft((value) => value.length + 1),
        AN.effectRight((_) => 0),
    );

    const expected = {
        effects: [14, 15],
        value: E.left("hold dis, left"),
    }

    t.deepEqual(await actual(), expected);
});

test("constructors - effectL", async t => {
    const actual = pipe(
        AN.right("hold dis, right"),
        AN.effectL(() => 1),
        AN.effectL(() => 2),
    );

    const expected = {
        effects: [1, 2],
        value: E.right("hold dis, right"),
    }

    t.deepEqual(await actual(), expected);
});

test("constructors - effects", async t => {
    const actual = pipe(
        AN.right("hold dis, right"),
        AN.effects([1, 2]),
        AN.effects([3, 4]),
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
    const fold = AN.fold(
        (l: string) => pipe(
            N.pure(l.length),
            N.effect("was left"),
        ),
        (r: string) => pipe(
            N.pure(r.length),
            N.effect("was right"),
        ),
    );

    {
        const initial = pipe(
            AN.right("hold dis, right"),
            AN.effect("is right"),
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
            AN.left("hold dis, left"),
            AN.effect("is left"),
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
        N.pure("else this, right"),
        N.effect(123),
    );
    const getOrElse = AN.getOrElse(
        (l: string) => elseNomad,
    );

    {
        const initial = pipe(
            AN.right("hold dis, right"),
            AN.effect(456),
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
            AN.left("hold dis, left"),
            AN.effect(789),
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
    const orElse = AN.orElse((l: string) => pipe(
        AN.right("recovered from left"),
        AN.effect(`left had ${l.length} characters`)
    ));

    {
        const initial = pipe(
            AN.left("hold dis, left"),
            AN.effect("started as left"),
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
            AN.right("hold dis, right"),
            AN.effect("started as right"),
        );

        const actual = orElse(initial);

        t.deepEqual(await actual(), await initial());
    }
})

test("swap", async t => {
    const initial = pipe(
        AN.right("this started as right"),
        AN.effect("was right"),
    );
    const expected = pipe(
        NE.left("this started as right"),
        NE.effect("was right"),
    );

    const actual1 = AN.swap(initial);
    t.deepEqual(await actual1(), expected);

    // swap(swap(initial)) == initial
    const actual2 = AN.swap(actual1);
    t.deepEqual(await actual2(), await initial());
})

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

test("AsyncNomad is a functor: URI", async t => {
    {
        t.deepEqual("Nomad", N.nomad.URI);
    }
});

test("AsyncNomad is a functor: map", async t => {
    const initial = AN.right("hold dis, right");
    const expected = NE.right(15);

    {
        const actual = AN.map((a: string) => a.length)(initial);
        t.deepEqual(await actual(), expected);
    }
    {
        const actual = AN.asyncNomad.map(initial, (a: string) => a.length);
        t.deepEqual(await actual(), expected);
    }
});

test("AsyncNomad is a functor: map ignores 'left' Either", async t => {
    const initial = AN.left("hold dis, left");
    const expected = NE.left("hold dis, left");

    {
        const actual = AN.map((a: string) => a.length)(initial);
        t.deepEqual(await actual(), expected);
    }
    {
        const actual = AN.asyncNomad.map(initial, (a: string) => a.length);
        t.deepEqual(await actual(), expected);
    }
});

test("AsyncNomad is a bifunctor: bimap - left", async t => {
    const initial = AN.left("hold dis, left");
    const expected = NE.left(14);

    {
        const actual = AN.bimap(
            (s: string) => s.length,
            (n: number) => n + 1,
        )(initial);
        t.deepEqual(await actual(), expected);
    }
    {
        const actual = AN.asyncNomad.bimap(
            initial,
            (s: string) => s.length,
            (n: number) => n + 1,
        );
        t.deepEqual(await actual(), expected);
    }
});

test("AsyncNomad is a bifunctor: bimap - right", async t => {
    const initial = AN.right("hold dis, right");
    const expected = NE.right(15);

    {
        const actual = AN.bimap(
            (n: number) => n + 1,
            (s: string) => s.length,
        )(initial);
        t.deepEqual(await actual(), expected);
    }
    {
        const actual = AN.asyncNomad.bimap(
            initial,
            (n: number) => n + 1,
            (s: string) => s.length,
        );
        t.deepEqual(await actual(), expected);
    }
});

test("AsyncNomad is a bifunctor: mapLeft", async t => {
    const initial = AN.left("hold dis, left");
    const expected = NE.left(14);

    {
        const actual = AN.mapLeft((a: string) => a.length)(initial);
        t.deepEqual(await actual(), expected);
    }
    {
        const actual = AN.asyncNomad.mapLeft(initial, (a: string) => a.length);
        t.deepEqual(await actual(), expected);
    }
});

test("AsyncNomad is a functor: mapLeft ignores 'right' Either", async t => {
    const initial = AN.right("hold dis, right");
    const expected = NE.right("hold dis, right");

    {
        const actual = AN.mapLeft((a: string) => a.length)(initial);
        t.deepEqual(await actual(), expected);
    }
    {
        const actual = AN.asyncNomad.mapLeft(initial, (a: string) => a.length);
        t.deepEqual(await actual(), expected);
    }
});

test("AsyncNomad is applicative: of", async t => {
    const actual = AN.asyncNomad.of("hold dis, right");

    const expected = NE.right("hold dis, right");
    t.deepEqual(await actual(), expected);
});

test("AsyncNomad is applicative: ap", async t => {
    const fab = pipe(
        AN.right((n: number) => n * 2),
        AN.effect("that effect"),
    );
    const initial = pipe(
        AN.right(1),
        AN.effect("this effect"),
    );

    const expected = pipe(
        NE.right(2),
        NE.effect("this effect"),
        NE.effect("that effect"),
    );

    t.deepEqual(expected, await AN.ap(initial)(fab)());
    t.deepEqual(expected, await AN.asyncNomad.ap(fab, initial)());
});

test("apFirst - bundles the effects from both", async t => {
    const first = pipe(
        AN.right(1),
        AN.effect("that effect"),
    );
    const second = pipe(
        AN.right(2),
        AN.effect("this effect"),
    );

    const actual = AN.apFirst(second)(first);

    const expected = pipe(
        NE.right(1),
        NE.effect("this effect"),
        NE.effect("that effect"),
    );

    t.deepEqual(await actual(), expected);
});

test("apSecond - bundles the effects from both", async t => {
    const first = pipe(
        AN.right(1),
        AN.effect("that effect"),
    );
    const second = pipe(
        AN.right(2),
        AN.effect("this effect"),
    );

    const actual = AN.apSecond(second)(first);

    const expected = pipe(
        NE.right(2),
        NE.effect("this effect"),
        NE.effect("that effect"),
    );

    t.deepEqual(await actual(), expected);
});

test("AsyncNomad is a monad: chain", async t => {
    const initial = pipe(
        AN.right("world"),
        AN.effect(1),
    );

    const expected = {
        effects: [1, 2],
        value: E.right("hello, world!"),
    };

    {
        const actual = AN.chain(a => pipe(
            AN.right(`hello, ${a}!`),
            AN.effect(2),
        ))(initial);
        t.deepEqual(await actual(), expected);
    }
    {
        const actual = AN.asyncNomad.chain(initial, a => pipe(
            AN.right(`hello, ${a}!`),
            AN.effect(2),
        ));
        t.deepEqual(await actual(), expected);
    }
    {
        const actual = pipe(
            initial,
            AN.map(a => `hello, ${a}!`),
            AN.effect(2),
        );
        t.deepEqual(await actual(), expected);
    }
});

test("AsyncNomad is a monad: chain ignores 'left' Either", async t => {
    const initial = pipe(
        AN.left("left, mon"),
        AN.effect(1),
    );

    const expected = {
        effects: [1],
        value: E.left("left, mon"),
    };

    {
        const actual = AN.chain(a => pipe(
            AN.right<number, string, string>(`hello, ${a}!`),
            AN.effect(2),
        ))(initial);
        t.deepEqual(await actual(), expected);
    }
    {
        const actual = AN.asyncNomad.chain(initial, a => pipe(
            AN.right(`hello, ${a}!`),
            AN.effect(2),
        ));
        t.deepEqual(await actual(), expected);
    }
});

test("chainFirst - bundles the effects from both", async t => {
    const initial = pipe(
        AN.right("world"),
        AN.effect(1),
    );

    const expected = {
        effects: [1, 2],
        value: E.right("world"),
    };

    const actual = AN.chainFirst(a => pipe(
        AN.right(`hello, ${a}!`),
        AN.effect(2),
    ))(initial);
    t.deepEqual(await actual(), expected);
});

test("getMonoid - returns first non-'left' value. combines if both are 'right' values", async t => {
    const M = AN.getMonoid(monoidSum);

    {
        const initial1 = AN.right(952);
        const initial2 = AN.right(17);
        const actual = M.concat(initial1, initial2);

        const expected = NE.right(969);
        t.deepEqual(await actual(), expected);
    }
    {
        const initial1 = AN.right(952);
        const initial2 = AN.left(17);
        const actual = M.concat(initial1, initial2);

        const expected = NE.right(952);
        t.deepEqual(await actual(), expected);
    }
    {
        const initial1 = AN.left(952);
        const initial2 = AN.right(17);
        const actual = M.concat(initial1, initial2);

        const expected = NE.right(17);
        t.deepEqual(await actual(), expected);
    }
    {
        const initial1 = AN.left(952);
        const initial2 = AN.left(17);
        const actual = M.concat(initial1, initial2);

        const expected = NE.left(952);
        t.deepEqual(await actual(), expected);
    }
});

test("getMonoid - result is order dependent", async t => {
    const initial1 = pipe(
        AN.right(952),
        AN.effect("one"),
    );
    const initial2 = pipe(
        AN.left(17),
        AN.effect("two"),
    );

    const M = AN.getMonoid(monoidSum);

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
    const M = AN.getApplyMonoid(monoidSum);

    {
        const initial1 = AN.right(952);
        const initial2 = AN.right(17);
        const actual = M.concat(initial1, initial2);

        const expected = NE.right(969);
        t.deepEqual(await actual(), expected);
    }
    {
        const initial1 = AN.right(952);
        const initial2 = AN.left(17);
        const actual = M.concat(initial1, initial2);

        const expected = NE.left(17);
        t.deepEqual(await actual(), expected);
    }
    {
        const initial1 = AN.left(952);
        const initial2 = AN.right(17);
        const actual = M.concat(initial1, initial2);

        const expected = NE.left(952);
        t.deepEqual(await actual(), expected);
    }
    {
        const initial1 = AN.left(952);
        const initial2 = AN.left(17);
        const actual = M.concat(initial1, initial2);

        const expected = NE.left(952);
        t.deepEqual(await actual(), expected);
    }
});

test("getApplyMonoid - result is order dependent", async t => {
    const initial1 = pipe(
        AN.left(952),
        AN.effect("one"),
    );
    const initial2 = pipe(
        AN.right(17),
        AN.effect("two"),
    );

    const M = AN.getApplyMonoid(monoidSum);

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
    const V = AN.getNomadValidation(semigroupSum);

    {
        const initial1 = pipe(
            AN.right((a: string) => `hello, ${a}!`),
            AN.effect("two")
        );
        const initial2 = pipe(
            AN.right("world"),
            AN.effect("one")
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
            AN.right((a: string) => `hello, ${a}!`),
            AN.effect("two")
        );
        const initial2 = pipe(
            AN.left(17),
            AN.effect("one")
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
            AN.left(952),
            AN.effect("two")
        );
        const initial2 = pipe(
            AN.right("world"),
            AN.effect("one")
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
            AN.left(952),
            AN.effect("two")
        );
        const initial2 = pipe(
            AN.left(17),
            AN.effect("one")
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
    const V = AN.getNomadValidation(semigroupSum);

    {
        const initial1 = pipe(
            AN.right("one"),
            AN.effect("one"),
        );
        const initial2 = pipe(
            AN.right("two"),
            AN.effect("two")
        );
        const actual1 = V.alt(initial1, () => initial2);
        const actual2 = AN.asyncNomad.alt(initial1, () => initial2);

        const expected = pipe(
            NE.right("one"),
            NE.effect("one"),
        );
        t.deepEqual(await actual1(), expected);
        t.deepEqual(await actual2(), expected);
    }
    {
        const initial1 = pipe(
            AN.right("one"),
            AN.effect("one"),
        );
        const initial2 = pipe(
            AN.left(17),
            AN.effect("two"),
        );
        const actual1 = V.alt(initial1, () => initial2);
        const actual2 = AN.asyncNomad.alt(initial1, () => initial2);

        const expected = pipe(
            NE.right("one"),
            NE.effect("one"),
        );
        t.deepEqual(await actual1(), expected);
        t.deepEqual(await actual2(), expected);
    }
    {
        const initial1 = pipe(
            AN.left(952),
            AN.effect("one"),
        );
        const initial2 = pipe(
            AN.right("two"),
            AN.effect("two"),
        );
        const actual1 = V.alt(initial1, () => initial2);
        const actual2 = AN.asyncNomad.alt(initial1, () => initial2);

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
            AN.left(952),
            AN.effect("one"),
        );
        const initial2 = pipe(
            AN.left(17),
            AN.effect("two")
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
        AN.Do,
        AN.bind("key", ({}) => AN.right("value")),
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
        AN.right("value"),
        AN.bindTo("key"),
    );

    const expected = {
        effects: [],
        value: E.right({
            key: "value",
        })
    };

    t.deepEqual(await actual(), expected);
});
