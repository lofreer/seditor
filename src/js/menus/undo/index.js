/*
    undo-menu
*/
import Vm from '../../util/vm'


class Undo {
    constructor(editor) {
        this.editor = editor
        this.elem = Vm('div', {class: 'eui-menu-item'}, [
            Vm('i', {class: 'eicon eicon-undo'})
        ])
        this.type = 'click'

        // 当前是否 active 状态
        this._active = false
    }

    // 点击事件
    onClick(e) {
        // 点击菜单将触发这里

        const editor = this.editor

        // 执行 undo 命令
        editor.cmd.do('undo')
    }
}

export default Undo