/*
    menu - list
*/
import Vm from '../../util/vm'
import DropList from '../droplist.js'

// 原型
class List {
    constructor(editor) {
        this.editor = editor
        this.elem = Vm('div', {class: 'eui-menu-item'}, [
            Vm('i', {class: 'eicon eicon-insertunorderedlist'})
        ]),
        this.type = 'droplist'

        // 当前是否 active 状态
        this._active = false

        // 初始化 droplist
        this.droplist = new DropList(this, {
            width: 120,
            title: Vm('p', {}, ['设置列表']),
            type: 'list', // droplist 以列表形式展示
            list: [
                { elem: Vm('span', {}, [Vm('i', {class: 'eicon eicon-insertorderedlist'}), ' 有序列表']), value: 'insertOrderedList' },
                { elem: Vm('span', {}, [Vm('i', {class: 'eicon eicon-insertunorderedlist'}), ' 无序列表']), value: 'insertUnorderedList' }
            ],
            onClick: (value) => {
                // 注意 this 是指向当前的 List 对象
                this._command(value)
            }
        })
    }

    // 执行命令
    _command(value) {
        const editor = this.editor
        const textElem = editor.textElem
        editor.selection.restoreSelection()
        if (editor.cmd.queryCommandState(value)) {
            return
        }
        editor.cmd.do(value)

        // 验证列表是否被包裹在 <p> 之内
        let selectionElem = editor.selection.getSelectionContainerElem()
        if (selectionElem.nodeName === 'LI') {
            selectionElem = selectionElem.parentNode
        }
        if (/^ol|ul$/i.test(selectionElem.nodeName) === false) {
            return
        }
        if (selectionElem === textElem) {
            // 证明是顶级标签，没有被 <p> 包裹
            return
        }
        const parent = selectionElem.parentNode
        // parent 是顶级标签，不能删除
        if (parent === textElem) return

        parent.parentNode.appendChild(selectionElem)
        parent.remove()
    }

    // 试图改变 active 状态
    tryChangeActive(e) {
        const editor = this.editor
        const elem = this.elem
        if (editor.cmd.queryCommandState('insertUnOrderedList') || editor.cmd.queryCommandState('insertOrderedList')) {
            this._active = true
            elem.classList.add('eui-active')
        } else {
            this._active = false
            elem.classList.remove('eui-active')
        }
    }
}

export default List