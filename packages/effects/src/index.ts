import {delayAN} from "./delay_an";
import {delayTNE} from "./delay_tne";
import {timedAN} from "./timed_an";
import {timedTNE} from "./timed_tne";

import {Timed as TimedType} from "./timed";

export type Timed = TimedType;

export const ANEffects = {
    delay: delayAN,
    timed: timedAN,
};

export const TNEEffects = {
    delay: delayTNE,
    timed: timedTNE,
};
