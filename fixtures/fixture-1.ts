function foo(m: unknown) {
  return m;
}
export const module = foo({
  bar: '',
});

// const bar = '';
// export const module = {
//   bar,
// };
