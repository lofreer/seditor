/*
    编辑区域
*/
import Vm from '../util/vm'
import { getPasteText, getPasteHtml, getPasteImgs } from '../util/paste-handle.js'

class Text {
    constructor(editor) {
        this.editor = editor
    }

    // 初始化
    init() {
        // 绑定事件
        this._bindEvent()
    }

    // 清空内容
    clear() {
        this.html('<p><br></p>')
    }

    // 获取 设置 html
    html(val) {
        const editor = this.editor
        const textElem = editor.textElem
        if (!val) {
            return textElem.innerHTML
        } else {
            if (val.indexOf('<') !== 0) {
                val = `<p>${val}</p>`
            }
            textElem.innerHTML = val
            this.focus()
        }
    }

    // 获取 设置 text
    text(val) {
        const editor = this.editor
        const textElem = editor.textElem
        if (!val) {
            return textElem.textContent
        } else {
            textElem.innerHTML = `<p>${val}</p>`
            this.focus()
        }
    }

    // 追加内容
    append(html) {
        const editor = this.editor
        const textElem = editor.textElem
        if (html.indexOf('<') !== 0) {
            html = `<p>${html}</p>`
        }
        textElem.insertAdjacentHTML('beforeend', html)
    }

    // 编辑区聚焦
    focus(toStart) {
        const editor = this.editor
        const textElem = editor.textElem
        const children = textElem.childNodes
        if (!children.length) {
            // 如果编辑器区域无内容，添加一个空行，重新设置选区
            textElem.appendChild(Vm('p', {}, [Vm('br')]))
            this.focus()
            return
        }

        const last = children[children.length - 1]
        editor.selection.createRangeByElem(last, !!toStart)
        editor.selection.restoreSelection()
    }

    // 绑定事件
    _bindEvent() {
        // 实时保存选取
        this._saveRangeRealTime()

        // 按回车建时的特殊处理
        this._enterKeyHandle()

        // 清空时保留 <p><br></p>
        this._clearHandle()

        // 粘贴事件（粘贴文字，粘贴图片）
        this._pasteHandle()

        // tab 特殊处理
        this._tabHandle()

        // img 点击
        this._imgHandle()
    }

    // 实时保存选取
    _saveRangeRealTime() {
        const editor = this.editor
        const textElem = editor.textElem

        // 保存当前的选区
        function saveRange(e) {
            // 随时保存选区
            editor.selection.saveRange()
            // 更新按钮 ative 状态
            editor.menus.changeActive()
        }
        // 按键后保存
        textElem.addEventListener('keyup', saveRange)
        textElem.addEventListener('mousedown', e => {
            // mousedown 状态下，鼠标滑动到编辑区域外面，也需要保存选区
            textElem.addEventListener('mouseleave', saveRange)
        })
        textElem.addEventListener('mouseup', e => {
            saveRange()
            // 在编辑器区域之内完成点击，取消鼠标滑动到编辑区外面的事件
            textElem.removeEventListener('mouseleave', saveRange)
        })
    }    

    // 按回车键时的特殊处理
    _enterKeyHandle() {
        const editor = this.editor
        const textElem = editor.textElem

        // 将回车之后生成的非 <p> 的顶级标签，改为 <p>
        function pHandle(e) {
            const selectionElem = editor.selection.getSelectionContainerElem()
            const parentElem = selectionElem.parentNode
            // 不是顶级标签
            if (parentElem !== textElem) return

            const nodeName = selectionElem.nodeNmae
            if (nodeName === 'P') {
                // 当前的标签是 P ，不用做处理
            }

            // 有内容，不做处理
            if (selectionElem.textContent) return

            // 插入 <p> ，并将选取定位到 <p>，删除当前标签
            const p = Vm('p', {}, [Vm('br')])
            selectionElem.parentNode.insertBefore(p, selectionElem)
            editor.selection.createRangeByElem(p, true)
            editor.selection.restoreSelection()
            selectionElem.remove()
        }

        textElem.addEventListener('keyup', e => {
            // 不是回车键
            if (e.keyCode !== 13) return
            // 将回车之后生成的非 <p> 的顶级标签，改为 <p>
            pHandle(e)
        })

        // <pre><code></code></pre> 回车时 特殊处理
        function codeHandle(e) {
            const selectionElem = editor.selection.getSelectionContainerElem()
            if (!selectionElem) return

            const parentElem = selectionElem.parentNode
            const selectionNodeName = selectionElem.nodeName
            const parentNodeName = parentElem.nodeName
            // 不符合要求 忽略
            if (selectionNodeName !== 'CODE' || parentNodeName !== 'PRE') return

            // 必须原生支持 insertHTML 命令
            if (!editor.cmd.queryCommandSupported('insertHTML')) return

            const _startOffset = editor.selection.getRange().startOffset
            editor.cmd.do('insertHTML', '\n')
            editor.selection.saveRange()
            if (editor.selection.getRange().startOffset === _startOffset) {
                // 没起作用，再来一遍
                editor.cmd.do('insertHTML', '\n')
            }

            // 阻止默认行为
            e.preventDefault()
        }

        textElem.addEventListener('keydown', e => {
            // 不是回车键
            if (e.keyCode !== 13) return
            // <pre><code></code></pre> 回车时 特殊处理
            codeHandle(e)
        })
    }

