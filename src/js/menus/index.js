/*
    菜单集合
*/
import Vm from '../util/vm'
import { objForEach } from '../util'
import MenuConstructors from './menu-list.js'

// 修改原型
class Menus {
    constructor(editor) {
        this.editor = editor
        this.menus = {}
        this.toolbar = {}
    }

    // 初始化菜单
    init() {
        const editor = this.editor
        const config = editor.config || {}
        const configMenus = config.menus || []  // 获取配置中的菜单

        // 根据配置信息，创建菜单
        configMenus.forEach(menuKey => {
            let MenuConstructor
            if(Array.isArray(menuKey)) {
                let group = []
                menuKey.forEach(item => {
                    MenuConstructor = MenuConstructors[item]
                    if (MenuConstructor && typeof MenuConstructor === 'function') {
                        // 创建单个菜单
                        this.menus[item] = new MenuConstructor(editor)
                        group.push(this.menus[item])
                    }
                })
                this.toolbar[menuKey[0]] = group
            } else {
                MenuConstructor = MenuConstructors[menuKey]
                if (MenuConstructor && typeof MenuConstructor === 'function') {
                    // 创建单个菜单
                    this.menus[menuKey] = new MenuConstructor(editor)
                }
            }
            
        })

        // 添加到菜单栏
        this._addToToolbar()

        // 绑定事件
        this._bindEvent()
    }

    // 添加到菜单栏
    _addToToolbar() {
        const editor = this.editor
        const toolbarElem = editor.toolbarElem
        const toolbar = this.toolbar
        objForEach(toolbar, (key, tool) => {
            if (Array.isArray(tool)) {
                let group = Vm('div', {class: 'eui-menu-group'})
                tool.forEach(item => {
                    group.appendChild(item.elem)
                })
                toolbarElem.appendChild(group)
            } else {
                if (tool.elem) {
                    toolbarElem.appendChild(tool.elem)
                }
            }            
        })
    }

    // 绑定菜单 click mouseenter 事件
    _bindEvent() {
        const menus = this.menus
        const editor = this.editor
        objForEach(menus, (key, menu) => {
            const type = menu.type
            if (!type) return

            const elem = menu.elem
            const droplist = menu.droplist
            const panel = menu.panel

            // 点击类型，例如 bold
            if (type === 'click' && menu.onClick) {
                elem.addEventListener('click', e => {
                    if (editor.selection.getRange() == null) return
                    menu.onClick(e)
                })
            }

            // 下拉框，例如 head
            if (type === 'droplist' && droplist) {
                elem.addEventListener('mouseenter', e => {
                    if (editor.selection.getRange() == null) {
                        return
                    }
                    // 显示
                    droplist.showTimeoutId = setTimeout(() => {
                        droplist.show()
                    }, 200)
                })
                elem.addEventListener('mouseleave', e => {
                    // 隐藏
                    droplist.hideTimeoutId = setTimeout(() => {
                        droplist.hide()
                    }, 0)
                })
            }

            // 弹框类型，例如 link
            if (type === 'panel' && menu.onClick) {
                elem.addEventListener('click', e => {
                    if (editor.selection.getRange() == null) {
                        return
                    }
                    // 在自定义事件中显示 panel
                    menu.onClick(e)
                })
            }
        })
    }

    // 尝试修改菜单状态
    changeActive() {
        const menus = this.menus
        objForEach(menus, (key, menu) => {
            if (menu.tryChangeActive) {
                setTimeout(() => {
                    menu.tryChangeActive()
                }, 100)
            }
        })
    }
}

export default Menus