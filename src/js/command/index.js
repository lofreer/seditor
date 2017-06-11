import { UA } from '../util'

class Command {
    constructor(editor) {
        this.editor = editor
    }

    do(name, value) {
        const editor = this.editor
        // 如果无选区， 忽略
        if (!editor.selection.getRange()) return
        // 恢复选区
        editor.selection.restoreSelection()
        // 执行
        const _name = `_${name}`
        if (this[_name]) {
            // 自定义事件
            this[_name](value)
        } else {
            // 默认 command
            this._execCommand(name, value)
        }
        // 修改菜单状态
        editor.menus.changeActive()
        // 恢复选区保证光标在原来的位置闪烁 
        editor.selection.saveRange()
        editor.selection.restoreSelection() 
    }
    // 自定义 insertHTML 事件
    _insertHTML(html) {
        const editor = this.editor
        const range = editor.selection.getRange()

        // 保证传入的参数是 html 代码
        const test = /^<.+>$/.test(html)
        if (!test && !UA.isWebkit()) {
            // webkit 可以插入非 html 格式的文字
            throw new Error('执行 insertHTML 命令时传入的参数必须是 html 格式')
        }
        if (this.queryCommandSupported('insertHTML')) {
            // W3C
            this._execCommand('insertHTML', html)
        } else if (range.insertNode) {
            // IE
            range.deleteContents()
            range.insertNode($(html)[0])
        } else if (range.pasteHTML) {
            // IE <= 10
            range.pasteHTML(html)
        } 
    }
    // 插入 elem
    _insertElem(elem) {
        const editor = this.editor
        const range = editor.selection.getRange()

        if (range.insertNode) {
            range.deleteContents()
            range.insertNode(elem[0])
        }
    }
    // 封装 execCommand
    _execCommand(name, value) {
        document.execCommand(name, false, value)
    }
    // 封装 document.queryCommandValue
    queryCommandValue(name) {
        return document.queryCommandValue(name)
    }

    // 封装 document.queryCommandState
    queryCommandState(name) {
        return document.queryCommandState(name)
    }

    // 封装 document.queryCommandSupported
    queryCommandSupported(name) {
        return document.queryCommandSupported(name)
    }
}

export default Command