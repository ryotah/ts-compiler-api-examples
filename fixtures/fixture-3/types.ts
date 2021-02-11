import { actionCreator, combineMutation, defineModule, mutation } from './lib';

export const Decrement = actionCreator<number>('count/decrement');
