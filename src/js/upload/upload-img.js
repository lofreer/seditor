/*
    上传图片
*/

import { objForEach, arrForEach, percentFormat } from '../util'
import Progress from './progress.js'


class UploadImg {
    constructor(editor) {
        this.editor = editor
    }

    // 根据 debug 弹出不同的信息
    _alert(alertInfo, debugInfo) {
        const editor = this.editor
        const debug = editor.config.debug

        if (debug) {
            throw new Error('SEditor: ' + (debugInfo || alertInfo))
        } else {
            alert(alertInfo)
        }
    }

    // 根据链接插入图片
    insertLinkImg(link) {
        if (!link) {
            return
        }
        const editor = this.editor

        let img = document.createElement('img')
        img.onload = () => {
            img = null
            editor.cmd.do('insertHTML', `<img src="${link}" style="max-width:100%;"/>`)
        }
        img.onerror = () => {
            img = null
            // 无法成功下载图片
            this._alert('插入图片错误', `SEditor: 插入图片出错，图片链接是 "${link}"，下载该链接失败`)
            return
        }
        img.onabort = () => {
            img = null
        }
        img.src = link
    }

    // 上传图片
    uploadImg(files) {
        if (!files || !files.length) {
            return
        }

        // ------------------------------ 获取配置信息 ------------------------------
        const editor = this.editor
        const config = editor.config
        const maxSize = config.uploadImgMaxSize
        const maxSizeM = maxSize / 1000 / 1000
        const maxLength = config.uploadImgMaxLength || 10000
        let uploadImgServer = config.uploadImgServer
        const uploadImgShowBase64 = config.uploadImgShowBase64
        const uploadFileName = config.uploadFileName || ''
        const uploadImgParams = config.uploadImgParams || {}
        const uploadImgHeaders = config.uploadImgHeaders || {}
        const hooks = config.uploadImgHooks || {}
        const timeout = config.uploadImgTimeout || 3000
        let withCredentials = config.withCredentials
        if (withCredentials == null) {
            withCredentials = false
        }

        // ------------------------------ 验证文件信息 ------------------------------
        const resultFiles = []
        let errInfo = []
        arrForEach(files, file => {
            var name = file.name
            var size = file.size
            if (/\.(jpg|jpeg|png|bmp|gif)$/i.test(name) === false) {
                // 后缀名不合法，不是图片
                errInfo.push(`【${name}】不是图片`)
                return
            }
            if (maxSize < size) {
                // 上传图片过大
                errInfo.push(`【${name}】大于 ${maxSizeM}M`)
                return
            }

            // 验证通过的加入结果列表
            resultFiles.push(file)
        })
        // 抛出验证信息
        if (errInfo.length) {
            this._alert('图片验证未通过: \n' + errInfo.join('\n'))
            return
        }
        if (resultFiles.length > maxLength) {
            this._alert('一次最多上传' + maxLength + '张图片')
            return
        }

        // 添加图片数据
        const formdata = new FormData()
        arrForEach(resultFiles, file => {
            const name = uploadFileName || file.name
            formdata.append(name, file)
        })

        // ------------------------------ 上传图片 ------------------------------
        if (uploadImgServer && typeof uploadImgServer === 'string') {
            // 添加参数
            const uploadImgServerArr = uploadImgServer.split('#')
            uploadImgServer = uploadImgServerArr[0]
            const uploadImgServerHash = uploadImgServerArr[1] || ''
            objForEach(uploadImgParams, (key, val) => {
                val = encodeURIComponent(val)

                // 第一，将参数拼接到 url 中
                if (uploadImgServer.indexOf('?') > 0) {
                    uploadImgServer += '&'
                } else {
                    uploadImgServer += '?'
                }
                uploadImgServer = uploadImgServer + key + '=' + val

                // 第二，将参数添加到 formdata 中
                formdata.append(key, val)
            })
            if (uploadImgServerHash) {
                uploadImgServer += '#' + uploadImgServerHash
            }

            // 定义 xhr
            const xhr = new XMLHttpRequest()
            xhr.open('POST', uploadImgServer)

            // 设置超时
            xhr.timeout = timeout
            xhr.ontimeout = () => {
                // hook - timeout
                if (hooks.timeout && typeof hooks.timeout === 'function') {
                    hooks.timeout(xhr, editor)
                }

                this._alert('上传图片超时')
            }

            // 监控 progress
            if (xhr.upload) {
                xhr.upload.onprogress = e => {
                    let percent
                    // 进度条
                    const progressBar = new Progress(editor)
                    if (e.lengthComputable) {
                        percent = e.loaded / e.total
                        progressBar.show(percent)
                    }
                }
            }

            // 返回数据
            xhr.onreadystatechange = () => {
                let result
                if (xhr.readyState === 4 && xhr.status === 200) {
                    if (xhr.status !== 200) {
                        // hook - error
                        if (hooks.error && typeof hooks.error === 'function') {
                            hooks.error(xhr, editor)
                        }

                        // xhr 返回状态错误
                        this._alert('上传图片发生错误', `上传图片发生错误，服务器返回状态是 ${xhr.status}`)
                        return
                    }

                    result = xhr.responseText
                    if (typeof result !== 'object') {
                        try {
                            result = JSON.parse(result)
                        } catch (ex) {
                            // hook - fail
                            if (hooks.fail && typeof hooks.fail === 'function') {
                                hooks.fail(xhr, editor, result)
                            }

                            this._alert('上传图片失败', '上传图片返回结果错误，返回结果是: ' + result)
                            return
                        }
                    }
                    if (!result.success) {
                        // hook - fail
                        if (hooks.fail && typeof hooks.fail === 'function') {
                            hooks.fail(xhr, editor, result)
                        }

                        // 数据错误
                        this._alert('上传图片失败', '上传图片返回结果错误，返回结果 errorCode=' + result.errorCode)
                    } else {
                        if (hooks.customInsert && typeof hooks.customInsert === 'function') {
                            // 使用者自定义插入方法
                            hooks.customInsert(this.insertLinkImg.bind(this), result, editor)
                        } else {
                            // 将图片插入编辑器
                            this.insertLinkImg(result.url)
                        }

                        // hook - success
                        if (hooks.success && typeof hooks.success === 'function') {
                            hooks.success(xhr, editor, result)
                        }
                    }
                }
            }

            // hook - before
            if (hooks.before && typeof hooks.before === 'function') {
                hooks.before(xhr, editor, resultFiles)
            }

            // 自定义 headers
            objForEach(uploadImgHeaders, (key, val) => {
                xhr.setRequestHeader(key, val)
            })

            // 跨域传 cookie
            xhr.withCredentials = withCredentials

            // 发送请求
            xhr.send(formdata)

            // 注意，要 return 。不去操作接下来的 base64 显示方式
            return
        }

        // 显示 base64 格式
        if (uploadImgShowBase64) {
            arrForEach(files, file => {
                const _this = this
                const reader = new FileReader()
                reader.readAsDataURL(file)
                reader.onload = function () {
                    _this.insertLinkImg(this.result)
                }
            })
        }
    }
}

export default UploadImg