import test from "ava";
import {AN, AsyncNomad, NomadEither, TaskNomadEither, TNE} from "@nomad-ts/core";
import {ANEffects, Timed, TNEEffects} from "@nomad-ts/effects";

import {pipe} from "fp-ts/function";
import * as E from "fp-ts/Either";

type Errors =
    | { _type: "Error1", details: string }
    | { _type: "Error2", attempts: number }
    ;

type Dependencies = {
    http_client: {
        call1: (url: string) => Promise<number>
        call2: (url: string) => Promise<string>
    }
}

type Effect =
    | { _type: "log", level: "debug" | "info", message: string, context: Record<string, any> }
    | Timed
    ;

function sleep(ms: number): Promise<unknown> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

test("AsyncNomad - example 1", async t => {
    const flow1: AsyncNomad<Dependencies, Effect, Errors, number> = pipe(
        AN.tryCatch<Dependencies, Effect, Errors, number>(
            (dep: Dependencies) => dep.http_client.call1("example.com"),
            (err): Errors => ({_type: "Error1", details: `${err}`}),
        ),
        AN.effectL(() => (<Effect>{_type: "log", level: "debug", message: "lazy log!", context: {}})),
        ANEffects.delay(100),
        ANEffects.timed("real_operation_name"),
    );

    const dependencies = {
        http_client: {
            call1: (url: string) => Promise.resolve(url.length),
            call2: (url: string) => Promise.reject("don't call this...")
        }
    };

    // ANEffects.timed should ignore this when recording time
    await sleep(200);

    const actual = await pipe(
        flow1,
        AN.executePromise(dependencies),
    );

    t.deepEqual(actual.value, E.right(11));

    t.deepEqual(actual.effects.length, 2);

    t.like(actual.effects[0], {
        _type: "log",
        level: "debug",
        message: "lazy log!",
        context: {},
    });

    t.like(actual.effects[1], {
        _type: "Timed",
        _level: "INFO",
        operation_name: "real_operation_name",
        details: {},
    });
})

test("TaskNomadEither - example 1", async t => {
    const dependencies = {
        http_client: {
            call1: (url: string) => Promise.resolve(url.length),
            call2: (url: string) => Promise.reject("don't call this...")
        }
    };

    const flow1: TaskNomadEither<Effect, Errors, number> = pipe(
        TNE.tryCatch<Effect, Errors, number>(
            () => dependencies.http_client.call1("example.com"),
            (err): Errors => ({_type: "Error1", details: `${err}`}),
        ),
        TNE.effectL(() => (<Effect>{_type: "log", level: "debug", message: "lazy log!", context: {}})),
        TNEEffects.delay(100),
        TNEEffects.timed("real_operation_name"),
    );

    // TNEEffects.timed should ignore this when recording time
    await sleep(200);

    const actual: NomadEither<Effect, Errors, number> = await pipe(
        flow1(),
    );

    t.deepEqual(actual.value, E.right(11));

    t.deepEqual(actual.effects.length, 2);

    t.like(actual.effects[0], {
        _type: "log",
        level: "debug",
        message: "lazy log!",
        context: {},
    });

    t.like(actual.effects[1], {
        _type: "Timed",
        _level: "INFO",
        operation_name: "real_operation_name",
        details: {},
    });
})
