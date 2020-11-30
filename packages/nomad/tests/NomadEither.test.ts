import test from "ava";

import {pipe} from "fp-ts/function";
import {eqNumber, eqString} from "fp-ts/Eq";
import {monoidSum} from "fp-ts/Monoid";
import * as E from "fp-ts/Either";
import * as N from "../src/Nomad";
import * as NE from "../src/NomadEither";
import {semigroupSum} from "fp-ts/Semigroup";

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

test("constructors - left", t => {
    const actual = NE.left("hold dis, left");

    const expected = {
        effects: [],
        value: E.left("hold dis, left"),
    }

    t.deepEqual(actual, expected);
});

test("constructors - right", t => {
    const actual = NE.right("hold dis, right");

    const expected = {
        effects: [],
        value: E.right("hold dis, right"),
    }

    t.deepEqual(actual, expected);
});

test("constructors - leftNomad", t => {
    const actual = pipe(
        N.pure("hold dis, left"),
        NE.leftNomad
    );

    const expected = {
        effects: [],
        value: E.left("hold dis, left"),
    }

    t.deepEqual(actual, expected);
});

test("constructors - rightNomad", t => {
    const actual = pipe(
        N.pure("hold dis, right"),
        NE.rightNomad
    );

    const expected = {
        effects: [],
        value: E.right("hold dis, right"),
    }

    t.deepEqual(actual, expected);
});

test("constructors - fromEither - right", t => {
    const actual = pipe(
        E.right("hold dis, right"),
        NE.fromEither,
    );

    const expected = {
        effects: [],
        value: E.right("hold dis, right"),
    }

    t.deepEqual(actual, expected);
});

test("constructors - fromEither - left", t => {
    const actual = pipe(
        E.left("hold dis, left"),
        NE.fromEither,
    );

    const expected = {
        effects: [],
        value: E.left("hold dis, left"),
    }

    t.deepEqual(actual, expected);
});

test("constructors - effect", t => {
    const actual = pipe(
        NE.right("hold dis, right"),
        NE.effect(1),
        NE.effect(2),
        NE.effect(3),
        NE.effect(4),
    );

    const expected = {
        effects: [1, 2, 3, 4],
        value: E.right("hold dis, right"),
    }

    t.deepEqual(actual, expected);
});

test("constructors - effectRight", t => {
    const actual = pipe(
        NE.right("hold dis, right"),
        NE.effectRight((value) => value.length),
        NE.effectRight((value) => value.length + 1),
        NE.effectLeft((_) => 0),
    );

    const expected = {
        effects: [15, 16],
        value: E.right("hold dis, right"),
    }

    t.deepEqual(actual, expected);
});

test("constructors - effectLeft", t => {
    const actual = pipe(
        NE.left("hold dis, left"),
        NE.effectLeft((value) => value.length),
        NE.effectLeft((value) => value.length + 1),
        NE.effectRight((_) => 0),
    );

    const expected = {
        effects: [14, 15],
        value: E.left("hold dis, left"),
    }

    t.deepEqual(actual, expected);
});

test("constructors - effectL", t => {
    const actual = pipe(
        NE.right("hold dis, right"),
        NE.effectL(() => 1),
        NE.effectL(() => 2),
    );

    const expected = {
        effects: [1, 2],
        value: E.right("hold dis, right"),
    }

    t.deepEqual(actual, expected);
});

test("constructors - effects", t => {
    const actual = pipe(
        NE.right("hold dis, right"),
        NE.effects([1, 2]),
        NE.effects([3, 4]),
    );

    const expected = {
        effects: [1, 2, 3, 4],
        value: E.right("hold dis, right"),
    }

    t.deepEqual(actual, expected);
});

// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------

