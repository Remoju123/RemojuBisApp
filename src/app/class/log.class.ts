// ====================
// ログクラス
// ====================

export function getNowStr() {
  return new Date().toLocaleTimeString();
}

// @Catch
export function Catch(isAutoCatch?: boolean) {
  return function(
    target:any, // クラス
    name:any, // メソッド名
    descriptor:any // ディスクリプタ
  ) {
    // クラス名.メソッド名
    const location = target.constructor.name + "." + name;
    // 加工前のメソッド
    const original = descriptor.value;

    if (typeof original === "function") {
      // 加工したメソッドを保持
      descriptor.value = function(...args: any[]) {
        // ------------前処理---------------
        try {
          // ログ
          const nowString = new Date().toLocaleTimeString();
          console.log("%s call:%s(%s)", nowString, location, args.join(","));
          // --------------------------------

          // オリジナルのメソッド
          const result = original.apply(this, args);

          // ------------後処理---------------
          if (typeof isAutoCatch === undefined) {
            // 戻り値のPromise判定
            isAutoCatch =
              result &&
              typeof result.then === "function" &&
              typeof result.catch === "function";
          }
          // 戻り値がpromiseの時はcatchメソッドで例外検出
          if (isAutoCatch) {
            result.catch((err: { toString: () => string | undefined; }) => {
              throw new Error(err.toString());
            });
          }
          // ログ
          console.log(
            "%s return:%s %s %s ",
            nowString,
            location,
            isAutoCatch ? "isPromise" : "",
            result || ""
          );
          // --------------------------------

          return result;
        } catch (error) {
          // ------------例外処理---------------
          //console.log(`エラー ${error.message}`);
        }
        // --------------------------------
      };
    }
    return descriptor;
  };
}

// Promise用エラー処理
export function promiseError() {
  console.error("promiseエラー");
  // throw new Error(error.toString);
}
