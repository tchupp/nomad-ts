import test from "ava";

import {left2v as taskEitherFromLeft, taskEither} from "fp-ts/lib/TaskEither";

import {fromNomad, fromTaskEither, NomadTE, nomadTE} from "../src/NomadTE";
import {nomad, Nomad} from "../src";
import {pipe} from "fp-ts/lib/pipeable";

test("concat", async t => {
    const actual = fromNomad(new Nomad([1], "hold dis"))
        .concat(2)
        .concat([3, 4]);

    const expected = fromNomad(new Nomad([1, 2, 3, 4], "hold dis"));
    t.deepEqual(await actual.run(), await expected.run());
});

test("concatL", async t => {
    const actual = fromNomad(new Nomad([1], "hold dis"))
        .concatL(() => 2)
        .concatL(() => [3, 4]);

    const expected = fromNomad(new Nomad([1, 2, 3, 4], "hold dis"));
    t.deepEqual(await actual.run(), await expected.run());
});

test("concatRight", async t => {
    const expected = fromNomad(new Nomad([1, 8, 11, 12], "hold dis"));

    {
        const actual = fromNomad<number, string, string>(new Nomad([1], "hold dis"))
            .concatRight((r) => r.length)
            .concatLeft((l) => l.length)
            .concatRight((r) => [r.length + 3, r.length + 4]);
        t.deepEqual(await actual.run(), await expected.run());
    }
    {
        const actual = pipe(
            fromNomad<number, string, string>(new Nomad([1], "hold dis")),
            nomadTE.concatRight((r) => r.length),
            nomadTE.concatLeft((l) => l.length),
            nomadTE.concatRight((r) => [r.length + 3, r.length + 4]),
        );
        t.deepEqual(await actual.run(), await expected.run());
    }
});

test("concatLeft", async t => {
    const expected = nomadTE.left<number, string, string>("left hand wins").concat(14);

    {
        const actual = nomadTE.left<number, string, string>("left hand wins")
            .concatRight((r) => r.length)
            .concatLeft((l) => l.length)
            .concatRight((r) => [r.length + 3, r.length + 4]);
        t.deepEqual(await actual.run(), await expected.run());
    }
    {
        const actual = pipe(
            nomadTE.left<number, string, string>("left hand wins"),
            nomadTE.concatRight((r) => r.length),
            nomadTE.concatLeft((l) => l.length),
            nomadTE.concatRight((r) => [r.length + 3, r.length + 4]),
        );

        t.deepEqual(await actual.run(), await expected.run());
    }
});

test("NomadTE is a functor: URI", t => {
    t.deepEqual("NomadTE", nomadTE.URI);
});

test("NomadTE is a right functor: map", async t => {
    const initial = nomadTE.of<{}, string, string>("hold dis");
    const expected = nomadTE.of<{}, string, number>(8);

    {
        const actual = initial.map((a: string) => a.length);
        t.deepEqual(await expected.run(), await actual.run());
    }
    {
        const actual = nomadTE.map((a: string) => a.length)(initial);
        t.deepEqual(await expected.run(), await actual.run());
    }
});

test("map does not affect 'left' eithers", async t => {
    const initial = fromTaskEither(taskEitherFromLeft<string, string>("hold dis, left"));
    const expected = fromTaskEither(taskEitherFromLeft<string, number>("hold dis, left"));

    {
        const actual = initial.map((a: string) => a.length);
        t.deepEqual(await expected.run(), await actual.run());
    }
    {
        const actual = nomadTE.map((a: string) => a.length)(initial);
        t.deepEqual(await expected.run(), await actual.run());
    }
});

test("NomadTE is a left functor: mapLeft", async t => {
    const initial = fromTaskEither(taskEitherFromLeft<string, string>("hold dis, left"));
    const expected = fromTaskEither(taskEitherFromLeft<number, string>(14));

    {
        const actual = initial.mapLeft(a => a.length);
        t.deepEqual(await expected.run(), await actual.run());
    }
});

test("mapLeft does not affect 'right' eithers", async t => {
    const initial = nomadTE.of<{}, string, string>("hold dis, right?");
    const expected = nomadTE.of<{}, number, string>("hold dis, right?");

    {
        const actual = initial.mapLeft(a => a.length);
        t.deepEqual(await expected.run(), await actual.run());
    }
});

test("bimap", async t => {
    {
        const initial = nomadTE.of<{}, string, string>("hold dis, right?");
        const expected = nomadTE.of<{}, number, number>(16);

        const actual = initial.bimap(
            l => l.length,
            r => r.length
        );
        t.deepEqual(await expected.run(), await actual.run());
    }
    {
        const initial = nomadTE.left<{}, string, string>("hold dis, right?");
        const expected = nomadTE.left<{}, number, number>(16);

        const actual = initial.bimap(
            l => l.length,
            r => r.length
        );
        t.deepEqual(await expected.run(), await actual.run());
    }
});

test("NomadTE is applicative: of", async t => {
    const actual = nomadTE.of("hold dis");

    const expected = fromTaskEither(taskEither.of("hold dis"));
    t.deepEqual(await expected.run(), await actual.run());
});

test("fromTaskEither", async t => {
    const actual = fromTaskEither(taskEither.of("hold dis"));

    const expected = new NomadTE(taskEither.of("hold dis").value.map(a => nomad.of(a)));
    t.deepEqual(await expected.run(), await actual.run());
});

test("NomadTE is applicative: ap", async t => {
    const fab = nomadTE.of<string, string, (n: number) => number>(n => n * 2)
        .concat("that effect");

    const initial = nomadTE.of<string, string, number>(1)
        .concat("this effect");
    const expected = nomadTE.of(2)
        .concat("this effect")
        .concat("that effect");

    t.deepEqual(await expected.run(), await initial.ap<number>(fab).run());
    t.deepEqual(await expected.run(), await nomadTE.ap(fab)(initial).run());
});

test("NomadTE is a monad: chain", async t => {
    const initial = nomadTE.of<number, {}, string>("world")
        .concat([1]);
    const expected = nomadTE.of<number, {}, string>("hello, world!")
        .concat([1, 2]);

    const f = (a: string) => nomadTE.of<number, {}, string>(`hello, ${a}!`).concat(2);
    {
        const actual = initial.chain(f);
        t.deepEqual(await expected.run(), await actual.run());
    }
    {
        const actual = nomadTE.chain(f)(initial);
        t.deepEqual(await expected.run(), await actual.run());
    }
    {
        const actual = initial
            .map(a => `hello, ${a}!`)
            .concat(2);
        t.deepEqual(await expected.run(), await actual.run());
    }
});

test("chain does not affect 'left' eithers", async t => {
    const initial = nomadTE.left<{}, string, string>("hold dis, left");
    const expected = nomadTE.left<{}, string, number>("hold dis, left");

    {
        const actual = initial.chain((a: string) => nomadTE.of(a.length));
        t.deepEqual(await expected.run(), await actual.run());
    }
    {
        const actual = nomadTE.chain((a: string) => nomadTE.of(a.length))(initial);
        t.deepEqual(await expected.run(), await actual.run());
    }
});
