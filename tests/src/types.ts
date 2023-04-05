export interface SimpleType {
  foo: string;
}

export interface ComplexType {
  foo: ConditionalType<string>;
  bar: number;
  baz: boolean;
}

export interface TypeWithPatterns {
  device: DeviceId;
  tag: DeviceTag;
  subType: DeviceSubType;
  ulid: ULID;
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

/**
 * @pattern ^[a-z0-9:_-]{1,128}$
 */
export type DeviceId = Nominal<string, "DeviceId">;

// Allowed Base32 characters using Crockford's alphabet. Must be 26 chars.
/**
 * @pattern ^[0-9A-HJKMNP-TV-Z]{26}$
 */
export type ULID = Nominal<string, "ULID">;

/**
 * @format uuid
 */
export type UUID = Nominal<string, "UUID">;

/**
 * @pattern ^[a-zA-Z0-9_.@:#-]+$
 */
export type DeviceTag = Nominal<string, "DeviceTag">;

/**
 * @pattern [a-zA-Z0-9_.,@\/:#-]{0,799}
 */
export type DeviceSubType = Nominal<string, "DeviceSubType">;

export const ServiceProcessStatuses = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  SUCCEEDED: "SUCCEEDED",
  FAILED: "FAILED",
} as const;
export type ServiceProcessStatus = UnionValues<typeof ServiceProcessStatuses>;

export type UnionValues<T> = T[keyof T];
