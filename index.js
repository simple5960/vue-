const arr = [1,2,3];

const dfs = (arr, used, res, depth, path, len) => {
    if (depth === len) {
        res.push([].concat(...path));
        return;
    }
    for (let i = 0; i < len; i++) {
        if (!used[i]) {
            path.push(arr[i]);
            used[i] = true;
            dfs(arr, used, res, depth + 1, path, len);
            used[i] = false;
            path.pop();
        }
    }
};
const permutation = (arr) => {
    const res = [];
    const path = [];
    const len = arr.length;
    if (len <= 0) {
        return res;
    }
    let used = new Array(len).fill(false);
    dfs(arr, used, res, 0, path, len);
    return res;
};
console.log(permutation(arr));



function myInterval(fn, delay) {
    let timer = true;
    function interval () {
        if (timer) {
            fn();
            setTimeout(() => {
                interval
            }, delay);
        }
    }
    setTimeout(interval, delay);
    return timer;
}

function debounce(fn, delay) {
    let timer = null;
    return function() {
        if (timer) {
            timer = null;
        } else {
            timer = setTimeout(() => {
                fn.apply(this, arguments)
            }, delay);
        }
    }
}