test("fold", t => {
    const fold = NE.fold(
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
            NE.right("hold dis, right"),
            NE.effect("is right"),
        );
        const actual = fold(initial);
        const expected = {
            effects: ["is right", "was right"],
            value: 15,
        }

        t.deepEqual(actual, expected);
    }
    {
        const initial = pipe(
            NE.left("hold dis, left"),
            NE.effect("is left"),
        );
        const actual = fold(initial);
        const expected = {
            effects: ["is left", "was left"],
            value: 14,
        }

        t.deepEqual(actual, expected);
    }
});

test("getOrElse", t => {
    const elseNomad = pipe(
        N.pure("else this, right"),
        N.effect(123),
    );
    const getOrElse = NE.getOrElse(
        (l: string) => elseNomad,
    );

    {
        const initial = pipe(
            NE.right("hold dis, right"),
            NE.effect(456),
        );
        const actual = getOrElse(initial);
        const expected = {
            effects: [456],
            value: "hold dis, right",
        }

        t.deepEqual(actual, expected);
    }
    {
        const initial = pipe(
            NE.left("hold dis, left"),
            NE.effect(789),
        );
        const actual = getOrElse(initial);
        const expected = {
            effects: [789, 123],
            value: "else this, right",
        }

        t.deepEqual(actual, expected);
    }
});

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

test("orElse", t => {
    const orElse = NE.orElse((l: string) => pipe(
        NE.right("recovered from left"),
        NE.effect(`left had ${l.length} characters`)
    ));

    {
        const initial = pipe(
            NE.left("hold dis, left"),
            NE.effect("started as left"),
        );

        const actual = orElse(initial);

        const expected = pipe(
            NE.right("recovered from left"),
            NE.effect("started as left"),
            NE.effect(`left had 14 characters`),
        );

        t.deepEqual(actual, expected);
    }
    {
        const initial = pipe(
            NE.right("hold dis, right"),
            NE.effect("started as right"),
        );

        const actual = orElse(initial);

        t.deepEqual(actual, initial);
    }
})

test("swap", t => {
    const initial = pipe(
        NE.right("this started as right"),
        NE.effect("was right"),
    );
    const expected = pipe(
        NE.left("this started as right"),
        NE.effect("was right"),
    );

    const actual1 = NE.swap(initial);
    t.deepEqual(actual1, expected);

    // swap(swap(initial)) == initial
    const actual2 = NE.swap(actual1);
    t.deepEqual(actual2, initial);
})

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

test("NomadEither is a functor: URI", t => {
    {
        t.deepEqual("Nomad", N.nomad.URI);
    }
});

test("NomadEither is a functor: map", t => {
    const initial = NE.right("hold dis, right");
    const expected = NE.right(15);

    {
        const actual = NE.map((a: string) => a.length)(initial);
        t.deepEqual(actual, expected);
    }
    {
        const actual = NE.nomadEither.map(initial, (a: string) => a.length);
        t.deepEqual(actual, expected);
    }
});

test("NomadEither is a functor: map ignores 'left' Either", t => {
    const initial = NE.left("hold dis, left");
    const expected = NE.left("hold dis, left");

    {
        const actual = NE.map((a: string) => a.length)(initial);
        t.deepEqual(expected, actual);
    }
    {
        const actual = NE.nomadEither.map(initial, (a: string) => a.length);
        t.deepEqual(expected, actual);
    }
});

test("NomadEither is a bifunctor: mapLeft", t => {
    const initial = NE.left("hold dis, left");
    const expected = NE.left(14);

    {
        const actual = NE.mapLeft((a: string) => a.length)(initial);
        t.deepEqual(expected, actual);
    }
    {
        const actual = NE.nomadEither.mapLeft(initial, (a: string) => a.length);
        t.deepEqual(expected, actual);
    }
});

test("NomadEither is a functor: mapLeft ignores 'right' Either", t => {
    const initial = NE.right("hold dis, right");
    const expected = NE.right("hold dis, right");

    {
        const actual = NE.mapLeft((a: string) => a.length)(initial);
        t.deepEqual(expected, actual);
    }
    {
        const actual = NE.nomadEither.mapLeft(initial, (a: string) => a.length);
        t.deepEqual(expected, actual);
    }
});

