# apys
APYS processes your stuff.

## Initialization
```ts
import { Apys } from "....";

const apys = new Apys({
  file: { path: "/path/to/your/file", type: "json/csv/arff" },
  props { your, props, here }
});
```

### Example

**JSON & ARFF**

```ts
const apys = new Apys({
  file: { path: "./testdata/abyss.json", type: "json" },
})

```

**CSV**

CSV files require props to be explicitly passed for now.

```ts
const apys = new Apys({
  file: { path: "./testdata/abyss.csv", type: "csv" },
  props: { // Record <string, {"NUMBER" | "TEXT"}>
    balance: "NUMBER",
    sp: "NUMBER",
    vit: "NUMBER",
    def: "NUMBER",
    exp: "NUMBER",
    mdef: "NUMBER",
    requiem: "TEXT",
  },
})

```

## Structure


## Statistics

### statsOf(prop: string)
```ts
apys.statsOf("balance")
/*
  High standard deviation indicates unreliable data.
  balance: {
    max: 14514820,
    min: -298553,
    mean: 43812.71920289855,
    median: 2988,
    mode: 0,
    standardDeviation: 618712.8147455562
  },
*/
```

Only the mode is returned for TEXT props.

### stats()
```ts
apys.stats()
/*
{
  balance: {
    max: 14514820,
    min: -298553,
    mean: 43812.71920289855,
    median: 2988,
    mode: 0,
    standardDeviation: 618712.8147455562
  },
  sp: {
    max: 9002,
    min: 0,
    mean: 170,
    median: 3,
    mode: 2,
    standardDeviation: 610.6991411622698
  },
  vit: {
    max: 2000000,
    min: 0,
    mean: 4392.893115942029,
    median: 32458,
    mode: 3,
    standardDeviation: 85153.30005352046
  },
  def: {
    max: 7642,
    min: 0,
    mean: 73.41847826086956,
    median: 153,
    mode: 0,
    standardDeviation: 436.3290070767185
  },
  mdef: {
    max: 7680,
    min: 0,
    mean: 69.0126811594203,
    median: 15,
    mode: 0,
    standardDeviation: 417.1890441616115
  },
  class: { mode: "Novice" }
}
*/
```