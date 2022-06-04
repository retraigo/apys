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