test("NomadEither is applicative: of", t => {
    const actual = NE.nomadEither.of("hold dis, right");

    const expected = NE.right("hold dis, right");
    t.deepEqual(expected, actual);
});

test("NomadEither is applicative: ap", t => {
    const fab = pipe(
        NE.right((n: number) => n * 2),
        NE.effect("that effect"),
    );
    const initial = pipe(
        NE.right(1),
        NE.effect("this effect"),
    );

    const expected = pipe(
        NE.right(2),
        NE.effect("this effect"),
        NE.effect("that effect"),
    );

    t.deepEqual(expected, NE.ap(initial)(fab));
    t.deepEqual(expected, NE.nomadEither.ap(fab, initial));
});

test("apFirst - bundles the effects from both", t => {
    const first = pipe(
        NE.right(1),
        NE.effect("that effect"),
    );
    const second = pipe(
        NE.right(2),
        NE.effect("this effect"),
    );

    const expected = pipe(
        NE.right(1),
        NE.effect("this effect"),
        NE.effect("that effect"),
    );

    t.deepEqual(expected, NE.apFirst(second)(first));
});

test("apSecond - bundles the effects from both", t => {
    const first = pipe(
        NE.right(1),
        NE.effect("that effect"),
    );
    const second = pipe(
        NE.right(2),
        NE.effect("this effect"),
    );

    const expected = pipe(
        NE.right(2),
        NE.effect("this effect"),
        NE.effect("that effect"),
    );

    t.deepEqual(expected, NE.apSecond(second)(first));
});

test("NomadEither is a monad: chain", t => {
    const initial = pipe(
        NE.right("world"),
        NE.effect(1),
    );

    const expected = {
        effects: [1, 2],
        value: E.right("hello, world!"),
    };

    {
        const actual = NE.chain(a => pipe(
            NE.right(`hello, ${a}!`),
            NE.effect(2),
        ))(initial);
        t.deepEqual(expected, actual);
    }
    {
        const actual = NE.nomadEither.chain(initial, a => pipe(
            NE.right(`hello, ${a}!`),
            NE.effect(2),
        ));
        t.deepEqual(expected, actual);
    }
    {
        const actual = pipe(
            initial,
            NE.map(a => `hello, ${a}!`),
            NE.effect(2),
        );
        t.deepEqual(expected, actual);
    }
});

test("chainFirst - bundles the effects from both", t => {
    const initial = pipe(
        NE.right("world"),
        NE.effect(1),
    );

    const expected = {
        effects: [1, 2],
        value: E.right("world"),
    };

    const actual = NE.chainFirst(a => pipe(
        NE.right(`hello, ${a}!`),
        NE.effect(2),
    ))(initial);
    t.deepEqual(expected, actual);
});

test("getEq - return true when values and effects are the same", t => {
    const thing = pipe(
        NE.right("hold dis, right"),
        NE.effect(1),
        NE.effect(2),
        NE.effect(3),
        NE.effect(4),
    );

    const eq = NE.getEq(eqNumber, eqNumber, eqString);
    t.truthy(eq.equals(thing, thing));
});

test("getEq - return true when values and effects are equal", t => {
    const actual = pipe(
        NE.right("hold dis, right"),
        NE.effect(1),
        NE.effect(2),
        NE.effect(3),
        NE.effect(4),
    );

    const expected = {
        effects: [1, 2, 3, 4],
        value: E.right("hold dis, right"),
    };

    t.deepEqual(actual, expected);

    const eq = NE.getEq(eqNumber, eqNumber, eqString);
    t.truthy(eq.equals(actual, expected));
});

test("getEq - return false when values and effects are not equal", t => {
    const actual = pipe(
        NE.right("hold dis, right"),
        NE.effect(1),
    );

    const expected = {
        effects: [1, 2, 3, 4],
        value: E.right("not dis"),
    }

    const eq = NE.getEq(eqNumber, eqNumber, eqString);
    t.falsy(eq.equals(actual, expected));
});

