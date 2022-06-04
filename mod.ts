 import { BetterMap } from "./deps.ts";

import type {
  ApysOptions,
  FileInputType,
  FileOptions,
  PropsAndResult,
  StatsResult,
  PropType,
} from "./types.d.ts";

import { parseArff, parseCSV, parseJSON } from "./parsers/mod.ts";

class AccessError extends Error {
  constructor(message: string | undefined) {
    super(message);
  }
}

export class Apys {
  props: Record<string, PropType>;
  filePath: string;
  inputType: FileInputType;
  data: unknown[][] | null;
  constructor(options: ApysOptions) {
    this.props = options.props || {};
    this.filePath = options.file.path;
    this.inputType = options.file.type || "json";
    this.data = [];
  }
  async load() {
    if (
      (!this.props || Object.keys(this.props).length === 0) &&
      (this.inputType === "csv")
    ) {
      throw new TypeError(
        "Props must be passed when input type is CSV",
      );
    }
    const permissionRequestData = {
      name: "read",
      path: this.filePath,
    } as const;
    const permissionRequestStatus = await Deno.permissions.request(
      permissionRequestData,
    );
    console.log(permissionRequestStatus)
    if (permissionRequestStatus.state === "granted") {
      let data = await Deno.readTextFile(this.filePath);
      if (this.inputType === "json") {
        const parsedData = parseJSON(data);
        this.data = parsedData.data;
        this.props = this.normalizeProps(parsedData.props);
        return true;
      } else if (this.inputType === "csv") {
        this.data = await parseCSV(data).then((n) =>
          n.map((x) => {
            const res = [];
            const propVal = Object.values(this.props);
            for (const prop in propVal) {
              res.push(propVal[prop] === "NUMBER" ? Number(x[prop]) : x[prop]);
            }
            return res;
          })
        );
        return true;
      } else if (this.inputType === "arff") {
        const parsedData = await parseArff(data);
        if (!parsedData) {
          throw new TypeError(`File content for ARFF file invalid.`);
        }
        this.props = this.normalizeProps(parsedData.props);

        this.data = parsedData.data.map((x) => {
          const res = [];
          const propVal = Object.values(this.props);
//          console.log(this.props)
          for (const prop in propVal) {
//            console.log(propVal[prop] === "NUMBER")
            res.push(propVal[prop] === "NUMBER" ? Number(x[prop]) : x[prop]);
          }
          return res;
        });
        return true;
      }
    }
    throw new AccessError(
      `Couldn't access ${this.filePath} (DISALLOWED READ). Please restart the app with the correct permissions.`,
    );
  }
  normalizeProps(props: Record<string, PropType>): Record<string, PropType> {
    const res: Record<string, PropType> = {};
    if(Object.keys(this.props).length === 0) return props;
    for (const prop in this.props) {
      if (props[prop] === this.props[prop]) res[prop] = props[prop];
      else if (props[prop] === "NUMBER" && this.props[prop] === "TEXT") {
        res[prop] = "TEXT";
      } else if (props[prop] && !this.props[prop]) res[prop] = props[prop];
      else if (!props[prop] && this.props[prop]) {
        throw new TypeError(`Missing property ${prop} in data!`);
      } else res[prop] = props[prop];
    }
    console.log(res, props)
    return res;
  }
  stats(): Record<string, StatsResult> {
    const result: Record<string, StatsResult> = {};
    for (const prop in this.props) {
      result[prop] = this.statsOf(prop)
    }
    return result;
  }
  statsOf(prop: string): StatsResult {
    if(!this.props[prop]) throw new TypeError(`Invalid property ${prop}!`);
    if(!this.data) throw new TypeError(`No data loaded!`);
    if(this.props[prop] === "NUMBER") {
      const data = this.data.map(x => Number(x[Object.keys(this.props).indexOf(prop)]) || 0) 
//      console.log(data.filter(x => isNaN(x)))
      const mean = data.reduce((acc: number, val: number) => acc + val, 0) / data.length;
      const stdDev = Math.sqrt(data.reduce((acc: number, val: number) => acc + ((val - mean) ** 2), 0) / (data.length - 1))
      const modeItem = this.getMode(data);
//      console.log(data.filter(x => !x))
      return {
        max: data.reduce((acc: number, val: number) => acc > val ? acc : val, data[0]),
        min: data.reduce((acc: number, val: number) => acc < val ? acc : val, data[0]),
        mean: mean,
        median: data.sort()[Math.floor((data.length - 1) / 2)],
        mode: Number(modeItem),
        standardDeviation: stdDev
      }
    }
    else {
      const data = this.data.map(x => x[Object.keys(this.props).indexOf(prop)])
      const modeItem = this.getMode(data);
      return {mode: String(modeItem)}
    }
  }
  getMode<V>(data: V[]): V {
    const recurring: V[] = data.filter((x, i) => data.indexOf(x) !== i);
    const modeItem = new BetterMap<V, number>()
    recurring.forEach(x => {
      modeItem.set(x, (modeItem.get(x) || 0) + 1);
    })
    return modeItem.reduce((a: [V, number], v: [V, number]) => a[1] < v[1] ? v : a, [recurring[0], 0])[0];
  } 
  json() {
    return this.data?.map((x) => {
      const res: Record<string, unknown> = {};
      const keys = Object.keys(this.props || {});
      for (const key in keys) {
        const k = keys[key];
        res[k] = Array.isArray(x) ? x[key] : 0;
      }
      return res;
    });
  }
}