    // 清空时保留 <p><br></p>
    _clearHandle() {
        const editor = this.editor
        const textElem = editor.textElem

        textElem.addEventListener('keydown', e => {
            if (e.keyCode !== 8) return
            
            const txtHtml = textElem.innerHTML.toLowerCase().trim()
            if (txtHtml === '<p><br></p>') {
                // 最后剩下一个空行，就不再删除了
                e.preventDefault()
                return
            }
        })

        textElem.addEventListener('keyup', e => {
            if (e.keyCode !== 8) return
            const txtHtml = textElem.innerHTML.toLowerCase().trim()

            // firefox 时用 txtHtml === '<br>' 判断，其他用 !txtHtml 判断
            if (!txtHtml || txtHtml === '<br>') {
                // 内容空了
                let p = Vm('p', {}, [Vm('br')])
                textElem.innerHTML = '' // 一定要先清空，否则在 firefox 下有问题
                textElem.appendChild(p)
                editor.selection.createRangeByElem(p, false, true)
                editor.selection.restoreSelection()
            }
        })

    }

    // 粘贴事件（粘贴文字 粘贴图片）
    _pasteHandle() {
        const editor = this.editor
        const textElem = editor.textElem

        // 粘贴文字
        textElem.addEventListener('paste', e => {
            // 阻止默认行为，使用 execCommand 的粘贴命令
            e.preventDefault()

            // 获取粘贴的文字
            let pasteText, pasteHtml

            const selectionElem = editor.selection.getSelectionContainerElem()
            if (!selectionElem) return
            const nodeName = selectionElem.nodeName

            // code 中粘贴忽略
            if (nodeName === 'CODE' || nodeName === 'PRE') return

            // 表格中忽略，可能会出现异常问题
            if (nodeName === 'TD' || nodeName === 'TH') return

            if (nodeName === 'DIV' || textElem.innerHTML === '<p><br></p>') {
                // 是 div，可粘贴过滤样式的文字和链接

                pasteHtml = getPasteHtml(e)
                if (!pasteHtml) return

                editor.cmd.do('insertHTML', pasteHtml)
            } else {
                // 不是 div，证明在已有内容的元素中粘贴，只粘贴纯文本

                pasteText = getPasteText(e)
                if (!pasteText) return
                editor.cmd.do('insertHTML', `<p>${pasteText}</p>`)
            }
        })

        // 粘贴图片
        textElem.addEventListener('paste', e => {
            e.preventDefault()

            // 获取粘贴的图片
            const pasteFiles = getPasteImgs(e)
            if (!pasteFiles || !pasteFiles.length) return

            // 获取当前的元素
            const selectionElem = editor.selection.getSelectionContainerElem()
            if (!selectionElem) return

            const nodeName = selectionElem.nodeName

            // code 中粘贴忽略
            if (nodeName === 'CODE' || nodeName === 'PRE') return

            // 上传图片
            const uploadImg = editor.uploadImg
            uploadImg.uploadImg(pasteFiles)
        })
    }

    // tab 特殊处理
    _tabHandle() {
        const editor = this.editor
        const textElem = editor.textElem

        textElem.addEventListener('keydown', e => {
            if (e.keyCode !== 9) return 
            // 必须原生支持 insertHTML 命令
            if (!editor.cmd.queryCommandSupported('insertHTML')) return

            const selectionElem = editor.selection.getSelectionContainerElem()
            if (!selectionElem) return

            const parentElem = selectionElem.parentNode
            const selectionNodeName = selectionElem.nodeName
            const parentNodeName = parentElem.nodeName

            if (selectionNodeName === 'CODE' && parentNodeName === 'PRE') {
                // <pre><code> 里面
                editor.cmd.do('insertHTML', '    ')
            } else {
                // 普通文字
                editor.cmd.do('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;')
            }

            e.preventDefault()
        })

    }

    // img 点击
    _imgHandle() {
        const editor = this.editor
        const textElem = editor.textElem
        const selectedClass = 'eui-selected'

        // 为图片增加 selected 样式
        textElem.addEventListener('click', function (e) {
            if (e.target.matches('img')) {
                const img = e.target

                // 去掉所有图片的 selected 样式
                let arr = []
                arr.slice.call(textElem.querySelectorAll('img')).forEach(item => {
                    item.classList.remove(selectedClass)
                })

                // 为点击的图片增加样式，并记录当前图片
                img.classList.add(selectedClass)
                editor._selectedImg = img

                // 修改选取
                editor.selection.createRangeByElem(img)
            }
            
        })

        // 去掉图片的 selected 样式
        textElem.addEventListener('click', e => {
            // 点击的是图片，忽略
            if (e.target.matches('img')) return
            // 取消掉 selected 样式，并删除记录
            let arr = []
            arr.slice.call(textElem.querySelectorAll('img')).forEach(item => {
                item.classList.remove(selectedClass)
            })
            editor._selectedImg = null
        })
        textElem.addEventListener('keyup', e => {
            // 点击的是图片，忽略
            if (e.target.matches('img')) return
            // 取消掉 selected 样式，并删除记录
            let arr = []
            arr.slice.call(textElem.querySelectorAll('img')).forEach(item => {
                item.classList.remove(selectedClass)
            })
            editor._selectedImg = null
        })
    }
}

export default Text