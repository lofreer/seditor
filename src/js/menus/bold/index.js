/*
    bold-menu
*/
import Vm from '../../util/vm'

class Bold {
    constructor(editor) {
        this.editor = editor
        this.elem = Vm('div', {class: 'eui-menu-item'}, [
            Vm('i', {class: 'eicon eicon-bold'})
        ])
        this.type = 'click'

        // 当前是否 active 状态
        this._active = false
    }

    // 点击事件
    onClick(e) {
        // 点击菜单将触发这里        
        const editor = this.editor
        const isSeleEmpty = editor.selection.isSelectionEmpty()

        if (isSeleEmpty) {
            // 选区是空的，插入并选中一个“空白”
            editor.selection.createEmptyRange()
        }

        // 执行 bold 命令
        editor.cmd.do('bold')

        if (isSeleEmpty) {
            // 需要将选取折叠起来
            editor.selection.collapseRange()
            editor.selection.restoreSelection()
        }
    }

    // 试图改变 active 状态
    tryChangeActive(e) {
        const editor = this.editor
        const elem = this.elem
        if (editor.cmd.queryCommandState('bold')) {
            this._active = true
            elem.classList.add('eui-active')
        } else {
            this._active = false
            elem.classList.remove('eui-active')
        }
    }
}

export default Bold