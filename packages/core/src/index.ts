export * as N from "./Nomad";
export * as TN from "./TaskNomad";
export * as TNE from "./TaskNomadEither";
export * as NE from "./NomadEither";
export * as AN from "./AsyncNomad";

import * as N from "./Nomad";
import * as TN from "./TaskNomad";
import * as TNE from "./TaskNomadEither";
import * as NE from "./NomadEither";
import * as AN from "./AsyncNomad";

export type Nomad<Effect, Value> = N.Nomad<Effect, Value>;
export type NomadEither<Effect, Left, Right> = NE.NomadEither<Effect, Left, Right>;
export type TaskNomad<Effect, Value> = TN.TaskNomad<Effect, Value>;
export type TaskNomadEither<Effect, Left, Right> = TNE.TaskNomadEither<Effect, Left, Right>;
export type AsyncNomad<Dep, Effect, Left, Right> = AN.AsyncNomad<Dep, Effect, Left, Right>;