test("getMonoid - returns first non-'left' value. combines if both are 'right' values", t => {
    const M = NE.getMonoid(monoidSum);

    {
        const actual1 = NE.right(952);
        const actual2 = NE.right(17);
        const actual = M.concat(actual1, actual2);

        const expected = NE.right(969);
        t.deepEqual(actual, expected);
    }
    {
        const actual1 = NE.right(952);
        const actual2 = NE.left(17);
        const actual = M.concat(actual1, actual2);

        const expected = NE.right(952);
        t.deepEqual(actual, expected);
    }
    {
        const actual1 = NE.left(952);
        const actual2 = NE.right(17);
        const actual = M.concat(actual1, actual2);

        const expected = NE.right(17);
        t.deepEqual(actual, expected);
    }
    {
        const actual1 = NE.left(952);
        const actual2 = NE.left(17);
        const actual = M.concat(actual1, actual2);

        const expected = NE.left(952);
        t.deepEqual(actual, expected);
    }
});

test("getMonoid - result is order dependent", t => {
    const actual1 = pipe(
        NE.right(952),
        NE.effect("one"),
    );
    const actual2 = pipe(
        NE.left(17),
        NE.effect("two"),
    );

    const M = NE.getMonoid(monoidSum);

    {
        const actual = M.concat(actual1, actual2);

        const expected = {
            effects: ["one", "two"],
            value: E.right(952),
        };

        t.deepEqual(actual, expected);
    }
    {
        const actual = M.concat(actual2, actual1);

        const expected = {
            effects: ["two", "one"],
            value: E.right(952),
        };

        t.deepEqual(actual, expected);
    }
});

test("getApplyMonoid - returns first 'left' value. combines if both are 'right' values", t => {
    const M = NE.getApplyMonoid(monoidSum);

    {
        const actual1 = NE.right(952);
        const actual2 = NE.right(17);
        const actual = M.concat(actual1, actual2);

        const expected = NE.right(969);
        t.deepEqual(actual, expected);
    }
    {
        const actual1 = NE.right(952);
        const actual2 = NE.left(17);
        const actual = M.concat(actual1, actual2);

        const expected = NE.left(17);
        t.deepEqual(actual, expected);
    }
    {
        const actual1 = NE.left(952);
        const actual2 = NE.right(17);
        const actual = M.concat(actual1, actual2);

        const expected = NE.left(952);
        t.deepEqual(actual, expected);
    }
    {
        const actual1 = NE.left(952);
        const actual2 = NE.left(17);
        const actual = M.concat(actual1, actual2);

        const expected = NE.left(952);
        t.deepEqual(actual, expected);
    }
});

test("getApplyMonoid - result is order dependent", t => {
    const actual1 = pipe(
        NE.left(952),
        NE.effect("one"),
    );
    const actual2 = pipe(
        NE.right(17),
        NE.effect("two"),
    );

    const M = NE.getApplyMonoid(monoidSum);

    {
        const actual = M.concat(actual1, actual2);

        const expected = {
            effects: ["one", "two"],
            value: E.left(952),
        };

        t.deepEqual(actual, expected);
    }
    {
        const actual = M.concat(actual2, actual1);

        const expected = {
            effects: ["two", "one"],
            value: E.left(952),
        };

        t.deepEqual(actual, expected);
    }
});

