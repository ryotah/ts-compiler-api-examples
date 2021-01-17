function defineModule() {
  return (m: unknown) => m;
}
function combineMutation(...arr: string[]) {
  return arr.reduce((acc: { [key: string]: unknown }, i) => (acc[i] = {}), {});
}
export const Increment = 'increment';
export const module = defineModule()({
  mutations: combineMutation(Increment),
});

// const mutations = {
//   increment() {},
// };
// export const module = {
//   mutations,
// };
