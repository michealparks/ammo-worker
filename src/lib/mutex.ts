const locked = 1;
const unlocked = 0;

class Mutex {
  /**
   * Instantiate Mutex.
   */
  constructor(type: 'uint16' | 'float32', size: number) {
    this._sab = opt_sab || new SharedArrayBuffer(size);
    this._mu = new Int32Array(this._sab);
  }

  /**
   * Instantiate a Mutex connected to the given one.
   * @param {Mutex} mu the other Mutex.
   */
  static connect(mu) {
    return new Mutex(mu._sab);
  }

  lock() {
    for(;;) {
      if (Atomics.compareExchange(this._mu, 0, unlocked, locked) == unlocked) {
        return;
      }
      Atomics.wait(this._mu, 0, locked);
    }
  }

  unlock() {
    if (Atomics.compareExchange(this._mu, 0, locked, unlocked) != locked) {
      throw new Error("Mutex is in inconsistent state: unlock on unlocked Mutex.");
    }
    Atomics.notify(this._mu, 0, 1);
  }
}

class WaitGroup {
  constructor(initial, opt_sab) {
    this._sab = opt_sab || new SharedArrayBuffer(4);
    this._wg = new Int32Array(this._sab);
    this.add(initial);
  }

  static connect(wg) {
    return new WaitGroup(0, wg._sab);
  }

  add(n) {
    let current = n + Atomics.add(this._wg, 0, n);
    if (current < 0) {
      throw new Error('WaitGroup is in inconsistent state: negative count.');
    }
    if (current > 0){
      return;
    }
    Atomics.notify(this._wg, 0);
  }

  done() {
    this.add(-1);
  }

  wait() {
    for (;;) {
      let count = Atomics.load(this._wg, 0);
      if (count == 0){
        return;
      }
      if (Atomics.wait(this._wg, 0, count) == 'ok') {
        return;
      }
    }
  }
}