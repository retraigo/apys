import type { PropsAndResult, PropType } from "../types.d.ts";
import { parseCSV } from "./csv.ts"

export async function parseArff(data: string): Promise<PropsAndResult | null> {
  const splitData = data.split("\n");
  //  console.log(splitData)
  if (splitData.length === 0) return null;

  // parse props
  const props = splitData.filter((x) =>
    x.toLowerCase().startsWith("@attribute")
  ).map((x) =>
    x.replace(/@ATTRIBUTE\s+/i, "").split(/((?:\s+)\t?)|\t/).filter((y) =>
      y && !y.includes("\t")
    )
  ).map(x => x.filter(y => y.replace(/\s/g, ""))).map((x) => ({
    name: x[0].replace(/\"|\'/g, ""),
    type: x[1],
  }));
//  console.log(props)
  const result: Record<string, PropType> = {};
  for (const prop of props) {
    if (/\{(.+)\}/.test(prop.type)) {
      result[prop.name] = /\{(.+)\}/g.exec(prop.type)?.[1].split(/\,\s?/) ||
        "TEXT";
    } else {
      if (prop.type.toLowerCase() === "real") result[prop.name] = "NUMBER";
      else if (prop.type.toLowerCase() === "numeric") {
        result[prop.name] = "NUMBER";
      } else result[prop.name] = "TEXT";
    }
  }
  const datasetItem = splitData.find((x) =>
    x.toLowerCase().startsWith("@data")
  );
  if (!datasetItem) return null;
  const datasetIndex = splitData.indexOf(datasetItem);
  const resData = splitData.slice(datasetIndex + 1, splitData.length).filter(x => !x.toLowerCase().startsWith("%"));
  if (resData.length === 0) return null;
  const validResData = await parseCSV(resData.filter((x) => x).join("\n"))

  return {
    props: result,
    data: validResData.map((x: string[]) => {
      const arr = []
      for (const val in x) {
        if(!isNaN(Number(x[val]))) arr.push(Number(x[val]))
        else arr.push(x[val])
      }
      return arr;
    })
  };
}
