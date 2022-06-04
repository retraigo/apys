
export type PropType = "TEXT" | "NUMBER" | string[];

export type FileInputType = "json" | "csv" | "arff";

export interface FileOptions {
  path: string;
  type: FileInputType;
}

export interface PropsAndResult {
  props: Record<string, PropType>;
  data: unknown[][];
}

export interface ApysOptions {
  file: FileOptions;
  props?: Record<string, PropType>;
}

export interface StatsResult {
  max?: number;
  min?: number;
  mean?: number;
  median?: number;
  mode?: number|string;
  standardDeviation?: number;
}