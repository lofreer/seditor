/*
    menu - header
*/
import Vm from '../../util/vm'
import DropList from '../droplist'

class Head {
    constructor(editor) {
        this.editor = editor
        this.elem = Vm('div', {class: 'eui-menu-item'}, [
            Vm('i', {class: 'eicon eicon-heading'})
        ])
        this.type = 'droplist'

        // 当前是否 active 状态
        this._active = false

        // 初始化 droplist
        this.droplist = new DropList(this, {
            width: 100,
            $title: Vm('p', {}, ['设置标题']),
            type: 'list', // droplist 以列表形式展示
            list: [
                { $elem: Vm('h1', {}, ['H1']), value: '<h1>' },
                { $elem: Vm('h2', {}, ['H2']), value: '<h2>' },
                { $elem: Vm('h3', {}, ['H3']), value: '<h3>' },
                { $elem: Vm('h4', {}, ['H4']), value: '<h4>' },
                { $elem: Vm('h5', {}, ['H5']), value: '<h5>' },
                { $elem: Vm('p', {}, ['正文']), value: '<p>' }
            ],
            onClick: (value) => {
                // 注意 this 是指向当前的 Head 对象
                this._command(value)
            }
        })
    }

    // 执行命令
    _command(value) {
        const editor = this.editor
        editor.cmd.do('formatBlock', value)
    }

    // 试图改变 active 状态
    tryChangeActive(e) {
        const editor = this.editor
        const elem = this.elem
        const reg = /^h/i
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

export default Head