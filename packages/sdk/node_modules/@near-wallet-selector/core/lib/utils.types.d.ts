export declare type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export declare type Modify<T, R> = Omit<T, keyof R> & R;
