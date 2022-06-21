## 初识渲染器
> 渲染器的作用就是把 【虚拟DOM】 转换为 【真实DOM】

```js
const container = document.querySelector('#app');
const vnode = {
    tag: 'div',
    props: {
        onClick: () => alert('hello')
    },
    children: 'click me'
}
function renderer(vnode, container) {
    const el = document.createElement(vnode.tag);
    for(const key in vnode.props) {
        if (/^on/.test(key)) {
            el.addEventListener(key.substring(2).toLowerCase(), vnode.props[key]);
        }
    }
    if (typeof vnode.children === 'string') {
        el.appendChild(document.createTextNode(vnode.children));
    } else if (Array.isArray(vnode.children)) {
        vnode.children.forEach(child => renderer(child, el));
    }
    container.appendChild(el);
}
renderer(vnode, container)
```
## 组件的本质
> 一组 virtual-dom 的封装, 比如 renderer 函数可以改成如下

```js
const vnode = {
    tag: 'div',
    props: {
        onClick: () => alert('hello')
    },
    children: 'click me'
}
function mountElement(vnode, container) {
    const el = document.createElement(vnode.tag);
    for(const key in vnode.props) {
        if (/^on/.test(key)) {
            el.addEventListener(key.substring(2).toLowerCase(), vnode.props[key]);
        }
    }
    if (typeof vnode.children === 'string') {
        el.appendChild(document.createTextNode(vnode.children));
    } else if (Array.isArray(vnode.children)) {
        vnode.children.forEach(child => renderer(child, el));
    }
    container.appendChild(el);
}
function mountComponent(vnode, container) {
    // 组件可以是一个函数，也可以是一组 vnode 对象
    let subTree;
    if (vnode.tag.render) {
        // 此时的组件是对象
        subTree = vnode.tag.render();
    } else {
        // 此时组件是函数
        subTree = vnode.tag();
    }
    renderer(subTree, container);
}
function renderer(vnode, container) {
    const type = typeof vnode.tag;
    if (type === 'string') {
        mountElement(vnode, container);
    } else if (type === 'object') {
        mountComponent(vnode, container);
    }
}
```