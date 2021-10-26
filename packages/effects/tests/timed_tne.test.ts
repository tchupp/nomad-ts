import test from "ava";
import {TaskNomadEither, TNE} from "@nomad-ts/core";
import {Timed, TNEEffects} from "../src";

import {pipe} from "fp-ts/function";
import * as E from "fp-ts/Either";

type Errors =
    | { _type: "Error1", details: string }
    | { _type: "Error2", attempts: number }
    ;

function sleep(ms: number): Promise<unknown> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const uuidRegex = /^[A-Z0-9]{8}-[A-Z0-9]{4}-4[A-Z0-9]{3}-[89AB][A-Z0-9]{3}-[A-Z0-9]{12}$/i;

test("TNEEffects.timed adds a Timed effect", async t => {
    const dependencies = {
        http_client: {
            call1: (url: string) => Promise.resolve(url.length),
            call2: (url: string) => Promise.reject("don't call this...")
        }
    };

    const flow1: TaskNomadEither<Timed, Errors, number> = pipe(
        TNE.tryCatch<never, Errors, number>(
            () => dependencies.http_client.call1("example.com"),
            (err): Errors => ({_type: "Error1", details: `${err}`}),
        ),
        TNEEffects.delay(100),
        TNEEffects.timed("real_operation_name"),
    );

    // TNEEffects.timed should ignore this when recording time
    await sleep(200);

    const actual = await flow1();

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