test("NomadValidation.ap - acts like Apply, but will combine if there are two lefts", t => {
    const V = NE.getNomadValidation(semigroupSum);

    {
        const actual1 = pipe(
            NE.right((a: string) => `hello, ${a}!`),
            NE.effect("two")
        );
        const actual2 = pipe(
            NE.right("world"),
            NE.effect("one")
        );
        const actual = V.ap(actual1, actual2);

        const expected = pipe(
            NE.right("hello, world!"),
            NE.effects(["one", "two"])
        );
        t.deepEqual(actual, expected);
    }
    {
        const actual1 = pipe(
            NE.right((a: string) => `hello, ${a}!`),
            NE.effect("two")
        );
        const actual2 = pipe(
            NE.left(17),
            NE.effect("one")
        );
        const actual = V.ap(actual1, actual2);

        const expected = pipe(
            NE.left(17),
            NE.effects(["one", "two"])
        );
        t.deepEqual(actual, expected);
    }
    {
        const actual1 = pipe(
            NE.left(952),
            NE.effect("two")
        );
        const actual2 = pipe(
            NE.right("world"),
            NE.effect("one")
        );
        const actual = V.ap(actual1, actual2);

        const expected = pipe(
            NE.left(952),
            NE.effects(["one", "two"])
        );
        t.deepEqual(actual, expected);
    }
    {
        const actual1 = pipe(
            NE.left(952),
            NE.effect("two")
        );
        const actual2 = pipe(
            NE.left(17),
            NE.effect("one")
        );
        const actual = V.ap(actual1, actual2);

        const expected = pipe(
            NE.left(969),
            NE.effects(["one", "two"])
        );
        t.deepEqual(actual, expected);
    }
});

test("NomadValidation.alt - acts like Alt, but will combine if there are two lefts", t => {
    const V = NE.getNomadValidation(semigroupSum);

    {
        const initial1 = pipe(
            NE.right("one"),
            NE.effect("one"),
        );
        const initial2 = pipe(
            NE.right("two"),
            NE.effect("two")
        );
        const actual1 = V.alt(initial1, () => initial2);
        const actual2 = NE.nomadEither.alt(initial1, () => initial2);

        const expected = pipe(
            NE.right("one"),
            NE.effect("one"),
        );
        t.deepEqual(actual1, expected);
        t.deepEqual(actual2, expected);
    }
    {
        const initial1 = pipe(
            NE.right("one"),
            NE.effect("one"),
        );
        const initial2 = pipe(
            NE.left(17),
            NE.effect("two"),
        );
        const actual1 = V.alt(initial1, () => initial2);
        const actual2 = NE.nomadEither.alt(initial1, () => initial2);

        const expected = pipe(
            NE.right("one"),
            NE.effect("one"),
        );
        t.deepEqual(actual1, expected);
        t.deepEqual(actual2, expected);
    }
    {
        const initial1 = pipe(
            NE.left(952),
            NE.effect("one"),
        );
        const initial2 = pipe(
            NE.right("two"),
            NE.effect("two"),
        );
        const actual1 = V.alt(initial1, () => initial2);
        const actual2 = NE.nomadEither.alt(initial1, () => initial2);

        const expected = pipe(
            NE.right("two"),
            NE.effect("one"),
            NE.effect("two"),
        );
        t.deepEqual(actual1, expected);
        t.deepEqual(actual2, expected);
    }
    {
        const initial1 = pipe(
            NE.left(952),
            NE.effect("one"),
        );
        const initial2 = pipe(
            NE.left(17),
            NE.effect("two")
        );
        const actual = V.alt(initial1, () => initial2);

        const expected = pipe(
            NE.left(969),
            NE.effect("one"),
            NE.effect("two"),
        );
        t.deepEqual(actual, expected);
    }
});

test("do notation - bind returns a Nomad with an option with one key/value pair", t => {
    const actual = pipe(
        NE.Do,
        NE.bind("key", ({}) => NE.right("value")),
    );

    const expected = {
        effects: [],
        value: E.right({
            key: "value",
        }),
    };

    t.deepEqual(actual, expected);
});

test("do notation - bindTo returns a Nomad with an option with one key/value pair", t => {
    const actual = pipe(
        NE.right("value"),
        NE.bindTo("key"),
    );

    const expected = {
        effects: [],
        value: E.right({
            key: "value",
        })
    };

    t.deepEqual(actual, expected);
});
