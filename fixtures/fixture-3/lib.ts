export declare function defineModule<S, RS>(): (m: unknown) => void;
export declare function actionCreator<T>(type: string): void;
export declare function combineMutation(...args: any[]): void;
export declare function mutation(
  action: any,
  mutation: (...arr: any[]) => void
): void;
