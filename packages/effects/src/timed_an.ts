import * as R from "fp-ts/Reader";

import {AsyncNomad} from "@nomad-ts/core";

import {timedTNE} from "./timed_tne";
import {Timed} from "./timed";

export const timedAN: (operation_name: string) => <Dep, Effect, Left, Right>(f: AsyncNomad<Dep, Effect, Left, Right>) => AsyncNomad<Dep, Timed | Effect, Left, Right> =
    operation_name => R.map(timedTNE(operation_name));
