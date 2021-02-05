import * as T from "fp-ts/Task";
import {TaskNomadEither} from "@nomad-ts/core";

function sleep(ms: number): Promise<unknown> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const delayTNE: (ms: number) => <Effect = never, Left = never, Right = never>(f: TaskNomadEither<Effect, Left, Right>) => TaskNomadEither<Effect, Left, Right> =
    (ms: number) => T.chainFirst(() => () => sleep(ms));