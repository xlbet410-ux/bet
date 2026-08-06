// Fills {placeholder} tokens in a translated string, e.g. fmt(t.profileStepXOf2, { n: "1" }).
export function fmt(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, v), template);
}
