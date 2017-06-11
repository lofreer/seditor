/*
    menu - quote
*/
import Vm from '../../util/vm'



class Quote {
    constructor(editor) {
        this.editor = editor
        this.elem = Vm('div', {class: 'eui-menu-item'}, [
            Vm('i', {class: 'eicon eicon-quotes'})
        ])
        this.type = 'click'

        // 当前是否 active 状态
        this._active = false
    }

    onClick(e) {
        const editor = this.editor
        editor.cmd.do('formatBlock', '<BLOCKQUOTE>')
    }

    tryChangeActive(e) {
        const editor = this.editor
        const elem = this.elem
        const reg = /^BLOCKQUOTE$/i
        const cmdValue = editor.cmd.queryCommandValue('formatBlock')
        if (reg.test(cmdValue)) {
            this._active = true
            elem.classList.add('eui-active')
        } else {
            this._active = false
            elem.classList.remove('eui-active')
        }
    }
}

export default Quote