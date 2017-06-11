/*
    menu - justify
*/
import Vm from '../../util/vm'
import DropList from '../droplist'


class Justify {
    constructor(editor) {
        this.editor = editor
        this.elem = Vm('div', {class: 'eui-menu-item'}, [
            Vm('i', {class: 'eicon eicon-justifyleft'})
        ])
        this.type = 'droplist'

        // 当前是否 active 状态
        this._active = false

        // 初始化 droplist
        this.droplist = new DropList(this, {
            width: 100,
            $title: Vm('p', {}, ['对齐方式']),
            type: 'list', // droplist 以列表形式展示
            list: [
                { $elem: Vm('span', {}, [[Vm('i', {class: 'eicon eicon-justifyleft'}), '靠左']]), value: 'justifyLeft' },
                { $elem: Vm('span', {}, [[Vm('i', {class: 'eicon eicon-justifycenter'}), '居中']]), value: 'justifyCenter' },
                { $elem: Vm('span', {}, [[Vm('i', {class: 'eicon eicon-justifyright'}), '靠右']]), value: 'justifyRight' }
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
        editor.cmd.do(value)
    }
}

export default Justify