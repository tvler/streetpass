declare namespace TSReset {
  type NonFalsy<T> = T extends false | 0 | "" | null | undefined | 0n
    ? never
    : T;
}

interface Array<T> {
  filter(predicate: BooleanConstructor, thisArg?: any): TSReset.NonFalsy<T>[];
}
