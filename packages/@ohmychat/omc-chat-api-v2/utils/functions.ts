export const createMapsObject = (...args) => args.reduce((acc, arg) => ({ ...acc, [arg]: new Map() }), {});
export const objectWalk = (obj, fn) => Object.fromEntries(Object.entries(obj)?.map(fn));
export const mapToArrayObject = (o) => objectWalk(o, ([k, m]) => [k, Array.from(m?.values())]);
//export const mapToArrayObject = (o) => objectWalk(o, ([k, m]) => [k, Object.fromEntries(m)]);