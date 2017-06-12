import _config from '../config'
import Menus from '../menus'
import Text from '../text'
import Command from '../command'
import Selection from '../selection'
import UploadImg from '../upload/upload-img'
import Vm from '../util/vm'


let eid = 1

class Editor {
    constructor(textSelector, toolbarSelector) {
        if (!textSelector) {
            // 没有传入任何参数，报错
            throw new Error('错误：初始化编辑器时候未传入任何参数，请查阅文档')            
        }
        // id，用以区分单个页面不同的编辑器对象
        this.id = `SEditor-${eid++}`

        this.textSelector = textSelector
        this.toolbarSelector = toolbarSelector

        // 自定义配置
        this.customConfig = {}
    }

    _initDom() {
        const textSelector = this.textSelector
        const wrap = document.querySelector(textSelector)
        const toolbarSelector = this.toolbarSelector

        // 定义变量
        let toolbarElem, textContainerElem, textElem, defaultContent

        if (!toolbarSelector) {
            // 只传入一个参数，即是容器的选择器或元素，toolbar 和 text 的元素自行创建
            toolbarElem = Vm('div', {class: 'eui-toolbar', style: `background-color: #f1f1f1; border: 1px solid #ccc`})
            textContainerElem = Vm('div', {class: 'eui-container', style: `border: 1px solid #ccc; border-top: none; height: 300px`})
            // 将编辑器区域原有的内容，暂存起来
            defaultContent = textSelector.innerHTML

            // 添加到 DOM 结构中
            wrap.appendChild(toolbarElem)
            wrap.appendChild(textContainerElem)
        } else {
            // toolbar 和 text 的选择器都有值，记录属性
            toolbarElem = document.querySelector(toolbarSelector)
            textContainerElem = document.querySelector(textSelector)
            // 将编辑器区域原有的内容，暂存起来
            defaultContent = textContainerElem.innerHTML
        }

        // 编辑区域
        textElem = Vm('div', {class: 'eui-content', style: `width: 100%; height: 100%;`, contenteditable: true})

        // 初始化编辑区域内容
        if (defaultContent) {
            textElem.innerHTL = defaultContent
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
    }
}

export default Editor