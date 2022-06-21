function cleanUp(effectFn) {
    // 清空依赖的函数
    for (let i = 0; i < effectFn.length; i++) {
        // deps是依赖集合
        const deps = effectFn.deps[i];
        deps.delete(effectFn);
    }
    // 最后需要设置 effectFn.deps 数组
    effectFn.deps.length = 0
}
// 存储当前副作用函数
let activeEffect;
// effect 栈
const effectStack = [];
// 注册副作用函数
function effect(fn, options = {}) {
    const effectFn = () => {
        cleanUp(effectFn);
        activeEffect = fn;
        // 在调用副作用函数之前, 将当前副作用函数压入栈中
        effectStack.push(effectFn);
        const res = fn();
        // 在调用副作用函数之后, 将其从副作用栈中弹出, 并把 activeEffect 还原为之前的值
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];
        return res;
    };
    // 将options挂载到 effectFn 上
    effectFn.options = options;
    // 设置副作用【依赖集合】(也就是 keys)
    effectFn.deps = [];
    if (!options.lazy) {
        effectFn(); // 执行副作用函数
    }
    return effectFn();
}
const bucket = new WeakMap();
const data = { text: 'hello world' };
function track(target, key) {
    if (!activeEffect) return;
    // 根据 target 从桶中取出 depsMap, 他也是一个 Map 类型, key ---- effects
    let depsMap = bucket.get(target);
    // 如果不存在 depsMap，则新建一个 Map 与 target 关联
    if (!depsMap) {
        bucket.set(target, (depsMap = new Map()));
    }
    // 再根据 key 从 depsMap 中取得 deps ，它是一个 set 类型
    let deps = depsMap.get(key);
    if (!deps) {
        depsMap.set(key, (deps = new Set()));
    }
    deps.add(activeEffect);
    // 将其添加到副作用的依赖中
    activeEffect.deps.push(deps);
}
function trigger(target, key, type) {
    const depsMap = bucket.get(target);
    if (!depsMap) return;
    const effects = depsMap.get(key);

    // 因为在副作用函数执行的时候, 会调用 cleanUp 进行清楚, 但是副作用函数的执行会导致其被重新收集到集合中
    // 因此创建一个新集合来解决这个问题
    const effectsToRun = new Set();
    effects && effects.forEach(effectFn => {
        // 如果 trigger 触发的 【副作用函数】与当前正在执行的【副院长函数】相同,则不触发执行
        if (effectFn !== activeEffect) {
            effectsToRun.add(effectFn);
        }
    });
   if (type === 'ADD' || type === 'DELETE') {
        // 取出与 ITERATE_KEY 相关的 【副作用函数】
        const iterateEffects = depsMap.get(ITERATE_KEY);
        // 也将其加入 effectsToRun 里
        iterateEffects && iterateEffects.forEach(effectFn => {
            // 如果 trigger 触发的 【副作用函数】与当前正在执行的【副院长函数】相同,则不触发执行
            if (effectFn !== activeEffect) {
                effectsToRun.add(effectFn);
            }
        });
   }

    effectsToRun && effectsToRun.forEach(effectFn => {
        if (effectFn.options.scheduler) {
            // 调度执行
            effectFn.options.scheduler(effectFn);
        } else {
            effectFn();
        }
    });
}
const obj = new Proxy(data, {
    get(target, key, receiver) {
        track(target, key)
        return Reflect.get(target, key, receiver);
    },
    set(target, key, newVal, receiver) {
        const oldVal = target[key]; // 获取旧的值
        // 如果属性不存在, 说明是新添加属性
        const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD';
        const res = Reflect.set(target, key, newVal, receiver);
        if (oldVal !== newVal) {
            // 新旧值不相等的时候才触发响应
            trigger(target, key, type);
        }
        return true;
    }
});