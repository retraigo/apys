import type { PropsAndResult, PropType } from "../types.d.ts";

export function parseJSON(data: string): PropsAndResult {
  const parsed = JSON.parse(data);
  if (!Array.isArray(parsed)) {
    throw new TypeError("JSON data must be an array!");
  }
  const props: Record<string, PropType> = {};
  const maxParsed =
    parsed.slice().sort((a, b) => Object.keys(a).length - Object.keys(b).length)
      .reverse()[0];
  for (const prop in maxParsed) {
    props[prop] = typeof maxParsed.prop === "number" ? "NUMBER" : "TEXT";
  }
  const result = parsed.map((x) => {
    const res = [];
    for (const prop in props) {
      res.push(x[prop] || 0);
    }
    return res;
  });

  return { props, data: result };
}
