import { BetterMap } from "./deps.ts";

class AccessError extends Error {
  constructor(message: string | undefined) {
    super(message);
  }
}

type PropType = "TEXT" | "NUMBER" | string[];

type FileInputType = "json" | "csv" | "arff";

interface FileOptions {
  path: string;
  type: FileInputType;
}

interface PropsAndResult {
  props: Record<string, PropType>;
  data: unknown[]
}

interface ApysOptions {
  file: FileOptions;
  props?: Record<string, PropType>;
}

export class Apys {
  props: Record<string, PropType> | undefined;
  filePath: string;
  inputType: FileInputType;
  data: Array<unknown> | BetterMap<unknown, unknown> | null;
  constructor(options: ApysOptions) {
    this.props = options.props;
    this.filePath = options.file.path;
    this.inputType = options.file.type || "json";
    this.data = [];
  }
  async load() {
    if (
      !this.props && (this.inputType === "json" || this.inputType === "csv")
    ) {
      throw new TypeError(
        "Props must be passed when input type is CSV or JSON",
      );
    }
    const permissionRequestData = {
      name: "read",
      path: this.filePath,
    } as const;
    const permissionRequestStatus = await Deno.permissions.request(
      permissionRequestData,
    );
    console.log(permissionRequestStatus);
    if (permissionRequestStatus.state === "granted") {
      let data = await Deno.readTextFile(this.filePath);
      if (this.inputType === "json") {
        data = JSON.parse(data);
        if (!Array.isArray(data)) {
          throw new TypeError(`File content for JSON data must be an array.`);
        }
        this.data = data;
        return true;
      } else if (this.inputType === "csv") {
        this.data = data.split("\n").map(parseCSV);
        return true;
      } else if (this.inputType === "arff") {
        const arffdata = parseArff(data);
        if (!arffdata) {
          throw new TypeError(`File content for ARFF file invalid.`);
        }
        this.data = arffdata.data;
        this.props = arffdata.props;
        return true;
      }
    }
    throw new AccessError(
      `Couldn't access ${this.filePath} (DISALLOWED READ). Please restart the app with the correct permissions.`,
    );
  }
  json() {
    return this.data?.map(x => {
      const res: Record<string, unknown> = {};
      const keys =  Object.keys(this.props || {});
      for(const key in keys) {
        const k = keys[key]
        res[k] = Array.isArray(x) ? x[key] : 0;
      }
      return res;
    })
  }
}

function parseCSV(data: string): unknown[] | null {
  const validRegex =
    /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
  const csvRegex =
    /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
  if (!validRegex.test(data)) return null;
  const result = [];
  data.replace(csvRegex, (m0, m1, m2, m3) => {
    if (typeof m1 === "string") result.push(m1.replace(/\\'/g, "'"));
    else if (typeof m2 === "string") result.push(m2.replace(/\\"/g, '"'));
    else if (typeof m3 === "string") result.push(m3);
    return "";
  });
  if (/,\s*$/.test(data)) result.push("");
  return result;
}

function parseArff(data: string): PropsAndResult | null {
  const splitData = data.split("\n");
  //  console.log(splitData)
  if (splitData.length === 0) return null;

  // parse props
  const props = splitData.filter((x) => x.toLowerCase().startsWith("@attribute")).map((x) =>
    x.replace(/@ATTRIBUTE\s+/i, "").split(/((?:\s+)\t?)|\t/).filter((y) =>
      y && !y.includes("\t")
    )
  ).map((x) => ({
    name: x[0].replace(/\"|\'/g, ""),
    type: x[1],
  }));
  const result: Record<string, PropType> = {};
  for (const prop of props) {
    if (/\{(.+)\}/.test(prop.type)) {
      result[prop.name] = /\{(.+)\}/g.exec(prop.type)?.[1].split(/\,\s?/) || "TEXT";
    } else {
      if (prop.type.toLowerCase() === "real") result[prop.name] = "NUMBER";
      else if (prop.type.toLowerCase() === "numeric") {
        result[prop.name] = "NUMBER";
      } else result[prop.name] = "TEXT";
    }
  }
  const datasetItem = splitData.find((x) => x.toLowerCase().startsWith("@data"));
  if (!datasetItem) return null;
  const datasetIndex = splitData.indexOf(datasetItem);
  const resData = splitData.slice(datasetIndex + 1, splitData.length);
  if (resData.length === 0) return null;
  return {
    props: result,
    data: resData.filter((x) => x).map((x) => parseCSV(x)).filter(x => x && x[0] !== "%"),
  };
}
