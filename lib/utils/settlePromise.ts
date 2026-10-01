// 서버 컴포넌트가 넘긴 Promise를 안전하게 소비한다. 실패하면 undefined.
// React Flight가 역직렬화한 Promise(ReactPromise)는 then()이 새 Promise를 반환하지 않아
// .catch()/.then() 체이닝이 깨진다(undefined.then → TypeError). Promise.resolve()로 표준 Promise로 감싼다.
export function settlePromise<T>(promise: PromiseLike<T>): Promise<T | undefined> {
  return Promise.resolve(promise).then(
    (value) => value,
    () => undefined
  );
}
