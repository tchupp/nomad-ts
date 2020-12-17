import test from "ava";
import {AN, TNE, NE} from "@nomad-ts/core";

import {flow, pipe} from "fp-ts/function";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import AsyncNomad = AN.AsyncNomad;
import NomadEither = NE.NomadEither;

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
    ;

test("AsyncNomad - example 1", async t => {
    const flow1: AsyncNomad<Dependencies, Effect, Errors, number> = flow(
        TE.tryCatchK(
            (dep: Dependencies) => dep.http_client.call1("example.com"),
            (err): Errors => ({_type: "Error1", details: `${err}`}),
        ),
        te => TNE.fromTaskEither<Effect, Errors, number>(te),
        TNE.effectL(() => (<Effect>{_type: "log", level: "debug", message: "lazy log!", context: {}})),
    );

    const dependencies = {
        http_client: {
            call1: (url: string) => Promise.resolve(url.length),
            call2: (url: string) => Promise.reject("don't call this...")
        }
    };

    const actual = await pipe(
        flow1,
        AN.executePromise(dependencies),
    );

    const expected: NomadEither<Effect, Errors, number> = {
        effects: [
            {
                _type: "log",
                level: "debug",
                message: "lazy log!",
                context: {},
            },
        ],
        value: E.right(11),
    }

    t.deepEqual(actual, expected);
})
