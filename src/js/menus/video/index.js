/*
    menu - video
*/
import Vm from '../../util/vm'
import { getRandom } from '../../util'
import Panel from '../panel.js'



class Video {
    constructor(editor) {
        this.editor = editor
        this.elem = Vm('div', {class: 'eui-menu-item'}, [
            Vm('i', {class: 'eicon eicon-insertvideo'})
        ]),
        this.type = 'panel'

        // 当前是否 active 状态
        this._active = false
    }

    onClick() {
        this._createPanel()
    }

    _createPanel() {
        // 创建 id
        const textValId = getRandom('text-val')
        const btnId = getRandom('btn')

        // 创建 panel
        const panel = new Panel(this, {
            width: 350,
            // 一个 panel 多个 tab
            tabs: [
                {
                    // 标题
                    title: '插入视频',
                    // 模板
                    tpl: Vm('div', {}, [
                        Vm('input', {id: textValId, type: 'text', class: 'block', placeholder: '格式如：<iframe src=... ><\/iframe>'}),
                        Vm('div', {class: 'eui-button-container'}, [
                            Vm('button', {id: btnId, class: 'right'}, ['插入'])
                        ])
                    ]),
                    // 事件绑定
                    events: [
                        {
                            selector: '#' + btnId,
                            type: 'click',
                            fn: () => {
                                const text = document.querySelector('#' + textValId)
                                const val = text.value.trim()

                                // 测试用视频地址
                                // <iframe height=498 width=510 src='http://player.youku.com/embed/XMjcwMzc3MzM3Mg==' frameborder=0 'allowfullscreen'></iframe>

                                if (val) {
                                    // 插入视频
                                    this._insert(val)
                                }

                                // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                                return true
                            }
                        }
                    ]
                } // first tab end
            ] // tabs end
        }) // panel end

        // 显示 panel
        panel.show()

        // 记录属性
        this.panel = panel
    }

    // 插入视频
    _insert(val) {
        const editor = this.editor
        editor.cmd.do('insertHTML', val + '<p><br></p>')
    }
}

export default Video