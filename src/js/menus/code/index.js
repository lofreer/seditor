/*
    menu - code
*/
import Vm from '../../util/vm'
import { getRandom, replaceHtmlSymbol } from '../../util'
import Panel from '../panel.js'



class Code {
    constructor(editor) {
        this.editor = editor
        this.elem = Vm('div', {class: 'eui-menu-item'}, [
            Vm('i', {class: 'eicon eicon-insertcode'})
        ]),
        this.type = 'panel'

        // 当前是否 active 状态
        this._active = false
    }

    onClick(e) {
        const editor = this.editor
        const startElem = editor.selection.getSelectionStartElem()
        const endElem = editor.selection.getSelectionEndElem()
        const isSeleEmpty = editor.selection.isSelectionEmpty()
        const selectionText = editor.selection.getSelectionText()
        let code

        if (startElem !== endElem) {
            // 跨元素选择，不做处理
            editor.selection.restoreSelection()
            return
        }
        if (!isSeleEmpty) {
            // 选取不是空，用 <code> 包裹即可
            code = Vm('code', {}, [selectionText])
            editor.cmd.do('insertElem', code)
            editor.selection.createRangeByElem(code, false)
            editor.selection.restoreSelection()
            return
        }

        // 选取是空，且没有夸元素选择，则插入 <pre><code></code></prev>
        if (this._active) {
            // 选中状态，将编辑内容
            this._createPanel(startElem.html())
        } else {
            // 未选中状态，将创建内容
            this._createPanel()
        }
    }

    _createPanel(value) {
        // value - 要编辑的内容
        value = value || ''
        const type = !value ? 'new' : 'edit'
        const textId = getRandom('texxt')
        const btnId = getRandom('btn')

        const panel = new Panel(this, {
            width: 500,
            // 一个 Panel 包含多个 tab
            tabs: [
                {
                    // 标题
                    title: '插入代码',
                    // 模板
                    tpl: Vm('div', {}, [
                        Vm('textarea', {id: textId, style: `height: 145px;`}, [value]),
                        Vm('div', {class: 'eui-button-container'}, [
                            Vm('button', {id: btnId, class: 'right'}, ['插入'])
                        ])
                    ]),
                    // 事件绑定
                    events: [
                        // 插入代码
                        {
                            selector: '#' + btnId,
                            type: 'click',
                            fn: () => {
                                const $text = document.querySelector('#' + textId)
                                let text = $text.value || $text.innerHTML
                                text = replaceHtmlSymbol(text)
                                if (type === 'new') {
                                    // 新插入
                                    this._insertCode(text)
                                } else {
                                    // 编辑更新
                                    this._updateCode(text)
                                }

                                // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                                return true
                            }
                        }
                    ]
                } // first tab end
            ] // tabs end
        }) // new Panel end

        // 显示 panel
        panel.show()

        // 记录属性
        this.panel = panel
    }

    // 插入代码
    _insertCode(value) {
        const editor = this.editor
        editor.cmd.do('insertHTML', `<pre><code>${value}</code></pre><p><br></p>`)
    }

    // 更新代码
    _updateCode(value) {
        const editor = this.editor
        const selectionELem = editor.selection.getSelectionContainerElem()
        if (!selectionELem) {
            return
        }
        selectionELem.html(value)
        editor.selection.restoreSelection()
    }

    // 试图改变 active 状态
    tryChangeActive(e) {
        const editor = this.editor
        const elem = this.elem
        const selectionELem = editor.selection.getSelectionContainerElem()
        if (!selectionELem) {
            return
        }
        const parentElem = selectionELem.parentNode
        if (selectionELem.nodeName === 'CODE' && parentElem.nodeName === 'PRE') {
            this._active = true
            elem.classList.add('eui-active')
        } else {
            this._active = false
            elem.classList.remove('eui-active')
        }
    }
}

export default Code