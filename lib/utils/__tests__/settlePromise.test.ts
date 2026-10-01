import { settlePromise } from "../settlePromise";

// React Flight의 ReactPromise 동작 재현: Promise.prototype을 상속하지만 then()이 아무것도 반환하지 않는다
function makeFlightPromise<T>(status: "fulfilled" | "rejected", value: T) {
  function FlightPromise(this: { status: string; value: T }) {
    this.status = status;
    this.value = value;
  }
  FlightPromise.prototype = Object.create(Promise.prototype);
  FlightPromise.prototype.then = function (
    this: { status: string; value: T },
    resolve?: (v: T) => void,
    reject?: (e: unknown) => void
  ) {
    if (this.status === "fulfilled") resolve?.(this.value);
    else reject?.(this.value);
  };
  return new (FlightPromise as unknown as new () => PromiseLike<T>)();
}

describe("settlePromise", () => {
  it("Flight Promise에 .catch() 체이닝하면 TypeError가 나는 문제를 재현한다", () => {
    const p = makeFlightPromise("fulfilled", 1) as unknown as Promise<number>;
    expect(() => p.catch(() => undefined).then((v) => v)).toThrow(TypeError);
  });

  it("Flight Promise의 이행 값을 반환한다", async () => {
    await expect(settlePromise(makeFlightPromise("fulfilled", { ok: true }))).resolves.toEqual({ ok: true });
  });

  it("Flight Promise가 거부되면 undefined를 반환한다", async () => {
    await expect(settlePromise(makeFlightPromise("rejected", new Error("x")))).resolves.toBeUndefined();
  });

  it("표준 Promise도 동일하게 처리한다", async () => {
    await expect(settlePromise(Promise.resolve(3))).resolves.toBe(3);
    await expect(settlePromise(Promise.reject(new Error("x")))).resolves.toBeUndefined();
  });
});
