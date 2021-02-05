import test from "ava";
import {AN, AsyncNomad} from "@nomad-ts/core";
import {ANEffects, Timed} from "../src";

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

function sleep(ms: number): Promise<unknown> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const uuidRegex = /^[A-Za-z0-9]{8}-[A-Za-z0-9]{4}-4[A-Za-z0-9]{3}-[A-Za-z0-9]{4}-[A-Za-z0-9]{12}$/i;

test("ANEffects.timed adds a Timed effect", async t => {
    const flow1: AsyncNomad<Dependencies, Timed, Errors, number> = pipe(
        AN.tryCatch<Dependencies, never, Errors, number>(
            (dep: Dependencies) => dep.http_client.call1("example.com"),
            (err): Errors => ({_type: "Error1", details: `${err}`}),
        ),
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

    t.like(actual.effects[0], {
        _type: "Timed",
        _level: "INFO",
        operation_name: "real_operation_name",
        details: {},
    });

    t.is(actual.effects.length, 1);

    const timeMs = actual.effects[0].time_ms;
    t.assert(100 < timeMs && timeMs < 125);
    t.regex(actual.effects[0].span_id, uuidRegex);
});
