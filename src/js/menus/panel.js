/*
    panel
*/

import Vm from '../util/vm.js'
const emptyFn = () => {}

// 记录已经显示 panel 的菜单
let _isCreatedPanelMenus = []


class Panel {
    constructor(menu, opt) {
        this.menu = menu
        this.opt = opt
    }

    // 显示（插入DOM）
    show() {
        const menu = this.menu
        // 该菜单已经创建了 panel 不能再创建
        if (_isCreatedPanelMenus.indexOf(menu) >= 0) return

        const editor = menu.editor
        const textContainerElem = editor.textContainerElem
        const opt = this.opt

        // panel 的容器
        const width = opt.width || 300 // 默认 300px
        const container = Vm('div', {class: 'eui-panel-wrap', style: `width: ${width}px; margin-left: ${(0-width)/2}px`})

        // 添加关闭按钮
        const closeBtn = Vm('span', {class: 'eui-panel-close'}, [
            Vm('i', {class: 'eicon eicon-close'})
        ])
        container.appendChild(closeBtn)
        closeBtn.addEventListener('click', () => {
            this.hide()
        })

        // 准备 tabs 容器
        // 设置高度
        const height = opt.height
        const tabTitleContainer = Vm('ul', {class: 'eui-panel-tab-title', style: height ? `height: ${height}px; overflow-y: scroll;` : ''})
        const tabContentContainer = Vm('div', {class: 'eui-panel-tab-content'})
        container.appendChild(tabTitleContainer)
        container.appendChild(tabContentContainer)
        
        // tabs
        const tabs = opt.tabs || []
        const tabTitleArr = []
        const tabContentArr = []
        tabs.forEach((tab, tabIndex) => {
            if (!tab) {
                return
            }
            const title = tab.title || ''
            const tpl = tab.tpl || ''

            // 添加到 DOM
            const tabItem = Vm('li', {class: 'eui-tab-item'}, [title])
            tabTitleContainer.appendChild(tabItem)
            const content = tpl
            tabContentContainer.appendChild(content)

            // 记录到内存
            tabItem._index = tabIndex
            tabTitleArr.push(tabItem)
            tabContentArr.push(content)

            // 设置 active 项
            if (tabIndex === 0) {
                tabItem._active = true
                tabItem.classList.add('eui-tab-active')
            } else {
                content.style.display = 'none'
            }

            // 绑定 tab 的事件
            tabItem.addEventListener('click', e => {
                if (tabItem._active) {
                    return
                }
                // 隐藏所有的 tab
                tabTitleArr.forEach(tabItem => {
                    tabItem._active = false
                    tabItem.classList.remove('eui-tab-active')
                })
                tabContentArr.forEach(content => {
                    content.style.display = 'none'
                })

                // 显示当前的 tab
                tabItem._active = true
                tabItem.classList.add('eui-tab-active')
                content.style.display = 'block'
            })
        })

        // 绑定关闭事件
        container.addEventListener('click', e => {
            // 点击时阻止冒泡
            e.stopPropagation()
        })
        textContainerElem.addEventListener('click', e => {
            this.hide()
        })

        // 添加到 DOM
        textContainerElem.appendChild(container)

        // 绑定 opt 的事件，只有添加到 DOM 之后才能绑定成功
        tabs.forEach((tab, index) => {
            if (!tab) {
                return
            }
            const events = tab.events || []
            events.forEach(event => {
                const selector = event.selector
                const type = event.type
                const fn = event.fn || emptyFn
                const content = tabContentArr[index]
                content.querySelector(selector).addEventListener(type, (e) => {
                    e.stopPropagation()
                    const needToHide = fn(e)
                    // 执行完事件之后，是否要关闭 panel
                    if (needToHide) {
                        this.hide()
                    }
                })
            })
        })

        // focus 第一个 elem
        let inputs = container.querySelectorAll('input[type=text],textarea')
        if (inputs.length) {
            inputs[0].focus()
        }

        // 添加到属性
        this.container = container

        // 隐藏其他 panel
        this._hideOtherPanels()
        // 记录该 menu 已经创建了 panel
        _isCreatedPanelMenus.push(menu)
    }

    // 隐藏（移除DOM）
    hide() {
        const menu = this.menu
        const container = this.container
        if (container) {
            container.remove()
        }

        // 将该 menu 记录中移除
        _isCreatedPanelMenus = _isCreatedPanelMenus.filter(item => {
            if (item === menu) {
                return false
            } else {
                return true
            }
        })
    }

    // 一个 panel 展示时，隐藏其他 panel
    _hideOtherPanels() {
        if (!_isCreatedPanelMenus.length) {
            return
        }
        _isCreatedPanelMenus.forEach(menu => {
            const panel = menu.panel || {}
            if (panel.hide) {
                panel.hide()
            }
        })
    }
}

export default Panel