import { Apys } from "./mod.ts";

const apys = new Apys({
  file: { path: "./testdata/abyss.arff", type: "arff" },
/*  props: {
    balance: "NUMBER",
    sp: "NUMBER",
    vit: "NUMBER",
    def: "NUMBER",
//    exp: "NUMBER",
    mdef: "NUMBER",
    requiem: "TEXT",
  },
*/
});

// console.log(apys)

await apys.load()

// console.log(apys.props)
// console.log(apys.json()?.slice(0, 4))
console.log(apys.stats())