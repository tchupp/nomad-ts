import test from "ava";

import {nomadRTE, NomadRTE, nomadTE} from "../src";
import {fromNomadTE, left} from "../src/NomadRTE";
import {pipe} from "fp-ts/lib/pipeable";

test("concat", async t => {
    const actual = nomadRTE.of("hold dis").concat(1)
        .concat(2)
        .concat([3, 4]);

    const expected = nomadRTE.of("hold dis").concat([1, 2, 3, 4]);
    t.deepEqual(
        await actual.run({}),
        await expected.run({})
    );
});

test("concatL", async t => {
    const actual = nomadRTE.of("hold dis").concat(1)
        .concatL(() => 2)
        .concatL(() => [3, 4]);

    const expected = nomadRTE.of("hold dis").concat([1, 2, 3, 4]);
    t.deepEqual(
        await actual.run({}),
        await expected.run({})
    );
});

test("NomadRTE is a functor: URI", t => {
    t.deepEqual("NomadRTE", nomadRTE.URI);
});

test("NomadRTE is a functor: map", async t => {
    const initial = nomadRTE.of("hold dis");
    const expected = nomadRTE.of(8);

    {
        const actual = initial.map((a: string) => a.length);
        t.deepEqual(
            await expected.run({}),
            await actual.run({})
        );
    }
    {
        const actual = nomadRTE.map((a: string) => a.length)(initial);
        t.deepEqual(
            await expected.run({}),
            await actual.run({})
        );
    }
});

test("map does not affect 'left' eithers", async t => {
    const initial: NomadRTE<{}, {}, string, string> = nomadRTE.left("hold dis, left");
    const expected: NomadRTE<{}, {}, string, number> = nomadRTE.left("hold dis, left");

    {
        const actual = initial.map((a: string) => a.length);
        t.deepEqual(
            await expected.run({}),
            await actual.run({})
        );
    }
    {
        const actual = nomadRTE.map<{}, {}, string, string, number>((a: string) => a.length)(initial);
        t.deepEqual(
            await expected.run({}),
            await actual.run({})
        );
    }
});

test("NomadRTE is applicative: of", async t => {
    const actual = nomadRTE.of("hold dis");

    const expected = fromNomadTE(nomadTE.of("hold dis"));
    t.deepEqual(
        await expected.run({}),
        await actual.run({})
    );
});

test("NomadRTE is applicative: ap", async t => {
    const fab = nomadRTE.of<{}, string, string, (n: number) => number>(n => n * 2);

    const initial = nomadRTE.of<{}, string, string, number>(1);
    const expected = nomadRTE.of(2);

    t.deepEqual(
        await expected.run({}),
        await initial.ap<number>(fab).run({})
    );
    t.deepEqual(
        await expected.run({}),
        await nomadRTE.ap(fab)(initial).run({})
    );
});

test("NomadRTE is a monad: chain", async t => {
    const initial = nomadRTE.of<{}, number, {}, string>("world").concat(1);
    const expected = nomadRTE.of<{}, number, {}, string>("hello, world!").concat([1, 2]);

    const f = (a: string) => nomadRTE.of<{}, number, {}, string>(`hello, ${a}!`).concat(2);
    {
        const actual = initial.chain(f);
        t.deepEqual(
            await expected.run({}),
            await actual.run({})
        );
    }
    {
        const actual = nomadRTE.chain(f)(initial);
        t.deepEqual(
            await expected.run({}),
            await actual.run({})
        );
    }
    {
        const actual = initial
            .map(a => `hello, ${a}!`)
            .concat(2);
        t.deepEqual(
            await expected.run({}),
            await actual.run({})
        );
    }
});

test("chain does not affect 'left' eithers", async t => {
    const initial: NomadRTE<{}, {}, string, string> = nomadRTE.left("hold dis, left");
    const expected: NomadRTE<{}, {}, string, number> = nomadRTE.left("hold dis, left");

    {
        const actual = initial.chain(a => nomadRTE.of(a.length));
        t.deepEqual(
            await expected.run({}),
            await actual.run({})
        );
    }
    {
        const actual = pipe(
            initial,
            nomadRTE.chain(a => nomadRTE.of(a.length))
        );
        t.deepEqual(
            await expected.run({}),
            await actual.run({})
        );
    }
});

test("NomadRTE is a reader: local", async t => {
    const initial = nomadRTE.of<string, number, {}, string>("world").concat(1);
    const expected = nomadRTE.of<{ name: string }, number, {}, string>("world").concat([1, 2]);

    const actual = initial.local((ctx: { name: string }) => ctx.name).concatL(() => 2);
    t.deepEqual(
        await expected.run({name: "world"}),
        await actual.run({name: "world"})
    );

});

test("NomadRTE is a left chain: orElse", async t => {
    const initial: NomadRTE<{}, {}, string, string> = nomadRTE.left("hold dis, left");
    const expected: NomadRTE<{}, {}, number, string> = nomadRTE.left(14);

    {
        const actual = initial.orElse(a => nomadRTE.left(a.length));
        t.deepEqual(
            await expected.run({}),
            await actual.run({})
        );
    }
});

test("NomadRTE 'orElse' does not affect the right side", async t => {
    const initial: NomadRTE<{}, {}, string, string> = nomadRTE.of("hold dis, right");
    const expected: NomadRTE<{}, {}, number, string> = nomadRTE.of("hold dis, right");

    {
        const actual = initial.orElse(a => left(a.length));
        t.deepEqual(
            await expected.run({}),
            await actual.run({})
        );
    }
});

test("combine with empty list returns empty", async t => {
    const expected: NomadRTE<{}, {}, number, string[]> = nomadRTE.of([]);
    const actual = nomadRTE.combine<{}, {}, number, string>([]);

    t.deepEqual(
        await expected.run({}),
        await actual.run({})
    );
});

test("combine with all right returns all right", async t => {
    const input1 = nomadRTE.of<{}, number, number, string>("hold dis, right 1").concat(1);
    const input2 = nomadRTE.of<{}, number, number, string>("hold dis, right 2").concat(2);
    const input3 = nomadRTE.of<{}, number, number, string>("hold dis, right 3").concat(3);

    const actual = nomadRTE.combine<{}, number, number, string>([input1, input2, input3]);
    const expected = nomadRTE.of<{}, number, number, string[]>([
        "hold dis, right 1",
        "hold dis, right 2",
        "hold dis, right 3"
    ]).concat([1, 2, 3]);

    t.deepEqual(
        await expected.run({}),
        await actual.run({})
    );
});

test("combine removes results from left eithers, but keeps effects", async t => {
    const input1 = nomadRTE.of<{}, number, number, string>("hold dis, right 1").concat(1);
    const input2 = left<{}, number, number, string>(17).concat(2);
    const input3 = nomadRTE.of<{}, number, number, string>("hold dis, right 3").concat(3);

    const actual = nomadRTE.combine<{}, number, number, string>([input1, input2, input3]);
    const expected = nomadRTE.of<{}, number, number, string[]>([
        "hold dis, right 1",
        "hold dis, right 3"
    ]).concat([1, 2, 3]);

    t.deepEqual(
        await expected.run({}),
        await actual.run({})
    );
});