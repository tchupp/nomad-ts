import test from "ava";

import {nomad, Nomad} from "../src";

test("concat", t => {
    const actual = new Nomad([1], "hold dis")
        .concat(2)
        .concat([3, 4]);

    const expected = new Nomad([1, 2, 3, 4], "hold dis");
    t.deepEqual(actual, expected);
});

test("concatL", t => {
    const actual = new Nomad([1], "hold dis")
        .concatL(() => 2)
        .concatL(() => [3, 4]);

    const expected = new Nomad([1, 2, 3, 4], "hold dis");
    t.deepEqual(actual, expected);
});

test("concatValue", t => {
    const actual = new Nomad([1], "hold dis")
        .concatValue((value) => value.length)
        .concatValue((value) => [value.length + 3, value.length + 4]);

    const expected = new Nomad([1, 8, 11, 12], "hold dis");
    t.deepEqual(actual, expected);
});

test("Nomad is a functor: URI", t => {
    {
        t.deepEqual("Nomad", nomad.URI);
    }
});

test("Nomad is a functor: map", t => {
    const initial = new Nomad([], "hold dis");
    const expected = new Nomad([], 8);

    {
        const actual = initial.map((a: string) => a.length);
        t.deepEqual(expected, actual);
    }
    {
        const actual = nomad.map((a: string) => a.length)(initial);
        t.deepEqual(expected, actual);
    }
});

test("Nomad is applicative: of", t => {
    const actual = nomad.of("hold dis");

    const expected = new Nomad([], "hold dis");
    t.deepEqual(expected, actual);
});

test("Nomad is applicative: ap", t => {
    const fab = nomad.of<string, (n: number) => number>(n => n * 2)
        .concat("that effect");

    const initial: Nomad<string, number> = nomad.of<string, number>(1)
        .concat("this effect");
    const expected = nomad.of(2)
        .concat("this effect")
        .concat("that effect");

    t.deepEqual(expected, initial.ap<number>(fab));
    t.deepEqual(expected, nomad.ap(fab)(initial));
});

test("Nomad is a chain: chain", t => {
    const initial = new Nomad([1], "world");

    const expected = new Nomad([1, 2], "hello, world!");

    {
        const actual = initial.chain(a => new Nomad([2], `hello, ${a}!`));
        t.deepEqual(expected, actual);
    }
    {
        const actual = nomad.chain(a => new Nomad([2], `hello, ${a}!`))(initial);
        t.deepEqual(expected, actual);
    }
    {
        const actual = initial
            .map(a => `hello, ${a}!`)
            .concat(2);
        t.deepEqual(expected, actual);
    }
});