/*
    menu - img
*/
import Vm from '../../util/vm'
import { getRandom, arrForEach } from '../../util'
import Panel from '../panel.js'



class Image {
    constructor(editor) {
        this.editor = editor
        this.elem = Vm('div', {class: 'eui-menu-item'}, [
            Vm('i', {class: 'eicon eicon-insertimage'})
        ])
        this.type = 'panel'

        // 当前是否 active 状态
        this._active = false
    }

    onClick() {
        if (this._active) {
            this._createEditPanel()
        } else {
            this._createInsertPanel()
        }
    }

    _createEditPanel() {
        const editor = this.editor

        // id
        const width30 = getRandom('width-30')
        const width50 = getRandom('width-50')
        const width100 = getRandom('width-100')
        const delBtn = getRandom('del-btn')

        // tab 配置
        const tabsConfig = [
            {
                title: '编辑图片',
                tpl: Vm('div', {}, [
                    Vm('div', {class: 'eui-button-container', style: `border-bottom:1px solid #f1f1f1;padding-bottom:5px;margin-bottom:5px;`}, [
                        Vm('span', {style: `float:left;font-size:14px;margin:4px 5px 0 5px;color:#333;`}, ['最大宽度：']),
                        Vm('button', {id: width30, class: 'left'}, ['30%']),
                        Vm('button', {id: width50, class: 'left'}, ['50%']),
                        Vm('button', {id: width100, class: 'left'}, ['100%'])
                    ]),
                    Vm('div', {class: 'eui-button-container'}, [
                        Vm('button', {id: delBtn, class: 'gray left'}, ['删除图片'])
                    ])
                ]),
                events: [
                    {
                        selector: '#' + width30,
                        type: 'click',
                        fn: () => {
                            const img = editor._selectedImg
                            if (img) {
                                img.style.maxWidth = '30%'
                                // 触发 onchange
                                editor.change && editor.change(true)
                            }
                            // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                            return true
                        }
                    },
                    {
                        selector: '#' + width50,
                        type: 'click',
                        fn: () => {
                            const img = editor._selectedImg
                            if (img) {
                                img.style.maxWidth = '50%'
                                // 触发 onchange
                                editor.change && editor.change(true)
                            }
                            // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                            return true
                        }
                    },
                    {
                        selector: '#' + width100,
                        type: 'click',
                        fn: () => {
                            const img = editor._selectedImg
                            if (img) {
                                img.style.maxWidth = '100%'
                                // 触发 onchange
                                editor.change && editor.change(true)
                            }
                            // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                            return true
                        }
                    },
                    {
                        selector: '#' + delBtn,
                        type: 'click',
                        fn: () => {
                            const img = editor._selectedImg
                            if (img) {
                                img.remove()
                            }
                            // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                            return true
                        }
                    }
                ]
            }
        ]

        // 创建 panel 并显示
        const panel = new Panel(this, {
            width: 300,
            tabs: tabsConfig
        })
        panel.show()

        // 记录属性
        this.panel = panel
    }

    _createInsertPanel() {
        const editor = this.editor
        const uploadImg = editor.uploadImg
        const config = editor.config

        // id
        const upTriggerId = getRandom('up-trigger')
        const upFileId = getRandom('up-file')
        const linkUrlId = getRandom('link-url')
        const linkBtnId = getRandom('link-btn')

        // tabs 的配置
        const tabsConfig = [
            {
                title: '上传图片',
                tpl: Vm('div', {class: 'eui-up-img-container'}, [
                    Vm('div', {id: upTriggerId, class: 'eui-up-btn'}, [
                        Vm('i', {class: 'eicon eicon-upload'})
                    ]),
                    Vm('div', {style: 'display: none;'}, [
                        Vm('input', {id: upFileId, type: 'file', multiple: 'multiple', accept: 'image/jpg,image/jpeg,image/png,image/gif,image/bmp'})
                    ])
                ]),
                events: [
                    {
                        // 触发选择图片
                        selector: '#' + upTriggerId,
                        type: 'click',
                        fn: () => {
                            const fileElem = document.querySelector('#' + upFileId)
                            if (fileElem) {
                                fileElem.click()
                            } else {
                                // 返回 true 可关闭 panel
                                return true
                            }
                        }
                    },
                    {
                        // 选择图片完毕
                        selector: '#' + upFileId,
                        type: 'change',
                        fn: () => {
                            const fileElem = document.querySelector('#' + upFileId)
                            if (!fileElem) {
                                // 返回 true 可关闭 panel
                                return true
                            }

                            // 获取选中的 file 对象列表
                            const fileList = fileElem.files
                            if (fileList.length) {
                                uploadImg.uploadImg(fileList)
                            }

                            // 返回 true 可关闭 panel
                            return true
                        }
                    }
                ]
            }, // first tab end
            {
                title: '网络图片',
                tpl: Vm('div', {}, [
                    Vm('input', {id: linkUrlId, type: 'text', class: 'block', placeholder: '图片链接'}),
                    Vm('div', {class: 'eui-button-container'}, [
                        Vm('button', {id: linkBtnId, class: 'right'}, ['插入'])
                    ])
                ]),
                events: [
                    {
                        selector: '#' + linkBtnId,
                        type: 'click',
                        fn: () => {
                            const linkUrl = document.querySelector('#' + linkUrlId)
                            const url = linkUrl.value.trim()

                            if (url) {
                                uploadImg.insertLinkImg(url)
                            }

                            // 返回 true 表示函数执行结束之后关闭 panel
                            return true
                        }
                    }
                ]
            } // second tab end
        ] // tabs end

        // 判断 tabs 的显示
        const tabsConfigResult = []
        if ((config.uploadImgShowBase64 || config.uploadImgServer) && window.FileReader) {
            // 显示“上传图片”
            tabsConfigResult.push(tabsConfig[0])
        }
        if (config.showLinkImg) {
            // 显示“网络图片”
            tabsConfigResult.push(tabsConfig[1])
        }

        // 创建 panel 并显示
        const panel = new Panel(this, {
            width: 300,
            tabs: tabsConfigResult
        })
        panel.show()

        // 记录属性
        this.panel = panel
    }

    // 试图改变 active 状态
    tryChangeActive(e) {
        const editor = this.editor
        const elem = this.elem
        if (editor._selectedImg) {
            this._active = true
            elem.classList.add('eui-active')
        } else {
            this._active = false
            elem.classList.remove('eui-active')
        }
    }
}

export default Image