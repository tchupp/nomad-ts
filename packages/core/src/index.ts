export * as N from "../src/Nomad";
export * as TN from "../src/TaskNomad";
export * as TNE from "../src/TaskNomadEither";
export * as NE from "../src/NomadEither";
export * as AN from "../src/AsyncNomad";

import * as N from "../src/Nomad";
import * as TN from "../src/TaskNomad";
import * as TNE from "../src/TaskNomadEither";
import * as NE from "../src/NomadEither";
import * as AN from "../src/AsyncNomad";

export type Nomad<Effect, Value> = N.Nomad<Effect, Value>;
export type NomadEither<Effect, Left, Right> = NE.NomadEither<Effect, Left, Right>;
export type TaskNomad<Effect, Value> = TN.TaskNomad<Effect, Value>;
export type TaskNomadEither<Effect, Left, Right> = TNE.TaskNomadEither<Effect, Left, Right>;
export type AsyncNomad<Dep, Effect, Left, Right> = AN.AsyncNomad<Dep, Effect, Left, Right>;
