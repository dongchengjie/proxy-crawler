// @ts-types="npm:@types/lodash-es"
import { forEach, isObject } from "lodash-es";

export const walk = (
  obj: object,
  callback: (value: unknown, key: string) => void,
) => {
  forEach(obj, (value: unknown, key: string) => {
    callback(value, key);

    isObject(value) && walk(value as object, callback);
  });
};
