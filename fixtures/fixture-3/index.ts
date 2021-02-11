import { Decrement } from '../../dist/fixture-3';
import { actionCreator, combineMutation, defineModule, mutation } from './lib';

export const Increment = actionCreator<number>('count/increment');

export interface State {
  count: number;
}

const initialState = (): State => {
  return {
    count: 0,
  };
};

export const module = defineModule<State, State>()({
  state: initialState,
  mutations: combineMutation(
    mutation(Increment, function (state, action) {
      state.count += action.payload;
    }),
    mutation(Decrement, function (state, action) {
      state.count -= action.payload;
    })
  ),
});

// const mutations = {
//   increment(state, payload) {
//     state.count += payload;
//   },
//   increment(state, payload) {
//     state.count -= payload;
//   },
// };
// export const module = {
//   namespaced: true,
//   state: initialState,
//   mutations,
//   actions,
// };
