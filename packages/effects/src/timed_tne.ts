import {v4 as uuid} from "uuid";
import {pipe} from "fp-ts/function";

import {NE, TaskNomadEither} from "@nomad-ts/core";

import {Timed} from "./timed";

export const timedTNE =
    (operation_name: string) =>
        <Dep, Effect, Left, Right>(f: TaskNomadEither<Effect, Left, Right>): TaskNomadEither<Effect | Timed, Left, Right> => async () => {
            const id = uuid();
            const startTime = process.hrtime();
            return pipe(
                await f(),
                NE.effectL<Effect | Timed>(() => Timed(id, operation_name, "INFO", {}, startTime, process.hrtime())),
            );
        };
