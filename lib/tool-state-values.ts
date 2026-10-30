export type ToolValues = Record<string, string>;
export type AllowedValues<T extends ToolValues> = Partial<Record<keyof T, readonly string[]>>;
export type ValueRules<T extends ToolValues> = Partial<Record<keyof T, { maxLength?: number; valid?: (value: string) => boolean }>>;

/** Validate only known fields; serialized lists get an explicit bounded allowance. */
export function sanitizeToolValues<T extends ToolValues>(defaults: T, incoming: unknown, allowed?: AllowedValues<T>, rules?: ValueRules<T>) {
  const values: Partial<T> = {};
  const rejected: string[] = [];
  if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) return { values, rejected };
  for (const key of Object.keys(defaults)) {
    if (!Object.prototype.hasOwnProperty.call(incoming, key)) continue;
    const value = (incoming as Record<string, unknown>)[key];
    const rule = rules?.[key as keyof T];
    const choices = allowed?.[key as keyof T];
    if (typeof value !== "string" || value.length > (rule?.maxLength ?? 200) ||
        (choices && !choices.includes(value)) || (rule?.valid && !rule.valid(value))) {
      rejected.push(key);
    } else (values as ToolValues)[key] = value;
  }
  return { values, rejected };
}
