/**
 * Create an Insert type from a Row type.
 *
 * T = full row type
 * OptionalKeys = keys that are optional on insert
 *
 * All other keys remain required.
 */
export type CreateInsertType<T, OptionalKeys extends keyof T> =
  // Optional columns become optional
  Partial<Pick<T, OptionalKeys>> &
    // Required columns remain required
    Omit<T, OptionalKeys>;
