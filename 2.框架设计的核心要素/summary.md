## 框架是如何做tree-shaking的

1. 设置预定义的常量 __DEV__
```
使得在生产环境中使用框架的时候不包含打印警告的信息或者 es-lint 检查之类的包
```
2. 尽量写 pure-function, 少些副作用函数
> 副作用函数就是 【调用此函数的时候,会对外部产生影响】， 比如修改了外部的变量，或者读取变量也不行，因为可能会触发 getter

## 框架应该怎样输出构建产物
> 为了能够像以下那样引用Vue，需要输入 IIFE(立即执行函数) 格式的文件
```html
<body>
    <script src="./vue.js"></script>
    <script>
        const { createApp } = Vue;
    </script>
</body>
```
## 使用特性开关减少构建产物