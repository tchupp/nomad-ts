export type Timed = {
    readonly _type: "Timed"
    readonly _level: "ERROR" | "WARN" | "INFO" | "DEBUG" | "TRACE" | "SILENT"
    readonly span_id: string
    readonly operation_name: string
    readonly time_ms: number
    readonly details: object
};

export function Timed(span_id: string, operation_name: string, level: Timed["_level"], details: object, startTime: [number, number], endTime: [number, number]): Timed {
    const starttime_ms = (startTime[0] * 1000) + (startTime[1] / 1000000);
    const endtime_ms = (endTime[0] * 1000) + (endTime[1] / 1000000);
    return {
        _type: "Timed",
        _level: level,
        span_id,
        operation_name,
        time_ms: endtime_ms - starttime_ms,
        details,
    };
}
