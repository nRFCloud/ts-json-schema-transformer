export interface SimpleType {
  foo: string;
}

export interface ComplexType {
  foo: ConditionalType<string>;
  bar: number;
  baz: boolean;
}

/**
 * @format iso-time
 */
export type ISOTime = string;

/**
 * @format iso-date-time
 */
export type ISODateTime = string;

export type ConditionalType<T> = T extends string ? string : number;

export declare class Tagged<N extends string> {
  protected _nominal_: N;
}

export type Nominal<T, N extends string, E extends T & Tagged<string> = T & Tagged<N>> = (T & Tagged<N>) | E;

/**
 * @format uuid
 */
export type TenantId = Nominal<string, "TenantId">;

export type UnionType = ComplexType | SimpleType;
