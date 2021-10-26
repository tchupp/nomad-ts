import * as R from "fp-ts/Reader";

import {AsyncNomad} from "@nomad-ts/core";

import {delayTNE} from "./delay_tne";

export const delayAN: (ms: number) => <Dep, Effect = never, Left = never, Right = never>(f: AsyncNomad<Dep, Effect, Left, Right>) => AsyncNomad<Dep, Effect, Left, Right> =
    (ms: number) => R.map(delayTNE(ms));
