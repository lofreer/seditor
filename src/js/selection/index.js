import { UA } from '../util'
import Vm from '../util/vm'

class Selection {
    constructor(editor) {
        this.editor = editor
        this._currentRange = null
    }
    // 获取range对象
    getRange() {
        return this._currentRange
    }
    // 保存选区
    saveRange(_range) {
        if (_range) {
            // 保存已有选区
            this._currentRange = _range
            return
        }

        // 获取当前的选区
        const selection = document.getSelection()
        if (selection.rangeCount === 0) return
        const range = selection.getRangeAt(0)

        // 判断选区内容是否在编辑内容之内
        const containerElem = this.getSelectionContainerElem(range)
        if (!containerElem) return
        const editor = this.editor
        const textElem = editor.textElem
        if (textElem.contains(containerElem)) {
            // 是编辑内容之内的
            this._currentRange = range
        }
    }

    // 折叠选区
    collapseRange(toStart) {
        if (toStart == null) {
            // 默认为 false
            toStart = false
        }
        const range = this._currentRange
        if (range) {
            range.collapse(toStart)
        }
    }

    // 选中区域的文字
    getSelectionText() {
        const range = this._currentRange
        if (range) {
            return this._currentRange.toString()
        } else {
            return ''
        }
    }

    // 选区的 Elem
    getSelectionContainerElem(range) {
        range = range || this._currentRange
        let elem
        if (range) {
            elem = range.commonAncestorContainer
            return elem.nodeType === 1 ? elem : elem.parentNode
        }
    }

    getSelectionStartElem(_range) {
        _range = _range || this._currentRange
        let elem
        if (_range) {
            elem = _range.startContainer
            return elem.nodeType === 1 ? elem : elem.parentNode
        }
    }

    getSelectionEndElem(_range) {
        _range = _range || this._currentRange
        let elem
        if (_range) {
            elem = _range.endContainer
            return elem.nodeType === 1 ? elem : elem.parentNode
        }
    }

    // 选区是否为空
    isSelectionEmpty() {
        const range = this._currentRange
        if (range && range.startContainer) {
            if (range.startContainer === range.endContainer) {
                if (range.startOffset === range.endOffset) {
                    return true
                }
            }
        }
        return false
    }

    // 恢复选区
    restoreSelection() {
        const selection = document.getSelection()
        selection.removeAllRanges()
        selection.addRange(this._currentRange)
    }

    // 创建一个空白（即 &#8203 字符）选区
    createEmptyRange() {
        const editor = this.editor
        const range = this.getRange()
        let elem

        // 当前无 range
        if (!range) return
        // 当前选区必须没有内容才可以
        if (!this.isSelectionEmpty()) return

        // 目前只支持 webkit 内核
        if (UA.isWebkit()) {
            // 插入 &#8203
            editor.cmd.do('insertHTML', '&#8203;')
            // 修改 offset 位置
            range.setEnd(range.endContainer, range.endOffset + 1)
            // 存储
            this.saveRange(range)
        } else {
            elem = Vm('strong', {}, ['&#8203;'])
            editor.cmd.do('insertElem', elem)
            this.createRangeByElem(elem, true)
        }
    }

    // 根据 Elem 设置选区
    createRangeByElem(elem, toStart, isContent) {
        // elem - 经过封装的 elem
        // toStart - true 开始位置，false 结束位置
        // isContent - 是否选中Elem的内容
        if (!elem) return

        const range = document.createRange()

        if (isContent) {
            range.selectNodeContents(elem)
        } else {
            range.selectNode(elem)
        }

        if (typeof toStart === 'boolean') {
            range.collapse(toStart)
        }

        // 存储 range
        this.saveRange(range)
    }
}

export default Selection