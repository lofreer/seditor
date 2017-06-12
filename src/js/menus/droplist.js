/*
    droplist
*/
import Vm from '../util/vm'

const _emptyFn = () => {}


class DropList {
    constructor(menu, opt) {
        // droplist 所依附的菜单
        this.menu = menu
        this.opt = opt
        // 容器
        const container = Vm('div', {class: 'eui-droplist'})

        // 标题
        const title = opt.title
        if (title) {
            title.classList.add('eui-drop-title')
            container.appendChild(title)
        }

        const list = opt.list || []
        const type = opt.type || 'list'  // 'list' 列表形式（如“标题”菜单） / 'inline-block' 块状形式（如“颜色”菜单）
        const onClick = opt.onClick || _emptyFn

        // 加入 DOM 并绑定事件
        const ul = Vm('ul', {class: (type === 'list' ? 'eui-drop-list' : 'eui-drop-block')})
        container.appendChild(ul)
        list.forEach(item => {
            const elem = item.elem
            const value = item.value
            const li = Vm('li', {class: 'eui-drop-item'})
            if (elem) {
                li.appendChild(elem)
                ul.appendChild(li)
                elem.addEventListener('click', e => {
                    onClick(value)

                    // 隐藏
                    this.hideTimeoutId = setTimeout(() => {
                        this.hide()
                    }, 0)
                })
            }
        })

        // 绑定隐藏事件
        container.addEventListener('mouseleave', e => {
            this.hideTimeoutId = setTimeout(() => {
                this.hide()
            }, 0)
        })

        // 记录属性
        this.container = container

        // 基本属性
        this._rendered = false
        this._show = false
    }

    // 显示（插入DOM）
    show() {
        if (this.hideTimeoutId) {
            // 清除之前的定时隐藏
            clearTimeout(this.hideTimeoutId)
        }

        const menu = this.menu
        const menuELem = menu.elem
        const container = this.container
        if (this._show) {
            return
        }
        if (this._rendered) {
            // 显示
            container.style.display = 'block'
        } else {
            // 加入 DOM 之前先定位位置
            const menuHeight = menuELem.getBoundingClientRect().height || 0
            const width = this.opt.width || 100  // 默认为 100
            container.style.cssText = `margin-top: ${menuHeight}px; width: ${width}px`

            // 加入到 DOM
            menuELem.appendChild(container)
            this._rendered = true
        }

        // 修改属性
        this._show = true
    }

    // 隐藏（移除DOM）
    hide() {
        if (this.showTimeoutId) {
            // 清除之前的定时显示
            clearTimeout(this.showTimeoutId)
        }

        const container = this.container
        if (!this._show) {
            return
        }
        // 隐藏并需改属性
        container.style.display = 'none'
        this._show = false
    }
}

export default DropList