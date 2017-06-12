import _config from '../config'
import Menus from '../menus'
import Text from '../text'
import Command from '../command'
import Selection from '../selection'
import UploadImg from '../upload/upload-img'
import Vm from '../util/vm'


let eid = 1

class Editor {
    constructor(toolbarSelector, textSelector) {
        if (!toolbarSelector) {
            // 没有传入任何参数，报错
            throw new Error('错误：初始化编辑器时候未传入任何参数，请查阅文档')            
        }
        // id，用以区分单个页面不同的编辑器对象
        this.id = `SEditor-${eid++}`

        this.toolbarSelector = toolbarSelector
        this.textSelector = textSelector

        // 自定义配置
        this.customConfig = {}
    }

    _initDom() {
        const toolbarSelector = this.toolbarSelector
        const textSelector = this.textSelector
        const wrap = document.querySelector(toolbarSelector)

        // 定义变量
        let toolbarElem, textContainerElem, textElem, defaultContent

        if (!textSelector) {
            // 只传入一个参数，即是容器的选择器或元素，toolbar 和 text 的元素自行创建
            toolbarElem = Vm('div', {class: 'eui-toolbar', style: `background-color: #f1f1f1; border: 1px solid #ccc`})
            textContainerElem = Vm('div', {class: 'eui-container', style: `border: 1px solid #ccc; border-top: none; height: 300px`})
            // 将编辑器区域原有的内容，暂存起来
            defaultContent = wrap.innerHTML
            wrap.innerHTML = ''

            // 添加到 DOM 结构中
            wrap.appendChild(toolbarElem)
            wrap.appendChild(textContainerElem)
        } else {
            // toolbar 和 text 的选择器都有值，记录属性
            toolbarElem = document.querySelector(toolbarSelector)
            toolbarElem.classList.add('eui-toolbar')
            textContainerElem = document.querySelector(textSelector)
            textContainerElem.classList.add('eui-container')
            // 将编辑器区域原有的内容，暂存起来
            defaultContent = textContainerElem.innerHTML
            textContainerElem.innerHTML = ''
        }

        // 编辑区域
        textElem = Vm('div', {class: 'eui-content', style: `width: 100%; height: 100%;`, contenteditable: true})

        // 初始化编辑区域内容
        if (defaultContent) {
            textElem.innerHTML = defaultContent
        } else {
            textElem.appendChild(Vm('p', {}, [
                Vm('br')
            ]))
        }

        // 编辑区域加入DOM
        textContainerElem.appendChild(textElem)

        // 记录属性
        this.toolbarElem = toolbarElem
        this.textContainerElem = textContainerElem
        this.textElem = textElem

        // 绑定 onchange
        textContainerElem.addEventListener('click', () => {
            this.change && this.change()
        })
        textContainerElem.addEventListener('keyup', () => {
            this.change && this.change()
        })
        toolbarElem.addEventListener('click', () => {
            this.change && this.change()
        })
    }

    // 初始化配置
    _initConfig() {
        // _config 是默认配置，this.customConfig 是用户自定义配置，将它们 merge 之后再赋值
        this.config = Object.assign({}, _config, this.customConfig)
    }

    // 封装 command
    _initCommand() {
        this.cmd = new Command(this)
    }

    // 封装 selection range API
    _initSelectionAPI() {
        this.selection = new Selection(this)
    }

    // 添加图片上传
    _initUploadImg() {
        this.uploadImg = new UploadImg(this)
    }

    // 初始化菜单
    _initMenus() {
        this.menus = new Menus(this)
        this.menus.init()
    }

    // 添加 text 区域
    _initText() {
        this.content = new Text(this)
        this.content.init()
    }

    // 初始化选区
    _initSelection() {
        const textElem = this.textElem
        const children = textElem.childNodes
        if (!children.length) {
            // 如果编辑器区域无内容，添加一个空行，重新设置选区
            textElem.appendChild(Vm('p', {}, [Vm('br')]))
            this._initSelection()
            return
        }

        const last = children[children.length - 1]
        console.log(last)
        const html = (last.innerHTML || last.textContent || last).toLowerCase()
        const nodeName = last.nodeName
        if ((html !== '<br>' && html !== '<br\/>') || nodeName !== 'P') {
            // 最后一个元素不是 <p><br></p>，添加一个空行，重新设置选区
            textElem.append(Vm('p', {}, [Vm('br')]))
            this._initSelection()
            return
        }

        this.selection.createRangeByElem(last, true)
        this.selection.restoreSelection()
    }

    // 绑定事件
    _bindEvent() {
        // -------- 绑定 onchange 事件 --------
        let onChangeTimeoutId = 0
        let beforeChangeHtml = this.content.html()
        const config = this.config
        const onchange = config.onchange
        if (onchange && typeof onchange === 'function'){
            // 触发 change 的有三个场景：
            // 1. textContainerElem event 'click keyup'
            // 2. toolbarElem.event 'click'
            // 3. editor.cmd.do()
            this.change = function () {
                // 判断是否有变化
                const currentHtml = this.content.html()
                if (currentHtml.length === beforeChangeHtml.length) return

                // 执行，使用节流
                if (onChangeTimeoutId) {
                    clearTimeout(onChangeTimeoutId)
                }
                onChangeTimeoutId = setTimeout(() => {
                    // 触发配置的 onchange 函数
                    onchange(currentHtml, this)
                    beforeChangeHtml = currentHtml
                }, 200)
            }   
        }
    }

    // 创建编辑器
    create() {
        // 初始化 DOM
        this._initDom()

        // 初始化配置信息
        this._initConfig()

        // 封装 command API
        this._initCommand()

        // 封装 selection range API
        this._initSelectionAPI()

        // 添加 text
        this._initText()

        // 初始化菜单
        this._initMenus()

        // 添加 图片上传
        this._initUploadImg()

        // 初始化选区
        this._initSelection()

        // 绑定事件
        this._bindEvent()
    }
}

export default Editor