/**
 * @internal
 */
export const bind_ = <A, N extends string, B>(
    a: A,
    name: Exclude<N, keyof A>,
    b: B
): { [K in keyof A | N]: K extends keyof A ? A[K] : B } => Object.assign({}, a, { [name]: b }) as any

/**
 * @internal
 */
export const bindTo_ = <N extends string>(name: N) => <B>(b: B): { [K in N]: B } => ({ [name]: b } as any)
