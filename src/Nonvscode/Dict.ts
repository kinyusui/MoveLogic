export type NewDictByOld<TOldObj, TNewValueType> = {
  [K in keyof TOldObj]: TNewValueType;
};

type MakeNewVal<TOldObj, TOutput, TOldObjKey extends keyof TOldObj = keyof TOldObj> = (
  value: TOldObj[TOldObjKey],
  key: TOldObjKey,
) => TOutput;

const { hasOwnProperty } = Object.prototype;
const { call } = Function.prototype;
export const hasOwn = call.bind(hasOwnProperty); // safe way.

export function makeNewDict<TOldDict, TOutput>(
  oldDict: TOldDict,
  makeNewVal: MakeNewVal<TOldDict, TOutput>,
) {
  const result = {} as NewDictByOld<TOldDict, TOutput>;

  for (const key in oldDict) {
    if (hasOwn(oldDict, key)) {
      const val = oldDict[key];
      result[key] = makeNewVal(val, key);
    }
  }

  return result;
}

export type MakeNewDict = typeof makeNewDict;


export type DictG = Record<string, any>;

export const fillDefaults = <TObj extends DictG, TObj1 extends DictG>(
  defaultObj: TObj1 = {} as TObj1,
  obj: TObj = {} as TObj,
) => {
  return { ...defaultObj, ...obj } as TObj1;
};
export type FillDefaults = typeof fillDefaults;