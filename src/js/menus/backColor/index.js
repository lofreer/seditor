/*
    menu - forecolor
*/
import Vm from '../../util/vm'
import DropList from '../droplist.js'

const colors = ['#000000', '#eeece0', '#1c487f', '#4d80bf', '#c24f4a', '#8baa4a', '#7b5ba1', '#46acc8', '#f9963b', '#ffffff']


class BackColor {
    constructor(editor) {
        this.editor = editor
        this.elem = Vm('div', {class: 'eui-menu-item'}, [
            Vm('i', {class: 'eicon eicon-backcolor'})
        ])
        this.type = 'droplist'

        // 当前是否 active 状态
        this._active = false

        // 初始化 droplist
        this.droplist = new DropList(this, {
            width: 120,
            title: Vm('p', {}, ['背景色']),
            type: 'inline-block', // droplist 内容以 block 形式展示
            list: colors.map(color => {
                return {
                    elem: Vm('i', {class: 'eicon eicon-backcolor', style: `color:${color}`}),
                    value: color
                }
            }),
            onClick: (value) => {
                // 注意 this 是指向当前的 ForeColor 对象
                this._command(value)
            }
        })
    }

    // 执行命令
    _command(value) {
        const editor = this.editor
        editor.cmd.do('backColor', value)
    }
}

export default BackColor