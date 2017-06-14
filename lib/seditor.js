(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.SEditor = factory());
}(this, (function () { 'use strict';

/*
    配置信息
*/

var config = {

    // 默认菜单配置
    menus: ['head', 'bold', 'italic', 'underline', 'strikeThrough', 'foreColor', 'backColor', 'list', 'justify', 'quote', 'image', 'video', 'code', 'undo', 'redo'],

    // 是否开启 debug 模式（debug 模式下错误会 throw error 形式抛出）
    debug: false,

    // 是否显示添加网络图片的 tab
    showLinkImg: true,

    // 默认上传图片 max size: 5M
    uploadImgMaxSize: 5 * 1024 * 1024,

    // 上传图片，是否显示 base64 格式
    uploadImgShowBase64: true,

    // 上传图片，server 地址（如果有值，则 base64 格式的配置则失效）
    // uploadImgServer: 'http://www.daily.bookln.cn/comm/file/upload.do',

    // 上传图片的自定义参数
    uploadImgParams: {
        // token: 'abcdef12345'
    },

    // 上传图片的自定义header
    uploadImgHeaders: {
        // 'Accept': 'text/x-json'
    },

    // 配置 XHR withCredentials
    withCredentials: false,

    // 自定义上传图片超时时间 ms
    uploadImgTimeout: 5000,

    // 上传图片 hook 
    uploadImgHooks: {
        before: function before(xhr, editor, files) {},
        success: function success(xhr, editor, result) {},
        fail: function fail(xhr, editor, result) {},
        error: function error(xhr, editor) {},
        timeout: function timeout(xhr, editor) {}
    }
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

/*
    虚拟DOM生成器
*/

var Vm = function () {
    function Vm(tagName) {
        var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var children = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
        classCallCheck(this, Vm);

        if (!(this.tagName = tagName)) return;
        this.props = props;
        this.children = children;
    }

    createClass(Vm, [{
        key: 'render',
        value: function render() {
            var self = this;
            var node = document.createElement(this.tagName),
                props = this.props,
                children = this.children;

            for (var key in props) {
                if (/^on[A-Za-z]/.test(key)) {
                    var eventType = key.toLowerCase().replace('on', '');
                    node.addEventListener(eventType, props[key], false);
                } else {
                    node.setAttribute(key, props[key]);
                }
            }
            children.forEach(function (child) {
                if (Array.isArray(child)) {
                    child.forEach(function (item) {
                        item && (item instanceof HTMLElement ? node.appendChild(item) : node.insertAdjacentHTML('beforeend', item));
                    });
                } else {
                    child && (child instanceof HTMLElement ? node.appendChild(child) : node.insertAdjacentHTML('beforeend', child));
                }
            });
            return node;
        }
    }]);
    return Vm;
}();

var Vm$1 = (function (tagName, props, children) {
    return new Vm(tagName, props, children).render();
});

/*
    工具
*/

// 和 UA 相关的属性
var UA = {
    _ua: navigator.userAgent,

    // 是否 webkit
    isWebkit: function isWebkit() {
        var reg = /webkit/i;
        return reg.test(this._ua);
    }

    // 遍历对象
};function objForEach(obj, fn) {
    var key = void 0,
        result = void 0;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            result = fn.call(obj, key, obj[key]);
            if (result === false) {
                break;
            }
        }
    }
}

// 遍历类数组
function arrForEach(fakeArr, fn) {
    var i = void 0,
        item = void 0,
        result = void 0;
    var length = fakeArr.length || 0;
    for (i = 0; i < length; i++) {
        item = fakeArr[i];
        result = fn.call(fakeArr, item, i);
        if (result === false) {
            break;
        }
    }
}

// 获取随机数
function getRandom(prefix) {
    return prefix + Math.random().toString().slice(2);
}

// 替换 html 特殊字符
function replaceHtmlSymbol(html) {
    if (html == null) {
        return '';
    }
    return html.replace(/</gm, '&lt;').replace(/>/gm, '&gt;').replace(/"/gm, '&quot;');
}

// 返回百分比的格式

/*
    bold-menu
*/
var Bold = function () {
    function Bold(editor) {
        classCallCheck(this, Bold);

        this.editor = editor;
        this.elem = Vm$1('div', { class: 'eui-menu-item' }, [Vm$1('i', { class: 'eicon eicon-bold' })]);
        this.type = 'click';

        // 当前是否 active 状态
        this._active = false;
    }

    // 点击事件


    createClass(Bold, [{
        key: 'onClick',
        value: function onClick(e) {
            // 点击菜单将触发这里        
            var editor = this.editor;
            var isSeleEmpty = editor.selection.isSelectionEmpty();

            if (isSeleEmpty) {
                // 选区是空的，插入并选中一个“空白”
                editor.selection.createEmptyRange();
            }

            // 执行 bold 命令
            editor.cmd.do('bold');

            if (isSeleEmpty) {
                // 需要将选取折叠起来
                editor.selection.collapseRange();
                editor.selection.restoreSelection();
            }
        }

        // 试图改变 active 状态

    }, {
        key: 'tryChangeActive',
        value: function tryChangeActive(e) {
            var editor = this.editor;
            var elem = this.elem;
            if (editor.cmd.queryCommandState('bold')) {
                this._active = true;
                elem.classList.add('eui-active');
            } else {
                this._active = false;
                elem.classList.remove('eui-active');
            }
        }
    }]);
    return Bold;
}();

/*
    italic-menu
*/
var Italic = function () {
    function Italic(editor) {
        classCallCheck(this, Italic);

        this.editor = editor;
        this.elem = Vm$1('div', { class: 'eui-menu-item' }, [Vm$1('i', { class: 'eicon eicon-italic' })]);
        this.type = 'click';

        // 当前是否 active 状态
        this._active = false;
    }

    // 点击事件


    createClass(Italic, [{
        key: 'onClick',
        value: function onClick(e) {
            // 点击菜单将触发这里

            var editor = this.editor;
            var isSeleEmpty = editor.selection.isSelectionEmpty();

            if (isSeleEmpty) {
                // 选区是空的，插入并选中一个“空白”
                editor.selection.createEmptyRange();
            }

            // 执行 italic 命令
            editor.cmd.do('italic');

            if (isSeleEmpty) {
                // 需要将选取折叠起来
                editor.selection.collapseRange();
                editor.selection.restoreSelection();
            }
        }

        // 试图改变 active 状态

    }, {
        key: 'tryChangeActive',
        value: function tryChangeActive(e) {
            var editor = this.editor;
            var elem = this.elem;
            if (editor.cmd.queryCommandState('italic')) {
                this._active = true;
                elem.classList.add('eui-active');
            } else {
                this._active = false;
                elem.classList.remove('eui-active');
            }
        }
    }]);
    return Italic;
}();

/*
    underline-menu
*/
var Underline = function () {
    function Underline(editor) {
        classCallCheck(this, Underline);

        this.editor = editor;
        this.elem = Vm$1('div', { class: 'eui-menu-item' }, [Vm$1('i', { class: 'eicon eicon-underline' })]);
        this.type = 'click';

        // 当前是否 active 状态
        this._active = false;
    }

    // 点击事件


    createClass(Underline, [{
        key: 'onClick',
        value: function onClick(e) {
            // 点击菜单将触发这里

            var editor = this.editor;
            var isSeleEmpty = editor.selection.isSelectionEmpty();

            if (isSeleEmpty) {
                // 选区是空的，插入并选中一个“空白”
                editor.selection.createEmptyRange();
            }

            // 执行 underline 命令
            editor.cmd.do('underline');

            if (isSeleEmpty) {
                // 需要将选取折叠起来
                editor.selection.collapseRange();
                editor.selection.restoreSelection();
            }
        }

        // 试图改变 active 状态

    }, {
        key: 'tryChangeActive',
        value: function tryChangeActive(e) {
            var editor = this.editor;
            var elem = this.elem;
            if (editor.cmd.queryCommandState('underline')) {
                this._active = true;
                elem.classList.add('eui-active');
            } else {
                this._active = false;
                elem.classList.remove('eui-active');
            }
        }
    }]);
    return Underline;
}();

/*
    droplist
*/
var _emptyFn = function _emptyFn() {};

var DropList = function () {
    function DropList(menu, opt) {
        var _this = this;

        classCallCheck(this, DropList);

        // droplist 所依附的菜单
        this.menu = menu;
        this.opt = opt;
        // 容器
        var container = Vm$1('div', { class: 'eui-droplist' }

        // 标题
        );var title = opt.title;
        if (title) {
            title.classList.add('eui-drop-title');
            container.appendChild(title);
        }

        var list = opt.list || [];
        var type = opt.type || 'list'; // 'list' 列表形式（如“标题”菜单） / 'inline-block' 块状形式（如“颜色”菜单）
        var onClick = opt.onClick || _emptyFn;

        // 加入 DOM 并绑定事件
        var ul = Vm$1('ul', { class: type === 'list' ? 'eui-drop-list' : 'eui-drop-block' });
        container.appendChild(ul);
        list.forEach(function (item) {
            var elem = item.elem;
            var value = item.value;
            var li = Vm$1('li', { class: 'eui-drop-item' });
            if (elem) {
                li.appendChild(elem);
                ul.appendChild(li);
                elem.addEventListener('click', function (e) {
                    onClick(value

                    // 隐藏
                    );_this.hideTimeoutId = setTimeout(function () {
                        _this.hide();
                    }, 0);
                });
            }
        }

        // 绑定隐藏事件
        );container.addEventListener('mouseleave', function (e) {
            _this.hideTimeoutId = setTimeout(function () {
                _this.hide();
            }, 0);
        }

        // 记录属性
        );this.container = container;

        // 基本属性
        this._rendered = false;
        this._show = false;
    }

    // 显示（插入DOM）


    createClass(DropList, [{
        key: 'show',
        value: function show() {
            if (this.hideTimeoutId) {
                // 清除之前的定时隐藏
                clearTimeout(this.hideTimeoutId);
            }

            var menu = this.menu;
            var menuELem = menu.elem;
            var container = this.container;
            if (this._show) {
                return;
            }
            if (this._rendered) {
                // 显示
                container.style.display = 'block';
            } else {
                // 加入 DOM 之前先定位位置
                var menuHeight = menuELem.getBoundingClientRect().height || 0;
                var width = this.opt.width || 100; // 默认为 100
                container.style.cssText = 'margin-top: ' + menuHeight + 'px; width: ' + width + 'px';

                // 加入到 DOM
                menuELem.appendChild(container);
                this._rendered = true;
            }

            // 修改属性
            this._show = true;
        }

        // 隐藏（移除DOM）

    }, {
        key: 'hide',
        value: function hide() {
            if (this.showTimeoutId) {
                // 清除之前的定时显示
                clearTimeout(this.showTimeoutId);
            }

            var container = this.container;
            if (!this._show) {
                return;
            }
            // 隐藏并需改属性
            container.style.display = 'none';
            this._show = false;
        }
    }]);
    return DropList;
}();

/*
    menu - header
*/
var Head = function () {
    function Head(editor) {
        var _this = this;

        classCallCheck(this, Head);

        this.editor = editor;
        this.elem = Vm$1('div', { class: 'eui-menu-item' }, [Vm$1('i', { class: 'eicon eicon-heading' })]);
        this.type = 'droplist';

        // 当前是否 active 状态
        this._active = false;

        // 初始化 droplist
        this.droplist = new DropList(this, {
            width: 100,
            title: Vm$1('p', {}, ['设置标题']),
            type: 'list', // droplist 以列表形式展示
            list: [{ elem: Vm$1('h1', {}, ['H1']), value: '<h1>' }, { elem: Vm$1('h2', {}, ['H2']), value: '<h2>' }, { elem: Vm$1('h3', {}, ['H3']), value: '<h3>' }, { elem: Vm$1('h4', {}, ['H4']), value: '<h4>' }, { elem: Vm$1('h5', {}, ['H5']), value: '<h5>' }, { elem: Vm$1('p', {}, ['正文']), value: '<p>' }],
            onClick: function onClick(value) {
                // 注意 this 是指向当前的 Head 对象
                _this._command(value);
            }
        });
    }

    // 执行命令


    createClass(Head, [{
        key: '_command',
        value: function _command(value) {
            var editor = this.editor;
            editor.cmd.do('formatBlock', value);
        }

        // 试图改变 active 状态

    }, {
        key: 'tryChangeActive',
        value: function tryChangeActive(e) {
            var editor = this.editor;
            var elem = this.elem;
            var reg = /^h/i;
            var cmdValue = editor.cmd.queryCommandValue('formatBlock');
            if (reg.test(cmdValue)) {
                this._active = true;
                elem.classList.add('eui-active');
            } else {
                this._active = false;
                elem.classList.remove('eui-active');
            }
        }
    }]);
    return Head;
}();

/*
    strikeThrough-menu
*/
var StrikeThrough = function () {
    function StrikeThrough(editor) {
        classCallCheck(this, StrikeThrough);

        this.editor = editor;
        this.elem = Vm$1('div', { class: 'eui-menu-item' }, [Vm$1('i', { class: 'eicon eicon-strikethrough' })]);
        this.type = 'click';

        // 当前是否 active 状态
        this._active = false;
    }

    // 点击事件


    createClass(StrikeThrough, [{
        key: 'onClick',
        value: function onClick(e) {
            // 点击菜单将触发这里

            var editor = this.editor;
            var isSeleEmpty = editor.selection.isSelectionEmpty();

            if (isSeleEmpty) {
                // 选区是空的，插入并选中一个“空白”
                editor.selection.createEmptyRange();
            }

            // 执行 strikeThrough 命令
            editor.cmd.do('strikeThrough');

            if (isSeleEmpty) {
                // 需要将选取折叠起来
                editor.selection.collapseRange();
                editor.selection.restoreSelection();
            }
        }

        // 试图改变 active 状态

    }, {
        key: 'tryChangeActive',
        value: function tryChangeActive(e) {
            var editor = this.editor;
            var elem = this.elem;
            if (editor.cmd.queryCommandState('strikeThrough')) {
                this._active = true;
                elem.classList.add('eui-active');
            } else {
                this._active = false;
                elem.classList.remove('eui-active');
            }
        }
    }]);
    return StrikeThrough;
}();

/*
    undo-menu
*/
var Undo = function () {
    function Undo(editor) {
        classCallCheck(this, Undo);

        this.editor = editor;
        this.elem = Vm$1('div', { class: 'eui-menu-item' }, [Vm$1('i', { class: 'eicon eicon-undo' })]);
        this.type = 'click';

        // 当前是否 active 状态
        this._active = false;
    }

    // 点击事件


    createClass(Undo, [{
        key: 'onClick',
        value: function onClick(e) {
            // 点击菜单将触发这里

            var editor = this.editor;

            // 执行 undo 命令
            editor.cmd.do('undo');
        }
    }]);
    return Undo;
}();

/*
    undo-menu
*/
var Redo = function () {
    function Redo(editor) {
        classCallCheck(this, Redo);

        this.editor = editor;
        this.elem = Vm$1('div', { class: 'eui-menu-item' }, [Vm$1('i', { class: 'eicon eicon-redo' })]);
        this.type = 'click';

        // 当前是否 active 状态
        this._active = false;
    }

    // 点击事件


    createClass(Redo, [{
        key: 'onClick',
        value: function onClick(e) {
            // 点击菜单将触发这里

            var editor = this.editor;

            // 执行 undo 命令
            editor.cmd.do('redo');
        }
    }]);
    return Redo;
}();

/*
    menu - forecolor
*/
var colors = ['#000000', '#eeece0', '#1c487f', '#4d80bf', '#c24f4a', '#8baa4a', '#7b5ba1', '#46acc8', '#f9963b', '#ffffff'];

var BackColor = function () {
    function BackColor(editor) {
        var _this = this;

        classCallCheck(this, BackColor);

        this.editor = editor;
        this.elem = Vm$1('div', { class: 'eui-menu-item' }, [Vm$1('i', { class: 'eicon eicon-forecolor' })]);
        this.type = 'droplist';

        // 当前是否 active 状态
        this._active = false;

        // 初始化 droplist
        this.droplist = new DropList(this, {
            width: 120,
            title: Vm$1('p', {}, ['文字颜色']),
            type: 'inline-block', // droplist 内容以 block 形式展示
            list: colors.map(function (color) {
                return {
                    elem: Vm$1('i', { class: 'eicon eicon-forecolor', style: 'color: ' + color }),
                    value: color
                };
            }),
            onClick: function onClick(value) {
                // 注意 this 是指向当前的 ForeColor 对象
                _this._command(value);
            }
        });
    }

    // 执行命令


    createClass(BackColor, [{
        key: '_command',
        value: function _command(value) {
            var editor = this.editor;
            editor.cmd.do('foreColor', value);
        }
    }]);
    return BackColor;
}();

/*
    menu - forecolor
*/
var colors$1 = ['#000000', '#eeece0', '#1c487f', '#4d80bf', '#c24f4a', '#8baa4a', '#7b5ba1', '#46acc8', '#f9963b', '#ffffff'];

var BackColor$1 = function () {
    function BackColor(editor) {
        var _this = this;

        classCallCheck(this, BackColor);

        this.editor = editor;
        this.elem = Vm$1('div', { class: 'eui-menu-item' }, [Vm$1('i', { class: 'eicon eicon-backcolor' })]);
        this.type = 'droplist';

        // 当前是否 active 状态
        this._active = false;

        // 初始化 droplist
        this.droplist = new DropList(this, {
            width: 120,
            title: Vm$1('p', {}, ['背景色']),
            type: 'inline-block', // droplist 内容以 block 形式展示
            list: colors$1.map(function (color) {
                return {
                    elem: Vm$1('i', { class: 'eicon eicon-backcolor', style: 'color:' + color }),
                    value: color
                };
            }),
            onClick: function onClick(value) {
                // 注意 this 是指向当前的 ForeColor 对象
                _this._command(value);
            }
        });
    }

    // 执行命令


    createClass(BackColor, [{
        key: '_command',
        value: function _command(value) {
            var editor = this.editor;
            editor.cmd.do('backColor', value);
        }
    }]);
    return BackColor;
}();

/*
    menu - list
*/
// 原型

var List = function () {
    function List(editor) {
        var _this = this;

        classCallCheck(this, List);

        this.editor = editor;
        this.elem = Vm$1('div', { class: 'eui-menu-item' }, [Vm$1('i', { class: 'eicon eicon-insertunorderedlist' })]), this.type = 'droplist';

        // 当前是否 active 状态
        this._active = false;

        // 初始化 droplist
        this.droplist = new DropList(this, {
            width: 120,
            title: Vm$1('p', {}, ['设置列表']),
            type: 'list', // droplist 以列表形式展示
            list: [{ elem: Vm$1('span', {}, [Vm$1('i', { class: 'eicon eicon-insertorderedlist' }), ' 有序列表']), value: 'insertOrderedList' }, { elem: Vm$1('span', {}, [Vm$1('i', { class: 'eicon eicon-insertunorderedlist' }), ' 无序列表']), value: 'insertUnorderedList' }],
            onClick: function onClick(value) {
                // 注意 this 是指向当前的 List 对象
                _this._command(value);
            }
        });
    }

    // 执行命令


    createClass(List, [{
        key: '_command',
        value: function _command(value) {
            var editor = this.editor;
            var textElem = editor.textElem;
            editor.selection.restoreSelection();
            if (editor.cmd.queryCommandState(value)) {
                return;
            }
            editor.cmd.do(value

            // 验证列表是否被包裹在 <p> 之内
            );var selectionElem = editor.selection.getSelectionContainerElem();
            if (selectionElem.nodeName === 'LI') {
                selectionElem = selectionElem.parentNode;
            }
            if (/^ol|ul$/i.test(selectionElem.nodeName) === false) {
                return;
            }
            if (selectionElem === textElem) {
                // 证明是顶级标签，没有被 <p> 包裹
                return;
            }
            var parent = selectionElem.parentNode;
            // parent 是顶级标签，不能删除
            if (parent === textElem) return;

            parent.parentNode.appendChild(selectionElem);
            parent.remove();
        }

        // 试图改变 active 状态

    }, {
        key: 'tryChangeActive',
        value: function tryChangeActive(e) {
            var editor = this.editor;
            var elem = this.elem;
            if (editor.cmd.queryCommandState('insertUnOrderedList') || editor.cmd.queryCommandState('insertOrderedList')) {
                this._active = true;
                elem.classList.add('eui-active');
            } else {
                this._active = false;
                elem.classList.remove('eui-active');
            }
        }
    }]);
    return List;
}();

/*
    menu - justify
*/
var Justify = function () {
    function Justify(editor) {
        var _this = this;

        classCallCheck(this, Justify);

        this.editor = editor;
        this.elem = Vm$1('div', { class: 'eui-menu-item' }, [Vm$1('i', { class: 'eicon eicon-justifyleft' })]);
        this.type = 'droplist';

        // 当前是否 active 状态
        this._active = false;

        // 初始化 droplist
        this.droplist = new DropList(this, {
            width: 100,
            title: Vm$1('p', {}, ['对齐方式']),
            type: 'list', // droplist 以列表形式展示
            list: [{ elem: Vm$1('span', {}, [[Vm$1('i', { class: 'eicon eicon-justifyleft' }), ' 靠左']]), value: 'justifyLeft' }, { elem: Vm$1('span', {}, [[Vm$1('i', { class: 'eicon eicon-justifycenter' }), ' 居中']]), value: 'justifyCenter' }, { elem: Vm$1('span', {}, [[Vm$1('i', { class: 'eicon eicon-justifyright' }), ' 靠右']]), value: 'justifyRight' }],
            onClick: function onClick(value) {
                // 注意 this 是指向当前的 List 对象
                _this._command(value);
            }
        });
    }

    // 执行命令


    createClass(Justify, [{
        key: '_command',
        value: function _command(value) {
            var editor = this.editor;
            editor.cmd.do(value);
        }
    }]);
    return Justify;
}();

/*
    menu - quote
*/
var Quote = function () {
    function Quote(editor) {
        classCallCheck(this, Quote);

        this.editor = editor;
        this.elem = Vm$1('div', { class: 'eui-menu-item' }, [Vm$1('i', { class: 'eicon eicon-quotes' })]);
        this.type = 'click';

        // 当前是否 active 状态
        this._active = false;
    }

    createClass(Quote, [{
        key: 'onClick',
        value: function onClick(e) {
            var editor = this.editor;
            editor.cmd.do('formatBlock', '<BLOCKQUOTE>');
        }
    }, {
        key: 'tryChangeActive',
        value: function tryChangeActive(e) {
            var editor = this.editor;
            var elem = this.elem;
            var reg = /^BLOCKQUOTE$/i;
            var cmdValue = editor.cmd.queryCommandValue('formatBlock');
            if (reg.test(cmdValue)) {
                this._active = true;
                elem.classList.add('eui-active');
            } else {
                this._active = false;
                elem.classList.remove('eui-active');
            }
        }
    }]);
    return Quote;
}();

/*
    panel
*/

var emptyFn = function emptyFn() {};

// 记录已经显示 panel 的菜单
var _isCreatedPanelMenus = [];

var Panel = function () {
    function Panel(menu, opt) {
        classCallCheck(this, Panel);

        this.menu = menu;
        this.opt = opt;
    }

    // 显示（插入DOM）


    createClass(Panel, [{
        key: 'show',
        value: function show() {
            var _this = this;

            var menu = this.menu;
            // 该菜单已经创建了 panel 不能再创建
            if (_isCreatedPanelMenus.indexOf(menu) >= 0) return;

            var editor = menu.editor;
            var textContainerElem = editor.textContainerElem;
            var opt = this.opt;

            // panel 的容器
            var width = opt.width || 300; // 默认 300px
            var container = Vm$1('div', { class: 'eui-panel-wrap', style: 'width: ' + width + 'px; margin-left: ' + (0 - width) / 2 + 'px' }

            // 添加关闭按钮
            );var closeBtn = Vm$1('span', { class: 'eui-panel-close' }, [Vm$1('i', { class: 'eicon eicon-close' })]);
            container.appendChild(closeBtn);
            closeBtn.addEventListener('click', function () {
                _this.hide();
            }

            // 准备 tabs 容器
            // 设置高度
            );var height = opt.height;
            var tabTitleContainer = Vm$1('ul', { class: 'eui-panel-tab-title', style: height ? 'height: ' + height + 'px; overflow-y: scroll;' : '' });
            var tabContentContainer = Vm$1('div', { class: 'eui-panel-tab-content' });
            container.appendChild(tabTitleContainer);
            container.appendChild(tabContentContainer

            // tabs
            );var tabs = opt.tabs || [];
            var tabTitleArr = [];
            var tabContentArr = [];
            tabs.forEach(function (tab, tabIndex) {
                if (!tab) {
                    return;
                }
                var title = tab.title || '';
                var tpl = tab.tpl || '';

                // 添加到 DOM
                var tabItem = Vm$1('li', { class: 'eui-tab-item' }, [title]);
                tabTitleContainer.appendChild(tabItem);
                var content = tpl;
                tabContentContainer.appendChild(content

                // 记录到内存
                );tabItem._index = tabIndex;
                tabTitleArr.push(tabItem);
                tabContentArr.push(content

                // 设置 active 项
                );if (tabIndex === 0) {
                    tabItem._active = true;
                    tabItem.classList.add('eui-tab-active');
                } else {
                    content.style.display = 'none';
                }

                // 绑定 tab 的事件
                tabItem.addEventListener('click', function (e) {
                    if (tabItem._active) {
                        return;
                    }
                    // 隐藏所有的 tab
                    tabTitleArr.forEach(function (tabItem) {
                        tabItem._active = false;
                        tabItem.classList.remove('eui-tab-active');
                    });
                    tabContentArr.forEach(function (content) {
                        content.style.display = 'none';
                    }

                    // 显示当前的 tab
                    );tabItem._active = true;
                    tabItem.classList.add('eui-tab-active');
                    content.style.display = 'block';
                });
            }

            // 绑定关闭事件
            );container.addEventListener('click', function (e) {
                // 点击时阻止冒泡
                e.stopPropagation();
            });
            textContainerElem.addEventListener('click', function (e) {
                _this.hide();
            }

            // 添加到 DOM
            );textContainerElem.appendChild(container

            // 绑定 opt 的事件，只有添加到 DOM 之后才能绑定成功
            );tabs.forEach(function (tab, index) {
                if (!tab) {
                    return;
                }
                var events = tab.events || [];
                events.forEach(function (event) {
                    var selector = event.selector;
                    var type = event.type;
                    var fn = event.fn || emptyFn;
                    var content = tabContentArr[index];
                    content.querySelector(selector).addEventListener(type, function (e) {
                        e.stopPropagation();
                        var needToHide = fn(e
                        // 执行完事件之后，是否要关闭 panel
                        );if (needToHide) {
                            _this.hide();
                        }
                    });
                });
            }

            // focus 第一个 elem
            );var inputs = container.querySelectorAll('input[type=text],textarea');
            if (inputs.length) {
                inputs[0].focus();
            }

            // 添加到属性
            this.container = container;

            // 隐藏其他 panel
            this._hideOtherPanels
            // 记录该 menu 已经创建了 panel
            ();_isCreatedPanelMenus.push(menu);
        }

        // 隐藏（移除DOM）

    }, {
        key: 'hide',
        value: function hide() {
            var menu = this.menu;
            var container = this.container;
            if (container) {
                container.remove();
            }

            // 将该 menu 记录中移除
            _isCreatedPanelMenus = _isCreatedPanelMenus.filter(function (item) {
                if (item === menu) {
                    return false;
                } else {
                    return true;
                }
            });
        }

        // 一个 panel 展示时，隐藏其他 panel

    }, {
        key: '_hideOtherPanels',
        value: function _hideOtherPanels() {
            if (!_isCreatedPanelMenus.length) {
                return;
            }
            _isCreatedPanelMenus.forEach(function (menu) {
                var panel = menu.panel || {};
                if (panel.hide) {
                    panel.hide();
                }
            });
        }
    }]);
    return Panel;
}();

/*
    menu - img
*/
var Image = function () {
    function Image(editor) {
        classCallCheck(this, Image);

        this.editor = editor;
        this.elem = Vm$1('div', { class: 'eui-menu-item' }, [Vm$1('i', { class: 'eicon eicon-insertimage' })]);
        this.type = 'panel';

        // 当前是否 active 状态
        this._active = false;
    }

    createClass(Image, [{
        key: 'onClick',
        value: function onClick() {
            if (this._active) {
                this._createEditPanel();
            } else {
                this._createInsertPanel();
            }
        }
    }, {
        key: '_createEditPanel',
        value: function _createEditPanel() {
            var editor = this.editor;

            // id
            var width30 = getRandom('width-30');
            var width50 = getRandom('width-50');
            var width100 = getRandom('width-100');
            var delBtn = getRandom('del-btn'

            // tab 配置
            );var tabsConfig = [{
                title: '编辑图片',
                tpl: Vm$1('div', {}, [Vm$1('div', { class: 'eui-button-container', style: 'border-bottom:1px solid #f1f1f1;padding-bottom:5px;margin-bottom:5px;' }, [Vm$1('span', { style: 'float:left;font-size:14px;margin:4px 5px 0 5px;color:#333;' }, ['最大宽度：']), Vm$1('button', { id: width30, class: 'left' }, ['30%']), Vm$1('button', { id: width50, class: 'left' }, ['50%']), Vm$1('button', { id: width100, class: 'left' }, ['100%'])]), Vm$1('div', { class: 'eui-button-container' }, [Vm$1('button', { id: delBtn, class: 'gray left' }, ['删除图片'])])]),
                events: [{
                    selector: '#' + width30,
                    type: 'click',
                    fn: function fn() {
                        var img = editor._selectedImg;
                        if (img) {
                            img.style.maxWidth = '30%';
                        }
                        // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                        return true;
                    }
                }, {
                    selector: '#' + width50,
                    type: 'click',
                    fn: function fn() {
                        var img = editor._selectedImg;
                        if (img) {
                            img.style.maxWidth = '50%';
                        }
                        // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                        return true;
                    }
                }, {
                    selector: '#' + width100,
                    type: 'click',
                    fn: function fn() {
                        var img = editor._selectedImg;
                        if (img) {
                            img.style.maxWidth = '100%';
                        }
                        // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                        return true;
                    }
                }, {
                    selector: '#' + delBtn,
                    type: 'click',
                    fn: function fn() {
                        var img = editor._selectedImg;
                        if (img) {
                            img.remove();
                        }
                        // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                        return true;
                    }
                }]
            }];

            // 创建 panel 并显示
            var panel = new Panel(this, {
                width: 300,
                tabs: tabsConfig
            });
            panel.show

            // 记录属性
            ();this.panel = panel;
        }
    }, {
        key: '_createInsertPanel',
        value: function _createInsertPanel() {
            var editor = this.editor;
            var uploadImg = editor.uploadImg;
            var config = editor.config;

            // id
            var upTriggerId = getRandom('up-trigger');
            var upFileId = getRandom('up-file');
            var linkUrlId = getRandom('link-url');
            var linkBtnId = getRandom('link-btn'

            // tabs 的配置
            );var tabsConfig = [{
                title: '上传图片',
                tpl: Vm$1('div', { class: 'eui-up-img-container' }, [Vm$1('div', { id: upTriggerId, class: 'eui-up-btn' }, [Vm$1('i', { class: 'eicon eicon-upload' })]), Vm$1('div', { style: 'display: none;' }, [Vm$1('input', { id: upFileId, type: 'file', multiple: 'multiple', accept: 'image/jpg,image/jpeg,image/png,image/gif,image/bmp' })])]),
                events: [{
                    // 触发选择图片
                    selector: '#' + upTriggerId,
                    type: 'click',
                    fn: function fn() {
                        var fileElem = document.querySelector('#' + upFileId);
                        if (fileElem) {
                            fileElem.click();
                        } else {
                            // 返回 true 可关闭 panel
                            return true;
                        }
                    }
                }, {
                    // 选择图片完毕
                    selector: '#' + upFileId,
                    type: 'change',
                    fn: function fn() {
                        var fileElem = document.querySelector('#' + upFileId);
                        if (!fileElem) {
                            // 返回 true 可关闭 panel
                            return true;
                        }

                        // 获取选中的 file 对象列表
                        var fileList = fileElem.files;
                        if (fileList.length) {
                            uploadImg.uploadImg(fileList);
                        }

                        // 返回 true 可关闭 panel
                        return true;
                    }
                }]
            }, // first tab end
            {
                title: '网络图片',
                tpl: Vm$1('div', {}, [Vm$1('input', { id: linkUrlId, type: 'text', class: 'block', placeholder: '图片链接' }), Vm$1('div', { class: 'eui-button-container' }, [Vm$1('button', { id: linkBtnId, class: 'right' }, ['插入'])])]),
                events: [{
                    selector: '#' + linkBtnId,
                    type: 'click',
                    fn: function fn() {
                        var linkUrl = document.querySelector('#' + linkUrlId);
                        var url = linkUrl.value.trim();

                        if (url) {
                            uploadImg.insertLinkImg(url);
                        }

                        // 返回 true 表示函数执行结束之后关闭 panel
                        return true;
                    }
                }] // second tab end
            }]; // tabs end

            // 判断 tabs 的显示
            var tabsConfigResult = [];
            if ((config.uploadImgShowBase64 || config.uploadImgServer) && window.FileReader) {
                // 显示“上传图片”
                tabsConfigResult.push(tabsConfig[0]);
            }
            if (config.showLinkImg) {
                // 显示“网络图片”
                tabsConfigResult.push(tabsConfig[1]);
            }

            // 创建 panel 并显示
            var panel = new Panel(this, {
                width: 300,
                tabs: tabsConfigResult
            });
            panel.show

            // 记录属性
            ();this.panel = panel;
        }

        // 试图改变 active 状态

    }, {
        key: 'tryChangeActive',
        value: function tryChangeActive(e) {
            var editor = this.editor;
            var elem = this.elem;
            if (editor._selectedImg) {
                this._active = true;
                elem.classList.add('eui-active');
            } else {
                this._active = false;
                elem.classList.remove('eui-active');
            }
        }
    }]);
    return Image;
}();

/*
    menu - video
*/
var Video = function () {
    function Video(editor) {
        classCallCheck(this, Video);

        this.editor = editor;
        this.elem = Vm$1('div', { class: 'eui-menu-item' }, [Vm$1('i', { class: 'eicon eicon-insertvideo' })]), this.type = 'panel';

        // 当前是否 active 状态
        this._active = false;
    }

    createClass(Video, [{
        key: 'onClick',
        value: function onClick() {
            this._createPanel();
        }
    }, {
        key: '_createPanel',
        value: function _createPanel() {
            var _this = this;

            // 创建 id
            var textValId = getRandom('text-val');
            var btnId = getRandom('btn'

            // 创建 panel
            );var panel = new Panel(this, {
                width: 350,
                // 一个 panel 多个 tab
                tabs: [{
                    // 标题
                    title: '插入视频',
                    // 模板
                    tpl: Vm$1('div', {}, [Vm$1('input', { id: textValId, type: 'text', class: 'block', placeholder: '格式如：<iframe src=... ><\/iframe>' }), Vm$1('div', { class: 'eui-button-container' }, [Vm$1('button', { id: btnId, class: 'right' }, ['插入'])])]),
                    // 事件绑定
                    events: [{
                        selector: '#' + btnId,
                        type: 'click',
                        fn: function fn() {
                            var text = document.querySelector('#' + textValId);
                            var val = text.value.trim

                            // 测试用视频地址
                            // <iframe height=498 width=510 src='http://player.youku.com/embed/XMjcwMzc3MzM3Mg==' frameborder=0 'allowfullscreen'></iframe>

                            ();if (val) {
                                // 插入视频
                                _this._insert(val);
                            }

                            // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                            return true;
                        }
                    }] // first tab end
                }] // tabs end
            }); // panel end

            // 显示 panel
            panel.show

            // 记录属性
            ();this.panel = panel;
        }

        // 插入视频

    }, {
        key: '_insert',
        value: function _insert(val) {
            var editor = this.editor;
            editor.cmd.do('insertHTML', val + '<p><br></p>');
        }
    }]);
    return Video;
}();

/*
    menu - code
*/
var Code = function () {
    function Code(editor) {
        classCallCheck(this, Code);

        this.editor = editor;
        this.elem = Vm$1('div', { class: 'eui-menu-item' }, [Vm$1('i', { class: 'eicon eicon-insertcode' })]), this.type = 'panel';

        // 当前是否 active 状态
        this._active = false;
    }

    createClass(Code, [{
        key: 'onClick',
        value: function onClick(e) {
            var editor = this.editor;
            var startElem = editor.selection.getSelectionStartElem();
            var endElem = editor.selection.getSelectionEndElem();
            var isSeleEmpty = editor.selection.isSelectionEmpty();
            var selectionText = editor.selection.getSelectionText();
            var code = void 0;

            if (startElem !== endElem) {
                // 跨元素选择，不做处理
                editor.selection.restoreSelection();
                return;
            }
            if (!isSeleEmpty) {
                // 选取不是空，用 <code> 包裹即可
                code = Vm$1('code', {}, [selectionText]);
                editor.cmd.do('insertElem', code);
                editor.selection.createRangeByElem(code, false);
                editor.selection.restoreSelection();
                return;
            }

            // 选取是空，且没有夸元素选择，则插入 <pre><code></code></prev>
            if (this._active) {
                // 选中状态，将编辑内容
                this._createPanel(startElem.html());
            } else {
                // 未选中状态，将创建内容
                this._createPanel();
            }
        }
    }, {
        key: '_createPanel',
        value: function _createPanel(value) {
            var _this = this;

            // value - 要编辑的内容
            value = value || '';
            var type = !value ? 'new' : 'edit';
            var textId = getRandom('texxt');
            var btnId = getRandom('btn');

            var panel = new Panel(this, {
                width: 500,
                // 一个 Panel 包含多个 tab
                tabs: [{
                    // 标题
                    title: '插入代码',
                    // 模板
                    tpl: Vm$1('div', {}, [Vm$1('textarea', { id: textId, style: 'height: 145px;' }, [value]), Vm$1('div', { class: 'eui-button-container' }, [Vm$1('button', { id: btnId, class: 'right' }, ['插入'])])]),
                    // 事件绑定
                    events: [
                    // 插入代码
                    {
                        selector: '#' + btnId,
                        type: 'click',
                        fn: function fn() {
                            var $text = document.querySelector('#' + textId);
                            var text = $text.value || $text.innerHTML;
                            text = replaceHtmlSymbol(text);
                            if (type === 'new') {
                                // 新插入
                                _this._insertCode(text);
                            } else {
                                // 编辑更新
                                _this._updateCode(text);
                            }

                            // 返回 true，表示该事件执行完之后，panel 要关闭。否则 panel 不会关闭
                            return true;
                        }
                    }] // first tab end
                }] // tabs end
            }); // new Panel end

            // 显示 panel
            panel.show

            // 记录属性
            ();this.panel = panel;
        }

        // 插入代码

    }, {
        key: '_insertCode',
        value: function _insertCode(value) {
            var editor = this.editor;
            editor.cmd.do('insertHTML', '<pre><code>' + value + '</code></pre><p><br></p>');
        }

        // 更新代码

    }, {
        key: '_updateCode',
        value: function _updateCode(value) {
            var editor = this.editor;
            var selectionELem = editor.selection.getSelectionContainerElem();
            if (!selectionELem) {
                return;
            }
            selectionELem.html(value);
            editor.selection.restoreSelection();
        }

        // 试图改变 active 状态

    }, {
        key: 'tryChangeActive',
        value: function tryChangeActive(e) {
            var editor = this.editor;
            var elem = this.elem;
            var selectionELem = editor.selection.getSelectionContainerElem();
            if (!selectionELem) {
                return;
            }
            var parentElem = selectionELem.parentNode;
            if (selectionELem.nodeName === 'CODE' && parentElem.nodeName === 'PRE') {
                this._active = true;
                elem.classList.add('eui-active');
            } else {
                this._active = false;
                elem.classList.remove('eui-active');
            }
        }
    }]);
    return Code;
}();

/*
    所有菜单的汇总
*/

// 存储菜单的构造函数
var MenuConstructors = {};

MenuConstructors.bold = Bold;

MenuConstructors.italic = Italic;

MenuConstructors.underline = Underline;

MenuConstructors.head = Head;

MenuConstructors.strikeThrough = StrikeThrough;

MenuConstructors.undo = Undo;

MenuConstructors.redo = Redo;

MenuConstructors.foreColor = BackColor;

MenuConstructors.backColor = BackColor$1;

MenuConstructors.list = List;

MenuConstructors.justify = Justify;

MenuConstructors.quote = Quote;

MenuConstructors.image = Image;

MenuConstructors.video = Video;

MenuConstructors.code = Code;

/*
    菜单集合
*/
// 修改原型

var Menus = function () {
    function Menus(editor) {
        classCallCheck(this, Menus);

        this.editor = editor;
        this.menus = {};
        this.toolbar = {};
    }

    // 初始化菜单


    createClass(Menus, [{
        key: 'init',
        value: function init() {
            var _this = this;

            var editor = this.editor;
            var config = editor.config || {};
            var configMenus = config.menus || []; // 获取配置中的菜单

            // 根据配置信息，创建菜单
            configMenus.forEach(function (menuKey) {
                var MenuConstructor = void 0;
                if (Array.isArray(menuKey)) {
                    var group = [];
                    menuKey.forEach(function (item) {
                        MenuConstructor = MenuConstructors[item];
                        if (MenuConstructor && typeof MenuConstructor === 'function') {
                            // 创建单个菜单
                            _this.menus[item] = new MenuConstructor(editor);
                            group.push(_this.menus[item]);
                        }
                    });
                    _this.toolbar[menuKey[0]] = group;
                } else {
                    MenuConstructor = MenuConstructors[menuKey];
                    if (MenuConstructor && typeof MenuConstructor === 'function') {
                        // 创建单个菜单
                        _this.menus[menuKey] = new MenuConstructor(editor);
                        _this.toolbar[menuKey] = _this.menus[menuKey];
                    }
                }
            }

            // 添加到菜单栏
            );this._addToToolbar

            // 绑定事件
            ();this._bindEvent();
        }

        // 添加到菜单栏

    }, {
        key: '_addToToolbar',
        value: function _addToToolbar() {
            var editor = this.editor;
            var toolbarElem = editor.toolbarElem;
            var toolbar = this.toolbar;
            objForEach(toolbar, function (key, tool) {
                if (Array.isArray(tool)) {
                    var group = Vm$1('div', { class: 'eui-menu-group' });
                    tool.forEach(function (item) {
                        group.appendChild(item.elem);
                    });
                    toolbarElem.appendChild(group);
                } else {
                    if (tool.elem) {
                        toolbarElem.appendChild(tool.elem);
                    }
                }
            });
        }

        // 绑定菜单 click mouseenter 事件

    }, {
        key: '_bindEvent',
        value: function _bindEvent() {
            var menus = this.menus;
            var editor = this.editor;
            objForEach(menus, function (key, menu) {
                var type = menu.type;
                if (!type) return;

                var elem = menu.elem;
                var droplist = menu.droplist;
                var panel = menu.panel;

                // 点击类型，例如 bold
                if (type === 'click' && menu.onClick) {
                    elem.addEventListener('click', function (e) {
                        if (editor.selection.getRange() == null) return;
                        menu.onClick(e);
                    });
                }

                // 下拉框，例如 head
                if (type === 'droplist' && droplist) {
                    elem.addEventListener('mouseenter', function (e) {
                        if (editor.selection.getRange() == null) {
                            return;
                        }
                        // 显示
                        droplist.showTimeoutId = setTimeout(function () {
                            droplist.show();
                        }, 200);
                    });
                    elem.addEventListener('mouseleave', function (e) {
                        // 隐藏
                        droplist.hideTimeoutId = setTimeout(function () {
                            droplist.hide();
                        }, 0);
                    });
                }

                // 弹框类型，例如 link
                if (type === 'panel' && menu.onClick) {
                    elem.addEventListener('click', function (e) {
                        if (editor.selection.getRange() == null) {
                            return;
                        }
                        // 在自定义事件中显示 panel
                        menu.onClick(e);
                    });
                }
            });
        }

        // 尝试修改菜单状态

    }, {
        key: 'changeActive',
        value: function changeActive() {
            var menus = this.menus;
            objForEach(menus, function (key, menu) {
                if (menu.tryChangeActive) {
                    setTimeout(function () {
                        menu.tryChangeActive();
                    }, 100);
                }
            });
        }
    }]);
    return Menus;
}();

/*
    粘贴信息的处理
*/

// 获取粘贴的纯文本
function getPasteText(e) {
    var clipboardData = e.clipboardData || e.originalEvent.clipboardData;
    var pasteText = void 0;
    if (clipboardData == null) {
        pasteText = window.clipboardData && window.clipboardData.getData('text');
    } else {
        pasteText = clipboardData.getData('text/plain');
    }

    return replaceHtmlSymbol(pasteText);
}

// 获取粘贴的html
function getPasteHtml(e) {
    var clipboardData = e.clipboardData || e.originalEvent.clipboardData;
    var pasteText = void 0,
        pasteHtml = void 0;
    if (clipboardData == null) {
        pasteText = window.clipboardData && window.clipboardData.getData('text');
    } else {
        pasteText = clipboardData.getData('text/plain');
        pasteHtml = clipboardData.getData('text/html');
    }
    if (!pasteHtml && pasteText) {
        pasteHtml = '<p>' + replaceHtmlSymbol(pasteText) + '</p>';
    }
    if (!pasteHtml) {
        return;
    }

    // 过滤word中状态过来的无用字符
    var docSplitHtml = pasteHtml.split('</html>');
    if (docSplitHtml.length === 2) {
        pasteHtml = docSplitHtml[0];
    }

    // 过滤无用标签
    pasteHtml = pasteHtml.replace(/<(meta|script|link).+?>/igm, ''

    // 过滤样式
    );pasteHtml = pasteHtml.replace(/\s?(class|style)=('|").+?('|")/igm, '');

    return pasteHtml;
}

// 获取粘贴的图片文件
function getPasteImgs(e) {
    var result = [];
    var txt = getPasteText(e);
    if (txt) {
        // 有文字，就忽略图片
        return result;
    }

    var clipboardData = e.clipboardData || e.originalEvent.clipboardData || {};
    var items = clipboardData.items;
    if (!items) {
        return result;
    }

    objForEach(items, function (key, value) {
        var type = value.type;
        if (/image/i.test(type)) {
            result.push(value.getAsFile());
        }
    });

    return result;
}

/*
    编辑区域
*/
var Text = function () {
    function Text(editor) {
        classCallCheck(this, Text);

        this.editor = editor;
    }

    // 初始化


    createClass(Text, [{
        key: 'init',
        value: function init() {
            // 绑定事件
            this._bindEvent();
        }

        // 清空内容

    }, {
        key: 'clear',
        value: function clear() {
            this.html('<p><br></p>');
        }

        // 获取 设置 html

    }, {
        key: 'html',
        value: function html(val) {
            var editor = this.editor;
            var textElem = editor.textElem;
            if (!val) {
                return textElem.innerHTML;
            } else {
                if (val.indexOf('<') !== 0) {
                    val = '<p>' + val + '</p>';
                }
                textElem.innerHTML = val;
                this.focus();
            }
        }

        // 获取 设置 text

    }, {
        key: 'text',
        value: function text(val) {
            var editor = this.editor;
            var textElem = editor.textElem;
            if (!val) {
                return textElem.textContent;
            } else {
                textElem.innerHTML = '<p>' + val + '</p>';
                this.focus();
            }
        }

        // 追加内容

    }, {
        key: 'append',
        value: function append(html) {
            var editor = this.editor;
            var textElem = editor.textElem;
            if (html.indexOf('<') !== 0) {
                html = '<p>' + html + '</p>';
            }
            textElem.insertAdjacentHTML('beforeend', html);
        }

        // 编辑区聚焦

    }, {
        key: 'focus',
        value: function focus(toStart) {
            var editor = this.editor;
            var textElem = editor.textElem;
            var children = textElem.childNodes;
            if (!children.length) {
                // 如果编辑器区域无内容，添加一个空行，重新设置选区
                textElem.appendChild(Vm$1('p', {}, [Vm$1('br')]));
                this.focus();
                return;
            }

            var last = children[children.length - 1];
            editor.selection.createRangeByElem(last, !!toStart);
            editor.selection.restoreSelection();
        }

        // 绑定事件

    }, {
        key: '_bindEvent',
        value: function _bindEvent() {
            // 实时保存选取
            this._saveRangeRealTime

            // 按回车建时的特殊处理
            ();this._enterKeyHandle

            // 清空时保留 <p><br></p>
            ();this._clearHandle

            // 粘贴事件（粘贴文字，粘贴图片）
            ();this._pasteHandle

            // tab 特殊处理
            ();this._tabHandle

            // img 点击
            ();this._imgHandle();
        }

        // 实时保存选取

    }, {
        key: '_saveRangeRealTime',
        value: function _saveRangeRealTime() {
            var editor = this.editor;
            var textElem = editor.textElem;

            // 保存当前的选区
            function saveRange(e) {
                // 随时保存选区
                editor.selection.saveRange
                // 更新按钮 ative 状态
                ();editor.menus.changeActive();
            }
            // 按键后保存
            textElem.addEventListener('keyup', saveRange);
            textElem.addEventListener('mousedown', function (e) {
                // mousedown 状态下，鼠标滑动到编辑区域外面，也需要保存选区
                textElem.addEventListener('mouseleave', saveRange);
            });
            textElem.addEventListener('mouseup', function (e) {
                saveRange
                // 在编辑器区域之内完成点击，取消鼠标滑动到编辑区外面的事件
                ();textElem.removeEventListener('mouseleave', saveRange);
            });
        }

        // 按回车键时的特殊处理

    }, {
        key: '_enterKeyHandle',
        value: function _enterKeyHandle() {
            var editor = this.editor;
            var textElem = editor.textElem;

            // 将回车之后生成的非 <p> 的顶级标签，改为 <p>
            function pHandle(e) {
                var selectionElem = editor.selection.getSelectionContainerElem();
                var parentElem = selectionElem.parentNode;
                // 不是顶级标签
                if (parentElem !== textElem) return;

                var nodeName = selectionElem.nodeNmae;
                if (nodeName === 'P') {}
                // 当前的标签是 P ，不用做处理


                // 有内容，不做处理
                if (selectionElem.textContent) return;

                // 插入 <p> ，并将选取定位到 <p>，删除当前标签
                var p = Vm$1('p', {}, [Vm$1('br')]);
                selectionElem.parentNode.insertBefore(p, selectionElem);
                editor.selection.createRangeByElem(p, true);
                editor.selection.restoreSelection();
                selectionElem.remove();
            }

            textElem.addEventListener('keyup', function (e) {
                // 不是回车键
                if (e.keyCode !== 13) return;
                // 将回车之后生成的非 <p> 的顶级标签，改为 <p>
                pHandle(e);
            }

            // <pre><code></code></pre> 回车时 特殊处理
            );function codeHandle(e) {
                var selectionElem = editor.selection.getSelectionContainerElem();
                if (!selectionElem) return;

                var parentElem = selectionElem.parentNode;
                var selectionNodeName = selectionElem.nodeName;
                var parentNodeName = parentElem.nodeName;
                // 不符合要求 忽略
                if (selectionNodeName !== 'CODE' || parentNodeName !== 'PRE') return;

                // 必须原生支持 insertHTML 命令
                if (!editor.cmd.queryCommandSupported('insertHTML')) return;

                var _startOffset = editor.selection.getRange().startOffset;
                editor.cmd.do('insertHTML', '\n');
                editor.selection.saveRange();
                if (editor.selection.getRange().startOffset === _startOffset) {
                    // 没起作用，再来一遍
                    editor.cmd.do('insertHTML', '\n');
                }

                // 阻止默认行为
                e.preventDefault();
            }

            textElem.addEventListener('keydown', function (e) {
                // 不是回车键
                if (e.keyCode !== 13) return;
                // <pre><code></code></pre> 回车时 特殊处理
                codeHandle(e);
            });
        }

        // 清空时保留 <p><br></p>

    }, {
        key: '_clearHandle',
        value: function _clearHandle() {
            var editor = this.editor;
            var textElem = editor.textElem;

            textElem.addEventListener('keydown', function (e) {
                if (e.keyCode !== 8) return;

                var txtHtml = textElem.innerHTML.toLowerCase().trim();
                if (txtHtml === '<p><br></p>') {
                    // 最后剩下一个空行，就不再删除了
                    e.preventDefault();
                    return;
                }
            });

            textElem.addEventListener('keyup', function (e) {
                if (e.keyCode !== 8) return;
                var txtHtml = textElem.innerHTML.toLowerCase().trim

                // firefox 时用 txtHtml === '<br>' 判断，其他用 !txtHtml 判断
                ();if (!txtHtml || txtHtml === '<br>') {
                    // 内容空了
                    var p = Vm$1('p', {}, [Vm$1('br')]);
                    textElem.innerHTML = ''; // 一定要先清空，否则在 firefox 下有问题
                    textElem.appendChild(p);
                    editor.selection.createRangeByElem(p, false, true);
                    editor.selection.restoreSelection();
                }
            });
        }

        // 粘贴事件（粘贴文字 粘贴图片）

    }, {
        key: '_pasteHandle',
        value: function _pasteHandle() {
            var editor = this.editor;
            var textElem = editor.textElem;

            // 粘贴文字
            textElem.addEventListener('paste', function (e) {
                // 阻止默认行为，使用 execCommand 的粘贴命令
                e.preventDefault

                // 获取粘贴的文字
                ();var pasteText = void 0,
                    pasteHtml = void 0;

                var selectionElem = editor.selection.getSelectionContainerElem();
                if (!selectionElem) return;
                var nodeName = selectionElem.nodeName;

                // code 中粘贴忽略
                if (nodeName === 'CODE' || nodeName === 'PRE') return;

                // 表格中忽略，可能会出现异常问题
                if (nodeName === 'TD' || nodeName === 'TH') return;

                if (nodeName === 'DIV' || textElem.innerHTML === '<p><br></p>') {
                    // 是 div，可粘贴过滤样式的文字和链接

                    pasteHtml = getPasteHtml(e);
                    if (!pasteHtml) return;

                    editor.cmd.do('insertHTML', pasteHtml);
                } else {
                    // 不是 div，证明在已有内容的元素中粘贴，只粘贴纯文本

                    pasteText = getPasteText(e);
                    if (!pasteText) return;
                    editor.cmd.do('insertHTML', '<p>' + pasteText + '</p>');
                }
            }

            // 粘贴图片
            );textElem.addEventListener('paste', function (e) {
                e.preventDefault

                // 获取粘贴的图片
                ();var pasteFiles = getPasteImgs(e);
                if (!pasteFiles || !pasteFiles.length) return;

                // 获取当前的元素
                var selectionElem = editor.selection.getSelectionContainerElem();
                if (!selectionElem) return;

                var nodeName = selectionElem.nodeName;

                // code 中粘贴忽略
                if (nodeName === 'CODE' || nodeName === 'PRE') return;

                // 上传图片
                var uploadImg = editor.uploadImg;
                uploadImg.uploadImg(pasteFiles);
            });
        }

        // tab 特殊处理

    }, {
        key: '_tabHandle',
        value: function _tabHandle() {
            var editor = this.editor;
            var textElem = editor.textElem;

            textElem.addEventListener('keydown', function (e) {
                if (e.keyCode !== 9) return;
                // 必须原生支持 insertHTML 命令
                if (!editor.cmd.queryCommandSupported('insertHTML')) return;

                var selectionElem = editor.selection.getSelectionContainerElem();
                if (!selectionElem) return;

                var parentElem = selectionElem.parentNode;
                var selectionNodeName = selectionElem.nodeName;
                var parentNodeName = parentElem.nodeName;

                if (selectionNodeName === 'CODE' && parentNodeName === 'PRE') {
                    // <pre><code> 里面
                    editor.cmd.do('insertHTML', '    ');
                } else {
                    // 普通文字
                    editor.cmd.do('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;');
                }

                e.preventDefault();
            });
        }

        // img 点击

    }, {
        key: '_imgHandle',
        value: function _imgHandle() {
            var editor = this.editor;
            var textElem = editor.textElem;
            var selectedClass = 'eui-selected';

            // 为图片增加 selected 样式
            textElem.addEventListener('click', function (e) {
                if (e.target.matches('img')) {
                    var img = e.target;

                    // 去掉所有图片的 selected 样式
                    var arr = [];
                    arr.slice.call(textElem.querySelectorAll('img')).forEach(function (item) {
                        item.classList.remove(selectedClass);
                    }

                    // 为点击的图片增加样式，并记录当前图片
                    );img.classList.add(selectedClass);
                    editor._selectedImg = img;

                    // 修改选取
                    editor.selection.createRangeByElem(img);
                }
            }

            // 去掉图片的 selected 样式
            );textElem.addEventListener('click', function (e) {
                // 点击的是图片，忽略
                if (e.target.matches('img')) return;
                // 取消掉 selected 样式，并删除记录
                var arr = [];
                arr.slice.call(textElem.querySelectorAll('img')).forEach(function (item) {
                    item.classList.remove(selectedClass);
                });
                editor._selectedImg = null;
            });
            textElem.addEventListener('keyup', function (e) {
                // 点击的是图片，忽略
                if (e.target.matches('img')) return;
                // 取消掉 selected 样式，并删除记录
                var arr = [];
                arr.slice.call(textElem.querySelectorAll('img')).forEach(function (item) {
                    item.classList.remove(selectedClass);
                });
                editor._selectedImg = null;
            });
        }
    }]);
    return Text;
}();

var Command = function () {
    function Command(editor) {
        classCallCheck(this, Command);

        this.editor = editor;
    }

    createClass(Command, [{
        key: 'do',
        value: function _do(name, value) {
            var editor = this.editor;
            // 如果无选区， 忽略
            if (!editor.selection.getRange()) return;
            // 恢复选区
            editor.selection.restoreSelection
            // 执行
            ();var _name = '_' + name;
            if (this[_name]) {
                // 自定义事件
                this[_name](value);
            } else {
                // 默认 command
                this._execCommand(name, value);
            }
            // 修改菜单状态
            editor.menus.changeActive

            // 恢复选区保证光标在原来的位置闪烁 
            ();editor.selection.saveRange();
            editor.selection.restoreSelection

            // 触发 onchange
            ();editor.change && editor.change();
        }
        // 自定义 insertHTML 事件

    }, {
        key: '_insertHTML',
        value: function _insertHTML(html) {
            var editor = this.editor;
            var range = editor.selection.getRange

            // 保证传入的参数是 html 代码
            ();var test = /^<.+>$/.test(html);
            if (!test && !UA.isWebkit()) {
                // webkit 可以插入非 html 格式的文字
                throw new Error('执行 insertHTML 命令时传入的参数必须是 html 格式');
            }
            if (this.queryCommandSupported('insertHTML')) {
                // W3C
                this._execCommand('insertHTML', html);
            } else if (range.insertNode) {
                // IE
                range.deleteContents();
                range.insertNode(html);
            } else if (range.pasteHTML) {
                // IE <= 10
                range.pasteHTML(html);
            }
        }
        // 插入 elem

    }, {
        key: '_insertElem',
        value: function _insertElem(elem) {
            var editor = this.editor;
            var range = editor.selection.getRange();

            if (range.insertNode) {
                range.deleteContents();
                range.insertNode(elem[0]);
            }
        }
        // 封装 execCommand

    }, {
        key: '_execCommand',
        value: function _execCommand(name, value) {
            document.execCommand(name, false, value);
        }
        // 封装 document.queryCommandValue

    }, {
        key: 'queryCommandValue',
        value: function queryCommandValue(name) {
            return document.queryCommandValue(name);
        }

        // 封装 document.queryCommandState

    }, {
        key: 'queryCommandState',
        value: function queryCommandState(name) {
            return document.queryCommandState(name);
        }

        // 封装 document.queryCommandSupported

    }, {
        key: 'queryCommandSupported',
        value: function queryCommandSupported(name) {
            return document.queryCommandSupported(name);
        }
    }]);
    return Command;
}();

var Selection = function () {
    function Selection(editor) {
        classCallCheck(this, Selection);

        this.editor = editor;
        this._currentRange = null;
    }
    // 获取range对象


    createClass(Selection, [{
        key: 'getRange',
        value: function getRange() {
            return this._currentRange;
        }
        // 保存选区

    }, {
        key: 'saveRange',
        value: function saveRange(_range) {
            if (_range) {
                // 保存已有选区
                this._currentRange = _range;
                return;
            }

            // 获取当前的选区
            var selection = document.getSelection();
            if (selection.rangeCount === 0) return;
            var range = selection.getRangeAt(0

            // 判断选区内容是否在编辑内容之内
            );var containerElem = this.getSelectionContainerElem(range);
            if (!containerElem) return;
            var editor = this.editor;
            var textElem = editor.textElem;
            if (textElem.contains(containerElem)) {
                // 是编辑内容之内的
                this._currentRange = range;
            }
        }

        // 折叠选区

    }, {
        key: 'collapseRange',
        value: function collapseRange(toStart) {
            if (toStart == null) {
                // 默认为 false
                toStart = false;
            }
            var range = this._currentRange;
            if (range) {
                range.collapse(toStart);
            }
        }

        // 选中区域的文字

    }, {
        key: 'getSelectionText',
        value: function getSelectionText() {
            var range = this._currentRange;
            if (range) {
                return this._currentRange.toString();
            } else {
                return '';
            }
        }

        // 选区的 Elem

    }, {
        key: 'getSelectionContainerElem',
        value: function getSelectionContainerElem(range) {
            range = range || this._currentRange;
            var elem = void 0;
            if (range) {
                elem = range.commonAncestorContainer;
                return elem.nodeType === 1 ? elem : elem.parentNode;
            }
        }
    }, {
        key: 'getSelectionStartElem',
        value: function getSelectionStartElem(_range) {
            _range = _range || this._currentRange;
            var elem = void 0;
            if (_range) {
                elem = _range.startContainer;
                return elem.nodeType === 1 ? elem : elem.parentNode;
            }
        }
    }, {
        key: 'getSelectionEndElem',
        value: function getSelectionEndElem(_range) {
            _range = _range || this._currentRange;
            var elem = void 0;
            if (_range) {
                elem = _range.endContainer;
                return elem.nodeType === 1 ? elem : elem.parentNode;
            }
        }

        // 选区是否为空

    }, {
        key: 'isSelectionEmpty',
        value: function isSelectionEmpty() {
            var range = this._currentRange;
            if (range && range.startContainer) {
                if (range.startContainer === range.endContainer) {
                    if (range.startOffset === range.endOffset) {
                        return true;
                    }
                }
            }
            return false;
        }

        // 恢复选区

    }, {
        key: 'restoreSelection',
        value: function restoreSelection() {
            var selection = document.getSelection();
            selection.removeAllRanges();
            selection.addRange(this._currentRange);
        }

        // 创建一个空白（即 &#8203 字符）选区

    }, {
        key: 'createEmptyRange',
        value: function createEmptyRange() {
            var editor = this.editor;
            var range = this.getRange();
            var elem = void 0;

            // 当前无 range
            if (!range) return;
            // 当前选区必须没有内容才可以
            if (!this.isSelectionEmpty()) return;

            // 目前只支持 webkit 内核
            if (UA.isWebkit()) {
                // 插入 &#8203
                editor.cmd.do('insertHTML', '&#8203;'
                // 修改 offset 位置
                );range.setEnd(range.endContainer, range.endOffset + 1
                // 存储
                );this.saveRange(range);
            } else {
                elem = Vm$1('strong', {}, ['&#8203;']);
                editor.cmd.do('insertElem', elem);
                this.createRangeByElem(elem, true);
            }
        }

        // 根据 Elem 设置选区

    }, {
        key: 'createRangeByElem',
        value: function createRangeByElem(elem, toStart, isContent) {
            // elem - 经过封装的 elem
            // toStart - true 开始位置，false 结束位置
            // isContent - 是否选中Elem的内容
            if (!elem) return;

            var range = document.createRange();

            if (isContent) {
                range.selectNodeContents(elem);
            } else {
                range.selectNode(elem);
            }

            if (typeof toStart === 'boolean') {
                range.collapse(toStart);
            }

            // 存储 range
            this.saveRange(range);
        }
    }]);
    return Selection;
}();

/*
    上传进度条
*/

var Progress = function () {
    function Progress(editor) {
        classCallCheck(this, Progress);

        this.editor = editor;
        this._time = 0;
        this._isShow = false;
        this._isRender = false;
        this._timeoutId = 0;
        this.textContainer = editor.textContainerElem;
        this.bar = Vm$1('div', { class: 'eui-progress' });
    }

    createClass(Progress, [{
        key: 'show',
        value: function show(progress) {
            var _this = this;

            // 状态处理
            if (this._isShow) {
                return;
            }
            this._isShow = true;

            // 渲染
            var bar = this.bar;
            if (!this._isRender) {
                var textContainer = this.textContainer;
                textContainer.appendChild(bar);
            } else {
                this._isRender = true;
            }

            // 改变进度（节流，100ms 渲染一次）
            if (Date.now() - this._time > 100) {
                if (progress <= 1) {
                    bar.style.width = progress * 100 + '%';
                    this._time = Date.now();
                }
            }

            // 隐藏
            var timeoutId = this._timeoutId;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(function () {
                _this._hide();
            }, 500);
        }
    }, {
        key: '_hide',
        value: function _hide() {
            var bar = this.bar;
            bar.remove

            // 修改状态
            ();this._time = 0;
            this._isShow = false;
            this._isRender = false;
        }
    }]);
    return Progress;
}();

/*
    上传图片
*/

var UploadImg = function () {
    function UploadImg(editor) {
        classCallCheck(this, UploadImg);

        this.editor = editor;
    }

    // 根据 debug 弹出不同的信息


    createClass(UploadImg, [{
        key: '_alert',
        value: function _alert(alertInfo, debugInfo) {
            var editor = this.editor;
            var debug = editor.config.debug;

            if (debug) {
                throw new Error('SEditor: ' + (debugInfo || alertInfo));
            } else {
                alert(alertInfo);
            }
        }

        // 根据链接插入图片

    }, {
        key: 'insertLinkImg',
        value: function insertLinkImg(link) {
            var _this2 = this;

            if (!link) {
                return;
            }
            var editor = this.editor;

            var img = document.createElement('img');
            img.onload = function () {
                img = null;
                editor.cmd.do('insertHTML', '<img src="' + link + '" style="max-width:100%;"/>');
            };
            img.onerror = function () {
                img = null;
                // 无法成功下载图片
                _this2._alert('插入图片错误', 'SEditor: \u63D2\u5165\u56FE\u7247\u51FA\u9519\uFF0C\u56FE\u7247\u94FE\u63A5\u662F "' + link + '"\uFF0C\u4E0B\u8F7D\u8BE5\u94FE\u63A5\u5931\u8D25');
                return;
            };
            img.onabort = function () {
                img = null;
            };
            img.src = link;
        }

        // 上传图片

    }, {
        key: 'uploadImg',
        value: function uploadImg(files) {
            var _this3 = this;

            if (!files || !files.length) {
                return;
            }

            // ------------------------------ 获取配置信息 ------------------------------
            var editor = this.editor;
            var config = editor.config;
            var maxSize = config.uploadImgMaxSize;
            var maxSizeM = maxSize / 1000 / 1000;
            var maxLength = config.uploadImgMaxLength || 10000;
            var uploadImgServer = config.uploadImgServer;
            var uploadImgShowBase64 = config.uploadImgShowBase64;
            var uploadFileName = config.uploadFileName || '';
            var uploadImgParams = config.uploadImgParams || {};
            var uploadImgHeaders = config.uploadImgHeaders || {};
            var hooks = config.uploadImgHooks || {};
            var timeout = config.uploadImgTimeout || 3000;
            var withCredentials = config.withCredentials;
            if (withCredentials == null) {
                withCredentials = false;
            }

            // ------------------------------ 验证文件信息 ------------------------------
            var resultFiles = [];
            var errInfo = [];
            arrForEach(files, function (file) {
                var name = file.name;
                var size = file.size;
                if (/\.(jpg|jpeg|png|bmp|gif)$/i.test(name) === false) {
                    // 后缀名不合法，不是图片
                    errInfo.push('\u3010' + name + '\u3011\u4E0D\u662F\u56FE\u7247');
                    return;
                }
                if (maxSize < size) {
                    // 上传图片过大
                    errInfo.push('\u3010' + name + '\u3011\u5927\u4E8E ' + maxSizeM + 'M');
                    return;
                }

                // 验证通过的加入结果列表
                resultFiles.push(file);
            }
            // 抛出验证信息
            );if (errInfo.length) {
                this._alert('图片验证未通过: \n' + errInfo.join('\n'));
                return;
            }
            if (resultFiles.length > maxLength) {
                this._alert('一次最多上传' + maxLength + '张图片');
                return;
            }

            // 添加图片数据
            var formdata = new FormData();
            arrForEach(resultFiles, function (file) {
                var name = uploadFileName || file.name;
                formdata.append(name, file);
            }

            // ------------------------------ 上传图片 ------------------------------
            );if (uploadImgServer && typeof uploadImgServer === 'string') {
                // 添加参数
                var uploadImgServerArr = uploadImgServer.split('#');
                uploadImgServer = uploadImgServerArr[0];
                var uploadImgServerHash = uploadImgServerArr[1] || '';
                objForEach(uploadImgParams, function (key, val) {
                    val = encodeURIComponent(val

                    // 第一，将参数拼接到 url 中
                    );if (uploadImgServer.indexOf('?') > 0) {
                        uploadImgServer += '&';
                    } else {
                        uploadImgServer += '?';
                    }
                    uploadImgServer = uploadImgServer + key + '=' + val;

                    // 第二，将参数添加到 formdata 中
                    formdata.append(key, val);
                });
                if (uploadImgServerHash) {
                    uploadImgServer += '#' + uploadImgServerHash;
                }

                // 定义 xhr
                var xhr = new XMLHttpRequest();
                xhr.open('POST', uploadImgServer

                // 设置超时
                );xhr.timeout = timeout;
                xhr.ontimeout = function () {
                    // hook - timeout
                    if (hooks.timeout && typeof hooks.timeout === 'function') {
                        hooks.timeout(xhr, editor);
                    }

                    _this3._alert('上传图片超时');
                };

                // 监控 progress
                if (xhr.upload) {
                    xhr.upload.onprogress = function (e) {
                        var percent = void 0;
                        // 进度条
                        var progressBar = new Progress(editor);
                        if (e.lengthComputable) {
                            percent = e.loaded / e.total;
                            progressBar.show(percent);
                        }
                    };
                }

                // 返回数据
                xhr.onreadystatechange = function () {
                    var result = void 0;
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        if (xhr.status !== 200) {
                            // hook - error
                            if (hooks.error && typeof hooks.error === 'function') {
                                hooks.error(xhr, editor);
                            }

                            // xhr 返回状态错误
                            _this3._alert('上传图片发生错误', '\u4E0A\u4F20\u56FE\u7247\u53D1\u751F\u9519\u8BEF\uFF0C\u670D\u52A1\u5668\u8FD4\u56DE\u72B6\u6001\u662F ' + xhr.status);
                            return;
                        }

                        result = xhr.responseText;
                        if ((typeof result === 'undefined' ? 'undefined' : _typeof(result)) !== 'object') {
                            try {
                                result = JSON.parse(result);
                            } catch (ex) {
                                // hook - fail
                                if (hooks.fail && typeof hooks.fail === 'function') {
                                    hooks.fail(xhr, editor, result);
                                }

                                _this3._alert('上传图片失败', '上传图片返回结果错误，返回结果是: ' + result);
                                return;
                            }
                        }
                        if (result.errno != '0') {
                            // hook - fail
                            if (hooks.fail && typeof hooks.fail === 'function') {
                                hooks.fail(xhr, editor, result);
                            }

                            // 数据错误
                            _this3._alert('上传图片失败', '上传图片返回结果错误，返回结果 errno=' + result.errno);
                        } else {
                            if (hooks.customInsert && typeof hooks.customInsert === 'function') {
                                // 使用者自定义插入方法
                                hooks.customInsert(_this3.insertLinkImg.bind(_this3), result, editor);
                            } else {
                                // 将图片插入编辑器
                                var data = result.data || [];
                                data.forEach(function (link) {
                                    _this3.insertLinkImg(link);
                                });
                            }

                            // hook - success
                            if (hooks.success && typeof hooks.success === 'function') {
                                hooks.success(xhr, editor, result);
                            }
                        }
                    }
                };

                // hook - before
                if (hooks.before && typeof hooks.before === 'function') {
                    hooks.before(xhr, editor, resultFiles);
                }

                // 自定义 headers
                objForEach(uploadImgHeaders, function (key, val) {
                    xhr.setRequestHeader(key, val);
                }

                // 跨域传 cookie
                );xhr.withCredentials = withCredentials;

                // 发送请求
                xhr.send(formdata

                // 注意，要 return 。不去操作接下来的 base64 显示方式
                );return;
            }

            // 显示 base64 格式
            if (uploadImgShowBase64) {
                arrForEach(files, function (file) {
                    var _this = _this3;
                    var reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = function () {
                        _this.insertLinkImg(this.result);
                    };
                });
            }
        }
    }]);
    return UploadImg;
}();

var eid = 1;

var Editor = function () {
    function Editor(toolbarSelector, textSelector) {
        classCallCheck(this, Editor);

        if (!toolbarSelector) {
            // 没有传入任何参数，报错
            throw new Error('错误：初始化编辑器时候未传入任何参数，请查阅文档');
        }
        // id，用以区分单个页面不同的编辑器对象
        this.id = 'SEditor-' + eid++;

        this.toolbarSelector = toolbarSelector;
        this.textSelector = textSelector;

        // 自定义配置
        this.customConfig = {};
    }

    createClass(Editor, [{
        key: '_initDom',
        value: function _initDom() {
            var _this = this;

            var toolbarSelector = this.toolbarSelector;
            var textSelector = this.textSelector;
            var wrap = document.querySelector(toolbarSelector

            // 定义变量
            );var toolbarElem = void 0,
                textContainerElem = void 0,
                textElem = void 0,
                defaultContent = void 0;

            if (!textSelector) {
                // 只传入一个参数，即是容器的选择器或元素，toolbar 和 text 的元素自行创建
                toolbarElem = Vm$1('div', { class: 'eui-toolbar', style: 'background-color: #f1f1f1; border: 1px solid #ccc' });
                textContainerElem = Vm$1('div', { class: 'eui-container', style: 'border: 1px solid #ccc; border-top: none; height: 300px' }
                // 将编辑器区域原有的内容，暂存起来
                );defaultContent = wrap.innerHTML;
                wrap.innerHTML = '';

                // 添加到 DOM 结构中
                wrap.appendChild(toolbarElem);
                wrap.appendChild(textContainerElem);
            } else {
                // toolbar 和 text 的选择器都有值，记录属性
                toolbarElem = document.querySelector(toolbarSelector);
                toolbarElem.classList.add('eui-toolbar');
                textContainerElem = document.querySelector(textSelector);
                textContainerElem.classList.add('eui-container'
                // 将编辑器区域原有的内容，暂存起来
                );defaultContent = textContainerElem.innerHTML;
                textContainerElem.innerHTML = '';
            }

            // 编辑区域
            textElem = Vm$1('div', { class: 'eui-content', style: 'width: 100%; height: 100%;', contenteditable: true }

            // 初始化编辑区域内容
            );if (defaultContent) {
                if (defaultContent.indexOf('<') !== 0) {
                    defaultContent = '<p>' + defaultContent + '</p>';
                }
                textElem.innerHTML = defaultContent;
            } else {
                textElem.appendChild(Vm$1('p', {}, [Vm$1('br')]));
            }

            // 编辑区域加入DOM
            textContainerElem.appendChild(textElem

            // 记录属性
            );this.toolbarElem = toolbarElem;
            this.textContainerElem = textContainerElem;
            this.textElem = textElem;

            // 绑定 onchange
            textContainerElem.addEventListener('click', function () {
                _this.change && _this.change();
            });
            textContainerElem.addEventListener('keyup', function () {
                _this.change && _this.change();
            });
            toolbarElem.addEventListener('click', function () {
                _this.change && _this.change();
            });
        }

        // 初始化配置

    }, {
        key: '_initConfig',
        value: function _initConfig() {
            // _config 是默认配置，this.customConfig 是用户自定义配置，将它们 merge 之后再赋值
            this.config = Object.assign({}, config, this.customConfig);
        }

        // 封装 command

    }, {
        key: '_initCommand',
        value: function _initCommand() {
            this.cmd = new Command(this);
        }

        // 封装 selection range API

    }, {
        key: '_initSelectionAPI',
        value: function _initSelectionAPI() {
            this.selection = new Selection(this);
        }

        // 添加图片上传

    }, {
        key: '_initUploadImg',
        value: function _initUploadImg() {
            this.uploadImg = new UploadImg(this);
        }

        // 初始化菜单

    }, {
        key: '_initMenus',
        value: function _initMenus() {
            this.menus = new Menus(this);
            this.menus.init();
        }

        // 添加 text 区域

    }, {
        key: '_initText',
        value: function _initText() {
            this.content = new Text(this);
            this.content.init();
        }

        // 绑定事件

    }, {
        key: '_bindEvent',
        value: function _bindEvent() {
            // -------- 绑定 onchange 事件 --------
            var onChangeTimeoutId = 0;
            var beforeChangeHtml = this.content.html();
            var config$$1 = this.config;
            var onchange = config$$1.onchange;
            if (onchange && typeof onchange === 'function') {
                // 触发 change 的有三个场景：
                // 1. textContainerElem event 'click keyup'
                // 2. toolbarElem.event 'click'
                // 3. editor.cmd.do()
                this.change = function () {
                    var _this2 = this;

                    // 判断是否有变化
                    var currentHtml = this.content.html();
                    if (currentHtml.length === beforeChangeHtml.length) return;

                    // 执行，使用节流
                    if (onChangeTimeoutId) {
                        clearTimeout(onChangeTimeoutId);
                    }
                    onChangeTimeoutId = setTimeout(function () {
                        // 触发配置的 onchange 函数
                        onchange(currentHtml, _this2);
                        beforeChangeHtml = currentHtml;
                    }, 200);
                };
            }
        }

        // 创建编辑器

    }, {
        key: 'create',
        value: function create() {
            // 初始化 DOM
            this._initDom

            // 初始化配置信息
            ();this._initConfig

            // 封装 command API
            ();this._initCommand

            // 封装 selection range API
            ();this._initSelectionAPI

            // 添加 text
            ();this._initText

            // 初始化菜单
            ();this._initMenus

            // 添加 图片上传
            ();this._initUploadImg

            // 选区聚焦
            ();this.content.focus

            // 绑定事件
            ();this._bindEvent();
        }
    }]);
    return Editor;
}();

// 检验是否浏览器环境
try {
    document;
} catch (ex) {
    throw new Error('请在浏览器环境下运行');
}

// 这里的 `inlinecss` 将被替换成 css 代码的内容，详情可去 ./gulpfile.js 中搜索 `inlinecss` 关键字
var inlinecss = '.eui-toolbar,.eui-container,.eui-menu-panel {  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;  font-size: 14px;  padding: 0;  margin: 0;  -webkit-box-sizing: border-box;          box-sizing: border-box;}.eui-toolbar *,.eui-container *,.eui-menu-panel * {  padding: 0;  margin: 0;  -webkit-box-sizing: border-box;          box-sizing: border-box;}.eui-menu-item .eui-droplist {  position: absolute;  left: 0;  top: 0;  background-color: #fff;  border: 1px solid #f1f1f1;  border-right-color: #ccc;  border-bottom-color: #ccc;}.eui-menu-item .eui-droplist .eui-drop-title {  text-align: center;  color: #999;  line-height: 2;  border-bottom: 1px solid #f1f1f1;  font-size: 13px;}.eui-menu-item .eui-droplist ul.eui-drop-list {  list-style: none;  line-height: 1;}.eui-menu-item .eui-droplist ul.eui-drop-list li.eui-drop-item {  line-height: 1.5;  color: #333;  padding: 5px 0;}.eui-menu-item .eui-droplist ul.eui-drop-list li.eui-drop-item:hover {  background-color: #f1f1f1;}.eui-menu-item .eui-droplist ul.eui-drop-block {  list-style: none;  text-align: left;  padding: 5px;}.eui-menu-item .eui-droplist ul.eui-drop-block li.eui-drop-item {  display: inline-block;  *display: inline;  *zoom: 1;  padding: 3px 5px;}.eui-menu-item .eui-droplist ul.eui-drop-block li.eui-drop-item:hover {  background-color: #f1f1f1;}@font-face {  font-family: "iconfont";  src: url(data:application/x-font-eot;charset=utf-8;base64,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);  /* IE9*/  src: url(data:application/x-font-eot;charset=utf-8;base64,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) format(\'embedded-opentype\'), /* IE6-IE8 */ url(data:application/x-font-woff;charset=utf-8;base64,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) format(\'woff\'), /* chrome, firefox */ url(data:application/x-font-ttf;charset=utf-8;base64,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) format(\'truetype\'), /* chrome, firefox, opera, Safari, Android, iOS 4.2+*/ url(data:application/x-font-svg;charset=utf-8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiID4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8bWV0YWRhdGE+CkNyZWF0ZWQgYnkgRm9udEZvcmdlIDIwMTIwNzMxIGF0IFN1biBKdW4gMTEgMTk6MTg6MjEgMjAxNwogQnkgYWRtaW4KPC9tZXRhZGF0YT4KPGRlZnM+Cjxmb250IGlkPSJpY29uZm9udCIgaG9yaXotYWR2LXg9IjEwMjQiID4KICA8Zm9udC1mYWNlIAogICAgZm9udC1mYW1pbHk9Imljb25mb250IgogICAgZm9udC13ZWlnaHQ9IjUwMCIKICAgIGZvbnQtc3RyZXRjaD0ibm9ybWFsIgogICAgdW5pdHMtcGVyLWVtPSIxMDI0IgogICAgcGFub3NlLTE9IjIgMCA2IDMgMCAwIDAgMCAwIDAiCiAgICBhc2NlbnQ9Ijg5NiIKICAgIGRlc2NlbnQ9Ii0xMjgiCiAgICB4LWhlaWdodD0iNzkyIgogICAgYmJveD0iMTUgLTEwNyAxMDcxIDg3NSIKICAgIHVuZGVybGluZS10aGlja25lc3M9IjAiCiAgICB1bmRlcmxpbmUtcG9zaXRpb249IjAiCiAgICB1bmljb2RlLXJhbmdlPSJVKzAwNzgtRTc5RSIKICAvPgo8bWlzc2luZy1nbHlwaCAKIC8+CiAgICA8Z2x5cGggZ2x5cGgtbmFtZT0iLm5vdGRlZiIgCiAvPgogICAgPGdseXBoIGdseXBoLW5hbWU9Ii5ub3RkZWYiIAogLz4KICAgIDxnbHlwaCBnbHlwaC1uYW1lPSIubnVsbCIgaG9yaXotYWR2LXg9IjAiIAogLz4KICAgIDxnbHlwaCBnbHlwaC1uYW1lPSJub25tYXJraW5ncmV0dXJuIiBob3Jpei1hZHYteD0iMzQxIiAKIC8+CiAgICA8Z2x5cGggZ2x5cGgtbmFtZT0ieCIgdW5pY29kZT0ieCIgaG9yaXotYWR2LXg9IjEwMDEiIApkPSJNMjgxIDU0M3EtMjcgLTEgLTUzIC0xaC04M3EtMTggMCAtMzYuNSAtNnQtMzIuNSAtMTguNXQtMjMgLTMydC05IC00NS41di03Nmg5MTJ2NDFxMCAxNiAtMC41IDMwdC0wLjUgMThxMCAxMyAtNSAyOXQtMTcgMjkuNXQtMzEuNSAyMi41dC00OS41IDloLTEzM3YtOTdoLTQzOHY5N3pNOTU1IDMxMHYtNTJxMCAtMjMgMC41IC01MnQwLjUgLTU4dC0xMC41IC00Ny41dC0yNiAtMzB0LTMzIC0xNnQtMzEuNSAtNC41cS0xNCAtMSAtMjkuNSAtMC41CnQtMjkuNSAwLjVoLTMybC00NSAxMjhoLTQzOWwtNDQgLTEyOGgtMjloLTM0cS0yMCAwIC00NSAxcS0yNSAwIC00MSA5LjV0LTI1LjUgMjN0LTEzLjUgMjkuNXQtNCAzMHYxNjdoOTExek0xNjMgMjQ3cS0xMiAwIC0yMSAtOC41dC05IC0yMS41dDkgLTIxLjV0MjEgLTguNXExMyAwIDIyIDguNXQ5IDIxLjV0LTkgMjEuNXQtMjIgOC41ek0zMTYgMTIzcS04IC0yNiAtMTQgLTQ4cS01IC0xOSAtMTAuNSAtMzd0LTcuNSAtMjV0LTMgLTE1dDEgLTE0LjUKdDkuNSAtMTAuNXQyMS41IC00aDM3aDY3aDgxaDgwaDY0aDM2cTIzIDAgMzQgMTJ0MiAzOHEtNSAxMyAtOS41IDMwLjV0LTkuNSAzNC41cS01IDE5IC0xMSAzOWgtMzY4ek0zMzYgNDk4djIyOHEwIDExIDIuNSAyM3QxMCAyMS41dDIwLjUgMTUuNXQzNCA2aDE4OHEzMSAwIDUxLjUgLTE0LjV0MjAuNSAtNTIuNXYtMjI3aC0zMjd6IiAvPgogICAgPGdseXBoIGdseXBoLW5hbWU9InF1b3RlcyIgdW5pY29kZT0iJiN4ZTYwYjsiIApkPSJNNDg3IDY4M3EtNSAxNiAtMjAuNSAyNHQtMzEuNSAzcS03MSAtMjQgLTEzMCAtNTd0LTk4LjUgLTY2LjV0LTcxLjUgLTcyLjV0LTQ5LjUgLTcxdC0zMC41IC02NXEtMjggLTUwIC0yOCAtMTA3cTAgLTg5IDYzIC0xNTJ0MTUyLjUgLTYzdDE1Mi41IDYzdDYzIDE1MnEwIDc4IC00OSAxMzd0LTEyMyA3NXYwcS0xNSA2IC0xOS41IDE1LjV0MSAxOS41dDkuNSAxNS41dDggOS41cTc1IDU1IDE3NiA4OHExNiA1IDIzLjUgMjAuNXQyLjUgMzEuNXoKTTk5NiA2ODNxLTUgMTYgLTIwLjUgMjR0LTMxLjUgM3EtNzEgLTI0IC0xMzAgLTU3dC05OSAtNjYuNXQtNzEuNSAtNzIuNXQtNDkgLTcxdC0zMC41IC02NXEtMjggLTUwIC0yOCAtMTA3cTAgLTg5IDYzIC0xNTJ0MTUyLjUgLTYzdDE1Mi41IDYzdDYzIDE1MnEwIDc4IC00OSAxMzd0LTEyMyA3NXYwcS0xNiA2IC0yMCAxNS41dDEgMTkuNXQ5LjUgMTUuNXQ4LjUgOS41cTc1IDU1IDE3NSA4OHExNyA1IDI0LjUgMjAuNXQyLjUgMzEuNXoiIC8+CiAgICA8Z2x5cGggZ2x5cGgtbmFtZT0ianVzdGlmeWNlbnRlciIgdW5pY29kZT0iJiN4ZTYwMTsiIApkPSJNMTAwMyAxMDN2LTcwcTAgLTE0IC0xMC41IC0yNC41dC0yNC41IC0xMC41aC05MTJxLTE0IDAgLTI0LjUgMTAuNXQtMTAuNSAyNC41djcwcTAgMTQgMTAuNSAyNC41dDI0LjUgMTAuNWg5MTJxMTQgMCAyNC41IC0xMC41dDEwLjUgLTI0LjV6TTc5MyAzMTN2LTcwcTAgLTE0IC0xMC41IC0yNC41dC0yNS41IC0xMC41aC00OTBxLTE1IDAgLTI1LjUgMTAuNXQtMTAuNSAyNC41djcwcTAgMTUgMTAuNSAyNXQyNS41IDEwaDQ5MApxMTUgMCAyNS41IC0xMHQxMC41IC0yNXpNOTMzIDUyNHYtNzBxMCAtMTUgLTEwLjUgLTI1dC0yNC41IC0xMGgtNzcycS0xNCAwIC0yNC41IDEwdC0xMC41IDI1djcwcTAgMTQgMTAuNSAyNC41dDI0LjUgMTAuNWg3NzJxMTQgMCAyNC41IC0xMC41dDEwLjUgLTI0LjV6TTcyMiA3MzR2LTcwcTAgLTE0IC0xMCAtMjQuNXQtMjUgLTEwLjVoLTM1MHEtMTUgMCAtMjUgMTAuNXQtMTAgMjQuNXY3MHEwIDE0IDEwIDI0LjV0MjUgMTAuNWgzNTAKcTE1IDAgMjUgLTEwLjV0MTAgLTI0LjV6IiAvPgogICAgPGdseXBoIGdseXBoLW5hbWU9Imp1c3RpZnlmdWxsIiB1bmljb2RlPSImI3hlNjAyOyIgCmQ9Ik0xMDAzIDExMHYtNzBxMCAtMTQgLTEwLjUgLTI0LjV0LTI0LjUgLTEwLjVoLTkxMnEtMTQgMCAtMjQuNSAxMC41dC0xMC41IDI0LjV2NzBxMCAxNCAxMC41IDI0LjV0MjQuNSAxMC41aDkxMnExNCAwIDI0LjUgLTEwLjV0MTAuNSAtMjQuNXpNMTAwMyAzMjB2LTcwcTAgLTE0IC0xMC41IC0yNC41dC0yNC41IC0xMC41aC05MTJxLTE0IDAgLTI0LjUgMTAuNXQtMTAuNSAyNC41djcwcTAgMTUgMTAuNSAyNS41dDI0LjUgMTAuNWg5MTIKcTE0IDAgMjQuNSAtMTAuNXQxMC41IC0yNS41ek0xMDAzIDUzMXYtNzBxMCAtMTQgLTEwLjUgLTI0LjV0LTI0LjUgLTEwLjVoLTkxMnEtMTQgMCAtMjQuNSAxMC41dC0xMC41IDI0LjV2NzBxMCAxNCAxMC41IDI0LjV0MjQuNSAxMC41aDkxMnExNCAwIDI0LjUgLTEwLjV0MTAuNSAtMjQuNXpNMTAwMyA3NDF2LTcwcTAgLTE0IC0xMC41IC0yNC41dC0yNC41IC0xMC41aC05MTJxLTE0IDAgLTI0LjUgMTAuNXQtMTAuNSAyNC41djcwCnEwIDE0IDEwLjUgMjQuNXQyNC41IDEwLjVoOTEycTE0IDAgMjQuNSAtMTAuNXQxMC41IC0yNC41eiIgLz4KICAgIDxnbHlwaCBnbHlwaC1uYW1lPSJqdXN0aWZ5cmlnaHQiIHVuaWNvZGU9IiYjeGU2MDM7IiAKZD0iTTEwMDMgMTAzdi03MHEwIC0xNCAtMTAuNSAtMjQuNXQtMjQuNSAtMTAuNWgtOTEycS0xNCAwIC0yNC41IDEwLjV0LTEwLjUgMjQuNXY3MHEwIDE0IDEwLjUgMjQuNXQyNC41IDEwLjVoOTEycTE0IDAgMjQuNSAtMTAuNXQxMC41IC0yNC41ek0xMDAzIDMxM3YtNzBxMCAtMTQgLTEwLjUgLTI0LjV0LTI0LjUgLTEwLjVoLTcwMXEtMTUgMCAtMjUuNSAxMC41dC0xMC41IDI0LjV2NzBxMCAxNSAxMC41IDI1dDI1LjUgMTBoNzAxCnExNCAwIDI0LjUgLTEwdDEwLjUgLTI1ek0xMDAzIDUyNHYtNzBxMCAtMTUgLTEwLjUgLTI1dC0yNC41IC0xMGgtODQycS0xNCAwIC0yNC41IDEwdC0xMC41IDI1djcwcTAgMTQgMTAuNSAyNC41dDI0LjUgMTAuNWg4NDJxMTQgMCAyNC41IC0xMC41dDEwLjUgLTI0LjV6TTEwMDMgNzM0di03MHEwIC0xNCAtMTAuNSAtMjQuNXQtMjQuNSAtMTAuNWgtNjMxcS0xNSAwIC0yNSAxMC41dC0xMCAyNC41djcwcTAgMTQgMTAgMjQuNXQyNSAxMC41aDYzMQpxMTQgMCAyNC41IC0xMC41dDEwLjUgLTI0LjV6IiAvPgogICAgPGdseXBoIGdseXBoLW5hbWU9ImNvZGUiIHVuaWNvZGU9IiYjeGU2MTI7IiBob3Jpei1hZHYteD0iMTA5OCIgCmQ9Ik0zNTMgMTE4bC0yOSAtMjlxLTYgLTUgLTEzLjUgLTV0LTEyLjUgNWwtMjY3IDI2N3EtNSA1IC01IDEyLjV0NSAxMy41bDI2NyAyNjZxNSA2IDEyLjUgNnQxMy41IC02bDI5IC0yOHE1IC02IDUgLTEzLjV0LTUgLTEzLjVsLTIyNSAtMjI0bDIyNSAtMjI1cTUgLTYgNSAtMTN0LTUgLTEzdjB6TTY5MCA3MjhsLTIxMyAtNzM4cS0yIC04IC04LjUgLTExLjV0LTEzLjUgLTEuNWwtMzYgMTBxLTcgMiAtMTAuNSA4LjV0LTEuNSAxNC41bDIxMyA3MzgKcTIgNyA4LjUgMTF0MTMuNSAxbDM2IC0xMHE3IC0yIDExIC04LjV0MSAtMTMuNXpNMTA2NiAzNTZsLTI2NyAtMjY3cS01IC01IC0xMi41IC01dC0xMy41IDVsLTI4IDI5cS02IDYgLTYgMTN0NiAxM2wyMjQgMjI1bC0yMjQgMjI0cS02IDYgLTYgMTMuNXQ2IDEzLjVsMjggMjhxNiA2IDEzLjUgNnQxMi41IC02bDI2NyAtMjY2cTUgLTYgNSAtMTMuNXQtNSAtMTIuNXoiIC8+CiAgICA8Z2x5cGggZ2x5cGgtbmFtZT0idXBsb2FkIiB1bmljb2RlPSImI3hlNjE4OyIgaG9yaXotYWR2LXg9IjEwMjUiIApkPSJNNDUxIDM0NGgxMjJ2MjQ1aDE4NGwtMjQ1IDI0NmwtMjQ1IC0yNDZoMTg0di0yNDV6TTYzNSA0ODJ2LTk1bDI4MSAtMTA0bC00MDQgLTE1MWwtNDA0IDE1MWwyODEgMTA0djk1bC0zNjggLTEzOHYtMjQ1bDQ5MSAtMTg1bDQ5MSAxODV2MjQ1eiIgLz4KICAgIDxnbHlwaCBnbHlwaC1uYW1lPSJqdXN0aWZ5bGVmdCIgdW5pY29kZT0iJiN4ZTYwNDsiIApkPSJNMTAwMyAxMTB2LTcwcTAgLTE0IC0xMC41IC0yNC41dC0yNC41IC0xMC41aC05MTJxLTE0IDAgLTI0LjUgMTAuNXQtMTAuNSAyNC41djcwcTAgMTQgMTAuNSAyNC41dDI0LjUgMTAuNWg5MTJxMTQgMCAyNC41IC0xMC41dDEwLjUgLTI0LjV6TTc5MyAzMjB2LTcwcTAgLTE0IC0xMC41IC0yNC41dC0yNS41IC0xMC41aC03MDFxLTE0IDAgLTI0LjUgMTAuNXQtMTAuNSAyNC41djcwcTAgMTUgMTAuNSAyNS41dDI0LjUgMTAuNWg3MDEKcTE1IDAgMjUuNSAtMTAuNXQxMC41IC0yNS41ek05MzMgNTMxdi03MHEwIC0xNCAtMTAuNSAtMjQuNXQtMjQuNSAtMTAuNWgtODQycS0xNCAwIC0yNC41IDEwLjV0LTEwLjUgMjQuNXY3MHEwIDE0IDEwLjUgMjQuNXQyNC41IDEwLjVoODQycTE0IDAgMjQuNSAtMTAuNXQxMC41IC0yNC41ek03MjIgNzQxdi03MHEwIC0xNCAtMTAgLTI0LjV0LTI1IC0xMC41aC02MzFxLTE0IDAgLTI0LjUgMTAuNXQtMTAuNSAyNC41djcwcTAgMTQgMTAuNSAyNC41CnQyNC41IDEwLjVoNjMxcTE1IDAgMjUgLTEwLjV0MTAgLTI0LjV6IiAvPgogICAgPGdseXBoIGdseXBoLW5hbWU9ImluZGVudCIgdW5pY29kZT0iJiN4ZTYxMTsiIApkPSJNMjE0IDM3Ni41cTAgLTcuNSAtNSAtMTIuNWwtMTU4IC0xNThxLTUgLTUgLTEyIC01dC0xMi41IDV0LTUuNSAxM3YzMTVxMCA3IDUuNSAxMi41dDEyLjUgNS41dDEyIC01bDE1OCAtMTU4cTUgLTUgNSAtMTIuNXpNMTAwMyAxMTN2LTEwNXEwIC03IC01LjUgLTEydC0xMi41IC01aC05NDZxLTcgMCAtMTIuNSA1dC01LjUgMTJ2MTA1cTAgOCA1LjUgMTN0MTIuNSA1aDk0NnE3IDAgMTIuNSAtNXQ1LjUgLTEzek0xMDAzIDMyNHYtMTA1CnEwIC04IC01LjUgLTEzdC0xMi41IC01aC01OTZxLTcgMCAtMTIgNXQtNSAxM3YxMDVxMCA3IDUgMTJ0MTIgNWg1OTZxNyAwIDEyLjUgLTV0NS41IC0xMnpNMTAwMyA1MzR2LTEwNXEwIC03IC01LjUgLTEyLjV0LTEyLjUgLTUuNWgtNTk2cS03IDAgLTEyIDUuNXQtNSAxMi41djEwNXEwIDcgNSAxMi41dDEyIDUuNWg1OTZxNyAwIDEyLjUgLTUuNXQ1LjUgLTEyLjV6TTEwMDMgNzQ1di0xMDZxMCAtNyAtNS41IC0xMnQtMTIuNSAtNWgtOTQ2CnEtNyAwIC0xMi41IDV0LTUuNSAxMnYxMDZxMCA3IDUuNSAxMnQxMi41IDVoOTQ2cTcgMCAxMi41IC01dDUuNSAtMTJ6IiAvPgogICAgPGdseXBoIGdseXBoLW5hbWU9Im91dGRlbnQiIHVuaWNvZGU9IiYjeGU2MTM7IiAKZD0iTTIzMSA1NDh2LTMxNXEwIC03IC01IC0xMi41dC0xMiAtNS41cS04IDAgLTEzIDVsLTE1NyAxNThxLTUgNSAtNSAxMi41dDUgMTIuNWwxNTcgMTU4cTUgNSAxMyA1cTcgMCAxMiAtNXQ1IC0xM3pNMTAwMyAxMjh2LTEwNnEwIC03IC01LjUgLTEydC0xMi41IC01aC05NDZxLTcgMCAtMTIuNSA1dC01LjUgMTJ2MTA2cTAgNyA1LjUgMTJ0MTIuNSA1aDk0NnE3IDAgMTIuNSAtNXQ1LjUgLTEyek0xMDAzIDMzOHYtMTA1cTAgLTcgLTUuNSAtMTIuNQp0LTEyLjUgLTUuNWgtNTk2cS03IDAgLTEyIDUuNXQtNSAxMi41djEwNXEwIDcgNSAxMi41dDEyIDUuNWg1OTZxNyAwIDEyLjUgLTUuNXQ1LjUgLTEyLjV6TTEwMDMgNTQ4di0xMDVxMCAtNyAtNS41IC0xMnQtMTIuNSAtNWgtNTk2cS03IDAgLTEyIDV0LTUgMTJ2MTA1cTAgOCA1IDEzdDEyIDVoNTk2cTcgMCAxMi41IC01dDUuNSAtMTN6TTEwMDMgNzU5di0xMDVxMCAtOCAtNS41IC0xM3QtMTIuNSAtNWgtOTQ2cS03IDAgLTEyLjUgNXQtNS41IDEzCnYxMDVxMCA3IDUuNSAxMnQxMi41IDVoOTQ2cTcgMCAxMi41IC01dDUuNSAtMTJ6IiAvPgogICAgPGdseXBoIGdseXBoLW5hbWU9ImNyZWF0ZWxpbmsiIHVuaWNvZGU9IiYjeGU2MDg7IiAKZD0iTTUyOCAxODhxMjMgLTcgNDggLTdoMTFxMTUgMiAzMiAzcTE2IDEgMzMgNnEtMyAtNyAtMTQuNSAtMTkuNXQtMjcuNSAtMzEuNWwtMTkxIC0xODNxLTY2IC01OCAtMTM3IC01OHEtNTUgMCAtMTAyIDIydC04MS41IDU2LjV0LTUzLjUgNzguNXQtMTkgODhxMCA3MCA2MSAxMzFxMTE2IDExNCAxODYgMTczcTY4IDU4IDkxIDY4cTQwIDE5IDk0IDE5cTQzIDAgODUgLTE1LjV0NzUgLTQ3LjVxLTEgMCAtNSAtNXEtMyAtMyAtMTAgLTdsLTY5IC00OQpxLTE5IDE3IC00MSAyNC41dC00MyA3LjVxLTU3IDAgLTEwMSAtNDRsLTE5NyAtMTg5cS0zMiAtMzggLTMyIC03MnEwIC0zOCA0MiAtODBxNDIgLTQ0IDcxLjUgLTU0LjV0NTIuNSAtMTAuNXExNSAyIDMzIDdxMTggNCAzNCAyMHpNOTQ2IDc2N3EyNSAtMzMgMzguNSAtNjl0MTMuNSAtNzVxMCAtNDEgLTIzIC03OHEtMTIgLTE5IC02OCAtODBxLTU1IC02MCAtMTY1IC0xNjRxLTc4IC03NCAtMTcyIC03NHEtNDcgMCAtOTkgMjMuNXQtODQgNzEuNQpxMjIgOCAzNiAxMnExNiA1IDI1IDdsNDggOHExNyAtMTcgMzYgLTI0dDQwIC03cTUzIDAgMTAzIDQ2bDE5NyAxODdxMTcgMTUgMjMgMzRxNSAxOSA3IDM3cTAgMjggLTEzIDU2LjV0LTM1IDUwLjV0LTQ5IDM2cS0yNyAxMyAtNTUgMTNxLTQ0IDAgLTgxIC0zMWwtMTYyIC0xNjZoLTY3cS0yNiAwIC04MiAtMTlxNCA4IDE5IDIzcTI1NiAyNTYgMjk0IDI2OXE0MiAxNiA3NyAxNnE0NCAwIDkwLjUgLTE4LjV0MTA3LjUgLTg0LjV6IiAvPgogICAgPGdseXBoIGdseXBoLW5hbWU9Imluc2VydGNvZGUiIHVuaWNvZGU9IiYjeGU2MWE7IiAKZD0iTTM2MCAzMzJsLTI3OCAtMjc4cS02IC02IC0xMy41IC02dC0xMy41IDZsLTMwIDMwcS02IDYgLTYgMTR0NiAxNGwyMzQgMjM0bC0yMzQgMjM0cS02IDYgLTYgMTR0NiAxNGwzMCAyOXE2IDYgMTMuNSA2dDEzLjUgLTZsMjc4IC0yNzdxNiAtNiA2IC0xNHQtNiAtMTR2MHpNMTAwMyA2MHYtMzhxMCAtOSAtNS41IC0xNHQtMTMuNSAtNWgtNTcycS05IDAgLTE0IDV0LTUgMTR2MzhxMCA4IDUgMTMuNXQxNCA1LjVoNTcycTggMCAxMy41IC01LjUKdDUuNSAtMTMuNXoiIC8+CiAgICA8Z2x5cGggZ2x5cGgtbmFtZT0iYm9sZCIgdW5pY29kZT0iJiN4ZTYwYTsiIApkPSJNNDE5IC01cTQ2IC0xOSA4NyAtMTlxMjM0IDAgMjM0IDIwOHEwIDcxIC0yNSAxMTJxLTE3IDI3IC0zOC41IDQ1LjV0LTQyIDI5dC01MCAxNS41dC01MiA2LjV0LTU5LjUgMS41cS00NSAwIC02MiAtNnEwIC0zMyAzIC05OXQzIC05OHEwIC01IC0wLjUgLTQydDMgLTYwdDIuNSAtNTJ0OCAtNDJoLTExek00MTEgNDU5cTI2IC00IDY3IC00cTUxIDAgODkgOHQ2OC41IDI3LjV0NDYuNSA1NS41dDE2IDg5cTAgNDMgLTE4IDc1LjV0LTQ5IDUxCnQtNjcgMjd0LTc3IDguNXEtMzIgMCAtODEgLThxMCAtMzEgMi41IC05My41dDIuNSAtOTQuNXEwIC0xNyAzIC01MHQzIC00OXEwIC0yOCAxIC00M2gtN3pNNzQgLTkzbDIgNThxOSAzIDUyLjUgMTB0NjUuNSAxN3E1IDcgOC41IDE2LjV0NSAyMXQzIDIwdDIgMjN0My41IDIxLjV2NDFxMCA2MTAgLTE0IDYzN3EtMiA1IC0xMy41IDl0LTI4IDd0LTMwLjUgNC41dC0zMCAyLjV0LTE5IDJsLTMgNTFxNjEgMiAyMTEuNSA3LjV0MjMyLjUgNS41CnExNCAwIDQyLjUgLTN0NDEuNSAtM3E0NCAwIDg1IC04dDc5LjUgLTI2dDY3LjUgLTQ0dDQ2IC02NXQxNyAtODZxMCAtMzIgLTEwIC01OXQtMjQgLTQ0LjV0LTQwIC0zNS41dC00NS41IC0yOHQtNTIuNSAtMjVxOTYgLTIyIDE1OS41IC04My41dDYzLjUgLTE1NC41cTAgLTYyIC0yMS41IC0xMTEuNXQtNTggLTgxdC04NiAtNTN0LTEwMS41IC0zMHQtMTA5IC04LjVxLTI4IDAgLTgyLjUgMS41dC04MS41IDEuNXEtNjYgMCAtMTkxIC02LjUKdC0xNDQgLTcuNXoiIC8+CiAgICA8Z2x5cGggZ2x5cGgtbmFtZT0iaXRhbGljIiB1bmljb2RlPSImI3hlNjA1OyIgCmQ9Ik0xODcgLTEwMmwxMSA1NHE0IDEgNTEuNSAxMy41dDcwLjUgMjMuNXExOCAyMiAyNiA2NHExIDUgMzkuNSAxODR0NzIuNSAzNDV0MzMgMTg4djE2cS0xNSA4IC0zNC41IDExLjV0LTQ0IDV0LTM2LjUgMy41bDEyIDY2cTIxIC0yIDc2IC00LjV0OTQuNSAtNC41dDc2LjUgLTJxMzEgMCA2MyAydDc2LjUgNC41dDYyLjUgNC41cS0zIC0yNSAtMTIgLTU3cS0xOSAtNiAtNjQuNSAtMTh0LTY4LjUgLTIxcS01IC0xMiAtOSAtMjd0LTYgLTI1LjUKdC01IC0yOXQtNCAtMjYuNXEtMTcgLTk0IC01NS41IC0yNjYuNXQtNDkuNSAtMjI1LjVxLTEgLTYgLTggLTM3dC0xMi41IC01N3QtMTAgLTUzdC0zLjUgLTM3di0xMXExMSAtMyAxMTggLTIwcS0yIC0yOCAtMTEgLTYzcS03IDAgLTIwLjUgLTF0LTIwLjUgLTFxLTE4IDAgLTU1IDYuNXQtNTUgNi41cS04NyAxIC0xMzAgMXEtMzMgMCAtOTEuNSAtNS41dC03Ni41IC02LjV6IiAvPgogICAgPGdseXBoIGdseXBoLW5hbWU9InVuZGVybGluZSIgdW5pY29kZT0iJiN4ZTYwNjsiIApkPSJNNTUgODExcS0yNCAyIC0yOSAzbC0yIDU2aDI2cTM4IDAgNzEgLTJxODQgLTUgMTA1IC01cTU1IDAgMTA3IDJxNzQgMyA5MyAzcTM1IDAgNTQgMnYtOWwxIC00MXYtNnEtMzggLTUgLTc5IC01cS0zOCAwIC01MCAtMTZxLTggLTkgLTggLTg0cTAgLTggMyAtMjAuNXQzIC0xNi41bDEgLTE0NWw5IC0xNzhxMyAtNzkgMzIgLTEyOHEyMiAtMzggNjEgLTU5cTU2IC0yOSAxMTIgLTI5cTY2IDAgMTIyIDE3cTM1IDEyIDYyIDMzcTMxIDIzIDQyIDQwCnEyMyAzNiAzMyA3M3ExNCA0NiAxNCAxNDVxMCA1MCAtMi41IDgxLjV0LTcgNzh0LTguNSAxMDAuNWwtMyAzOHEtMyA0MiAtMTUgNTZxLTIxIDIyIC00OSAyMWwtNjMgLTFsLTkgMmwxIDU1aDUzbDEzMSAtN3E0OCAtMiAxMjQgN2wxMSAtMnE0IC0yNCA0IC0zMnEwIC01IC0yIC0yMHEtMjkgLTcgLTU0IC04cS00NiAtNyAtNTAgLTExcS05IC05IC05IC0yNnEwIC00IDEgLTE3dDEgLTIwcTUgLTEyIDE0IC0yNTFxMyAtMTI0IC0xMCAtMTkzCnEtOSAtNDggLTI2IC03OHEtMjQgLTQxIC03MSAtNzhxLTQ4IC0zNiAtMTE2IC01NnEtNjkgLTIxIC0xNjEgLTIxcS0xMDcgMCAtMTgxIDI5cS03NSAzMCAtMTEzIDc4cS0zOSA0OCAtNTMgMTIzcS0xMCA1MSAtMTAgMTUxdjIxMXEwIDEyMCAtMTEgMTM1cS0xNiAyMyAtOTMgMjVoLTZ6TTEwMDAgLTgzdjQwcTAgOSAtNiAxNXQtMTUgNmgtOTM0cS05IDAgLTE1IC02dC02IC0xNXYtNDBxMCAtOSA2IC0xNXQxNSAtNmg5MzRxOSAwIDE1IDZ0NiAxNXoKIiAvPgogICAgPGdseXBoIGdseXBoLW5hbWU9InVuZG8iIHVuaWNvZGU9IiYjeGU2MTQ7IiAKZD0iTTEwMDAgMzg0cTAgLTk5IC0zOSAtMTg5dC0xMDQuNSAtMTU1LjV0LTE1NS41IC0xMDQuNXQtMTg5IC0zOXEtMTA5IDAgLTIwNy41IDQ2dC0xNjcuNSAxMzBxLTUgNyAtNC41IDE1dDUuNSAxM2w4NyA4N3E2IDYgMTYgNnExMCAtMSAxNSAtOHE0NiAtNjAgMTEzIC05M3QxNDMgLTMzcTY2IDAgMTI2IDI1LjV0MTA0IDY5LjV0NjkuNSAxMDR0MjUuNSAxMjZ0LTI1LjUgMTI2dC02OS41IDEwNHQtMTA0IDY5LjV0LTEyNiAyNS41CnEtNjIgMCAtMTE5IC0yMi41dC0xMDIgLTY0LjVsODcgLTg4cTIwIC0xOSA5IC00M3EtMTEgLTI2IC0zOCAtMjZoLTI4NHEtMTYgMCAtMjguNSAxMnQtMTIuNSAyOXYyODRxMCAyNyAyNiAzOHEyNSAxMSA0NCAtOWw4MiAtODJxNjggNjQgMTU1LjUgOTkuNXQxODAuNSAzNS41cTk5IDAgMTg5IC0zOXQxNTUuNSAtMTA0LjV0MTA0LjUgLTE1NS41dDM5IC0xODl6IiAvPgogICAgPGdseXBoIGdseXBoLW5hbWU9Imluc2VydGltYWdlIiB1bmljb2RlPSImI3hlNjBjOyIgCmQ9Ik05OTcgNzdxMCAtMzMgLTI0IC01Ni41dC01NyAtMjMuNWgtODA4cS0zNCAwIC01Ny41IDIzLjV0LTIzLjUgNTYuNXY2MTRxMCAzMyAyNCA1Ni41dDU3IDIzLjVoODA4cTMzIDAgNTYuNSAtMjMuNXQyMy41IC01Ni41di02MTRoMXpNMTA4IDcwOHEtNyAwIC0xMiAtNC41dC01IC0xMS41di02MTVxMCAtNiA1IC0xMXQxMiAtNWg4MDhxNiAwIDExIDV0NSAxMXY2MTRxMCA3IC01IDExLjV0LTExIDQuNWgtODA4djF6TTI1MyA0NDkKcS00MCAwIC02OCAyOHQtMjggNjguNXQyOCA2OXQ2OC41IDI4LjV0NjguNSAtMjguNXQyOCAtNjguNXQtMjggLTY4LjV0LTY5IC0yOC41djB6TTg2NyAxMjZoLTcxMHY5N2wxNjIgMTYybDgwIC04MWwyNTkgMjU4bDIxMCAtMjEwdi0yMjdoLTF2MXYweiIgLz4KICAgIDxnbHlwaCBnbHlwaC1uYW1lPSJpbnNlcnR2aWRlbyIgdW5pY29kZT0iJiN4ZTYwZDsiIApkPSJNODg1IDc4NGgtNzQ1cS00NyAwIC04MSAtMzR0LTM0IC04MXYtNTU5cTAgLTQ4IDM0IC04MS41dDgxIC0zMy41aDc0NXE0NyAwIDgxIDMzLjV0MzQgODEuNXY1NTlxMCA0NyAtMzQgODF0LTgxIDM0djB6TTkyNSA3OHEwIC05IC05IC05aC04MDdxLTQgMCAtNi41IDN0LTIuNSA2djYyMnEwIDkgOSA5aDgwN3EzIDAgNiAtMi41dDMgLTYuNXYtNjIydjB6TTY5NSA0MTNsLTI2NyAxOTRxLTggNSAtMTcgNXEtNyAwIC0xMyAtMwpxLTE2IC04IC0xNiAtMjZ2LTM4OHEwIC0xOCAxNiAtMjZxNiAtMyAxMyAtM3E5IDAgMTcgNWwyNjcgMTk1cTEyIDggMTIgMjN0LTEyIDI0djB6TTYyNCAzODZsLTE3OCAtMTI5cS0xIC0xIC0yIC0xaC0ycS0yIDEgLTIgNHYyNThxMCAzIDIgNHQ0IDBsMTc4IC0xMzBxMiAtMSAyIC0zdC0yIC0zdjB6TTYyNCAzODZ6IiAvPgogICAgPGdseXBoIGdseXBoLW5hbWU9ImNsb3NlIiB1bmljb2RlPSImI3hlNzllOyIgCmQ9Ik02MDIgMzg0bDM4MSAzODFxMTggMTggMTggNDQuNXQtMTguNSA0NXQtNDUgMTguNXQtNDUuNSAtMThsLTM4MCAtMzgxbC0zODAgMzgxcS0xOSAxOCAtNDUuNSAxOHQtNDUgLTE4LjV0LTE4LjUgLTQ1dDE4IC00NC41bDM4MSAtMzgxbC0zODEgLTM4MHEtMTggLTE5IC0xOCAtNDUuNXQxOC41IC00NXQ0NSAtMTguNXQ0NS41IDE4bDM4MCAzODFsMzgwIC0zODFxMTkgLTE4IDQ1LjUgLTE4dDQ1IDE4LjV0MTguNSA0NXQtMTggNDUuNXoiIC8+CiAgICA8Z2x5cGggZ2x5cGgtbmFtZT0ibWF0aCIgdW5pY29kZT0iJiN4ZTYxZDsiIApkPSJNODU0IDQyOHExMSAxMSAxNyAxMWg3OHE0IDAgNy41IDMuNXQzLjUgOC41djg5cTAgNCAtMy41IDcuNXQtNy41IDMuNWgtOTBxLTQgMCAtMTAgLTMuNXQtNiAtNy41bC05NSAtMTAxcS0zIC0yIC01LjUgLTN0LTQuNSAwdC0yIDNsLTUwIDEwMXEtMTEgMTEgLTE3IDExaC0xNDVxLTQgMCAtNy41IC0zLjV0LTMuNSAtNy41di04OXEwIC01IDMuNSAtOC41dDcuNSAtMy41aDg5cTYgMCAxNyAtMTFsMzQgLTcydi0xN2wtMTAxIC0xMTgKcS0zIDAgLTguNSAtMi41dC04LjUgLTIuNWgtNzhxLTQgMCAtNy41IC0zLjV0LTMuNSAtOC41di04OXEwIC00IDMuNSAtNy41dDcuNSAtMy41aDg5cTUgMCAxMSAzLjV0NiA3LjVsMTI5IDE0NXE0IDUgNy41IDV0My41IC01bDczIC0xNDVxMCAtNCA2IC03LjV0MTAgLTMuNWg5MHE0IDAgNy41IDMuNXQzLjUgNy41djg5cTAgNSAtMy41IDguNXQtNy41IDMuNWgtMzRxLTUgMCAtMTYgMTFsLTU2IDExMnYxN3pNMzk1IDc3NQpxLTUxIC00MSAtNzMgLTExMmwtMjggLTExMmgtMTYycS00IDAgLTcuNSAtMy41dC0zLjUgLTcuNXYtODlxMCAtNSAzLjUgLTguNXQ3LjUgLTMuNWgxMzRsLTg0IC0zMzVxLTEzIC01NiAtNTIgLTU3cS05IDAgLTkgMWgtNTZ2LTExMmg1NnE4NSAwIDExMiAzM3EzNiAzNyA1NiAxMzVsODQgMzM1aDEyOHE1IDAgOC41IDMuNXQzLjUgOC41djg5cTAgNCAtMy41IDcuNXQtOC41IDMuNWgtMTAwbDI4IDEwN3E0IDExIDIwIDI4LjV0MzAgMjcuNQpxMTUgMTAgMzMgMTZ0MzMgNy41dDM3LjUgLTAuNXQzNCAtNHQzNC41IC03dDI5IC03djk1bC0yNi41IDZ0LTM3IDcuNXQtMzcuNSA0LjV0LTQ1LjUgMHQtNDQgLTh0LTQ5IC0xNy41dC00NS41IC0zMS41djB6TTM5NSA3NzV6IiAvPgogICAgPGdseXBoIGdseXBoLW5hbWU9Imluc2VydHVub3JkZXJlZGxpc3QiIHVuaWNvZGU9IiYjeGU2MGU7IiAKZD0iTTIzMSAxMDMuNXEwIC00My41IC0zMC41IC03NC41dC03NC41IC0zMXQtNzQuNSAzMXQtMzAuNSA3NC41dDMwLjUgNzQuNXQ3NC41IDMxdDc0LjUgLTMxdDMwLjUgLTc0LjV6TTIzMSAzODRxMCAtNDQgLTMwLjUgLTc0LjV0LTc0LjUgLTMwLjV0LTc0LjUgMzAuNXQtMzAuNSA3NC41dDMwLjUgNzQuNXQ3NC41IDMwLjV0NzQuNSAtMzAuNXQzMC41IC03NC41ek0xMDAzIDE1NnYtMTA1cTAgLTcgLTUuNSAtMTIuNXQtMTIuNSAtNS41aC02NjYKcS03IDAgLTEyIDUuNXQtNSAxMi41djEwNXEwIDcgNSAxMi41dDEyIDUuNWg2NjZxNyAwIDEyLjUgLTUuNXQ1LjUgLTEyLjV6TTIzMSA2NjQuNXEwIC00My41IC0zMC41IC03NC41dC03NC41IC0zMXQtNzQuNSAzMXQtMzAuNSA3NC41dDMwLjUgNzQuNXQ3NC41IDMxdDc0LjUgLTMxdDMwLjUgLTc0LjV6TTEwMDMgNDM3di0xMDZxMCAtNyAtNS41IC0xMnQtMTIuNSAtNWgtNjY2cS03IDAgLTEyIDV0LTUgMTJ2MTA2cTAgNyA1IDEydDEyIDVoNjY2CnE3IDAgMTIuNSAtNXQ1LjUgLTEyek0xMDAzIDcxN3YtMTA1cTAgLTcgLTUuNSAtMTIuNXQtMTIuNSAtNS41aC02NjZxLTcgMCAtMTIgNS41dC01IDEyLjV2MTA1cTAgNyA1IDEyLjV0MTIgNS41aDY2NnE3IDAgMTIuNSAtNS41dDUuNSAtMTIuNXoiIC8+CiAgICA8Z2x5cGggZ2x5cGgtbmFtZT0iZm9udG5hbWUiIHVuaWNvZGU9IiYjeGU2MDc7IiAKZD0iTTc4OCA4NTlxLTQzIDAgLTExNSA4dC0xMTcgOHEtMTA1IDAgLTE4OCAtMjh0LTEzMyAtNzUuNXQtNzYuNSAtMTA1LjV0LTI2LjUgLTEyM3EwIC03MSAzMy41IC0xMDF0MTA1LjUgLTMwcS0xIDEgLTMuNSA2LjV0LTMuNSA4dC0zIDl0LTMgMTN0LTIuNSAxNS41dC0yIDIxLjV0LTAuNSAyNi41cTAgNzEgMTIuNSAxMjEuNXQzNi41IDc5dDUzIDQxLjV0NjYgMTVxLTEgLTEwIC0zIC0yN3QtOSAtNzB0LTE2IC0xMDQuNXQtMjQgLTEyMy41CnQtMzEuNSAtMTM1dC00MC41IC0xMzAuNXQtNDkuNSAtMTE4dC01OSAtOTB0LTcwLjUgLTUzLjV2LTI0aDMwNGwxMDQgNDkxaDE4OWw0MiAxMjNoLTIwNmw1MCAyMzZxMTE0IC0yNCAxNjEgLTI0cTI1IDAgNDMuNSA1LjV0MzguNSAyMXQzNS41IDQ3LjV0MjYuNSA4MnEtNDkgLTE2IC0xMTggLTE2eiIgLz4KICAgIDxnbHlwaCBnbHlwaC1uYW1lPSJiYWNrY29sb3IiIHVuaWNvZGU9IiYjeGU2MTU7IiAKZD0iTTkwMCA4NjhxMzggMCA2NiAtMjUuNXQyOCAtNjIuNXEwIC0zNCAtMjQgLTgycS0xNzkgLTMzOSAtMjUxIC00MDZxLTUyIC00OSAtMTE4IC00OXEtNjggMCAtMTE2LjUgNTB0LTQ4LjUgMTE5dDQ5IDExNGwzNDUgMzEycTMyIDMwIDcwIDMwek00MDkgMzEwcTIxIC00MSA1Ny41IC03MC41dDgxLjUgLTQxLjVsMSAtMzhxMiAtMTE1IC03MCAtMTg3dC0xODggLTcycS02NyAwIC0xMTggMjV0LTgyIDY4LjV0LTQ3IDk4LjV0LTE2IDExOQpxNCAtMyAyMi41IC0xNi41dDMzLjUgLTI0dDMyIC0xOS41dDI1IC05cTIyIDAgMjkgMjBxMTQgMzUgMzEuNSA2MC41dDM3LjUgNDF0NDcuNSAyNS41dDU1LjUgMTR0NjcgNnoiIC8+CiAgICA8Z2x5cGggZ2x5cGgtbmFtZT0iZm9yZWNvbG9yIiB1bmljb2RlPSImI3hlNzQzOyIgCmQ9Ik0zOTQgMjY2bDExOCA1OWw0MTQgNDE0bC01OSA1OWwtNDE0IC00MTR6TTMwNiA1NnEtMjIgNDYgLTQ5IDczdC03MyA0OWw5MSAyNTJsMTE5IDcybDM1NSAzNTVoLTE3OGwtMzU1IC0zNTVsLTE3NyAtNTkxbDU5MSAxNzdsMzU1IDM1NXYxNzhsLTM1NSAtMzU1bC03MiAtMTE5eiIgLz4KICAgIDxnbHlwaCBnbHlwaC1uYW1lPSJyZXNpemUiIHVuaWNvZGU9IiYjeGU2MWI7IiAKZD0iTTU1IC0xMDVxLTEzIDAgLTIyIDl0LTkgMjEuNXQ5IDIxLjVsOTE0IDkxN3E5IDkgMjIgOXQyMiAtOXQ5IC0yMS41dC05IC0yMS41bC05MTQgLTkxN3EtOSAtOSAtMjIgLTl2MHpNNTU2IC05Nmw0MzYgNDM4cTkgOSA5IDIxLjV0LTkgMjEuNXQtMjEuNSA5dC0yMS41IC05bC00MzcgLTQzOHEtOSAtOSAtOSAtMjEuNXQ5IC0yMS41dDIyIC05dDIyIDl2MHoiIC8+CiAgICA8Z2x5cGggZ2x5cGgtbmFtZT0icmVtb3ZlZm9ybWF0IiB1bmljb2RlPSImI3hlNjA5OyIgCmQ9Ik0xMDAzIDY1NXEwIDE1IC0xMC41IDI3LjV0LTI0LjUgMTUuNWwzIDRoLTQ0M2wtNDg3IC01NTBsLTEyIC0xMWwtOCAtMTJoNHEtNCAtNCAtNCAtMTZxMCAtMTUgMTAuNSAtMjcuNXQyNC41IC0xNS41bC0zIC00aDQ0M2w0ODcgNTUwbDEyIDExbDggMTJoLTRxNCA0IDQgMTZ6TTQ2NSAxMjloLTM4MWwyMzYgMjU1aDM4MXoiIC8+CiAgICA8Z2x5cGggZ2x5cGgtbmFtZT0icmVkbyIgdW5pY29kZT0iJiN4ZTYxNjsiIApkPSJNMjkgMzc2cTAgLTk4IDM4LjUgLTE4Ny41dDEwMyAtMTU0dDE1NCAtMTAzdDE4Ny41IC0zOC41cTEwOCAwIDIwNS41IDQ1LjV0MTY1LjUgMTI4LjVxNSA3IDQuNSAxNC41dC01LjUgMTIuNWwtODYgODdxLTYgNiAtMTYgNnEtMTAgLTEgLTE0IC04cS00NiAtNTkgLTExMi41IC05MnQtMTQxLjUgLTMzcS02NiAwIC0xMjUgMjUuNXQtMTAyLjUgNjl0LTY5IDEwM3QtMjUuNSAxMjV0MjUuNSAxMjQuNXQ2OSAxMDIuNXQxMDIuNSA2OXQxMjUgMjUuNQpxNjEgMCAxMTggLTIyLjV0MTAxIC02My41bC04NyAtODdxLTE5IC0xOSAtOCAtNDNxMTAgLTI1IDM3IC0yNWgyODJxMTYgMCAyOCAxMnQxMiAyOHYyODJxMCAyNiAtMjUgMzdxLTI1IDEwIC00NCAtOWwtODIgLTgxcS02NyA2MyAtMTUzLjUgOTh0LTE3OC41IDM1cS05OCAwIC0xODcuNSAtMzguNXQtMTU0LjUgLTEwM3QtMTAzIC0xNTR0LTM4IC0xODcuNXYwdjB6IiAvPgogICAgPGdseXBoIGdseXBoLW5hbWU9ImZvbnRzaXplIiB1bmljb2RlPSImI3hlNjE5OyIgCmQ9Ik05NTAgNTQycS03IDY5IC0zMCAxMDJxLTI0IDMzIC01MCA0MHEtMjggOCAtNjIgOGgtOTR2LTU0NHEwIC0zMiA2LjUgLTQ5LjV0MzAuNSAtMjguNXEyNCAtOSA3MCAtOXYtNTFoLTM3MnY1MXE2OSAwIDg4LjUgMTkuNXQxOS41IDY3LjV2NTQ0aC03OXEtNDYgMCAtNzcgLTdxLTMxIC04IC01NCAtNDF0LTI2IC0xMDJoLTUydjIxMWg3MzN2LTIxMWgtNTJ2MHpNNDIxIDMwMGgtMjhxLTQgMzkgLTE3IDU2cS0xMyAxOCAtMjggMjIKcS0xNSA1IC0zNCA1aC01MXYtMjk5cTAgLTE4IDMgLTI4cTQgLTEwIDE3IC0xNXExNCAtNiAzOSAtNnYtMjdoLTIwNXYyOHEzOCAwIDQ5IDEwcTExIDExIDExIDM4djI5OWgtNDRxLTI0IDAgLTQyIC00cS0xNyAtNCAtMzAgLTIzcS0xMiAtMTggLTE0IC01NmgtMjl2MTE2aDQwM3YtMTE2eiIgLz4KICAgIDxnbHlwaCBnbHlwaC1uYW1lPSJoZWFkaW5nIiB1bmljb2RlPSImI3hlNjBmOyIgCmQ9Ik05NzEgLTY1cS0yNiAwIC03NyAyLjV0LTc5IDIuNXEtMjUgMCAtNzYgLTIuNXQtNzcgLTIuNXEtMTUgMCAtMjIuNSAxMi41dC03LjUgMjYuNXEwIDE4IDkuNSAyNy41dDIzIDkuNXQzMC41IDR0MjYgOXExOSAxMiAxOSA4MnYyMjhxMCAxMiAtMSAxOHEtNyAzIC0yOSAzaC0zOTNxLTIzIDAgLTMxIC0zdi0xOGwtMSAtMjE3cTAgLTgyIDIyIC05NnExMCAtNSAyNy41IC03dDMzLjUgLTJ0MjYgLTguNXQxMSAtMjcuNXEwIC0xNCAtNyAtMjcKdC0yMSAtMTRxLTI3IDAgLTgxLjUgMi41dC04MC41IDIuNXEtMjUgMCAtNzQgLTIuNXQtNzQgLTIuNXEtMTQgMCAtMjEuNSAxMi41dC03LjUgMjYuNXEwIDE4IDkuNSAyNi41dDIxIDEwLjV0MjcuNSA0dDI1IDlxMTkgMTQgMTkgODRsLTEgMzJ2NDc1cTAgMiAxIDE0LjV0MCAyMnQtMSAyMnQtMiAyNXQtNC41IDIxdC02LjUgMTl0LTkgMTAuNXEtOSA1IC0yNi41IDZ0LTMwIDJ0LTI0IDcuNXQtMTAuNSAyNy41cTAgMTQgNiAyN3QyMSAxNApxMjcgMCA4MS41IC0yLjV0ODAuNSAtMi41cTI0IDAgNzQuNSAyLjV0NzMuNSAyLjVxMTQgMCAyMS41IC0xNHQ3LjUgLTI3cTAgLTE4IC05LjUgLTI2LjV0LTIzIC04LjV0LTI5LjUgLTJ0LTI1IC03cS0yMCAtMTMgLTIwIC05NGwxIC0xODZ2LTE5cTggLTIgMjMgLTJoNDA4cTE1IDAgMjIgMnExIDYgMSAxOXYxODZxMCA4MSAtMjAgOTRxLTEwIDYgLTM0IDd0LTM5IDcuNXQtMTUgMjkuNXEwIDE0IDcuNSAyN3QyMi41IDE0cTI1IDAgNzcgLTIuNQp0NzYgLTIuNXEyNiAwIDc2IDIuNXQ3NSAyLjVxMTUgMCAyMiAtMTR0NyAtMjdxMCAtMTggLTEwLjUgLTI2LjV0LTIzIC04LjV0LTMwIC0ydC0yNS41IC03cS0yMSAtMTQgLTIxIC05NGwyIC01NTBxMCAtNjkgMTkgLTgycTEwIC02IDI2LjUgLTd0MzEuNSAtM3QyNCAtOS41dDEwIC0yNS41cTAgLTE1IC02IC0yOHQtMjEgLTE0eiIgLz4KICAgIDxnbHlwaCBnbHlwaC1uYW1lPSJpbnNlcnRvcmRlcmVkbGlzdCIgdW5pY29kZT0iJiN4ZTYxMDsiIApkPSJNMjIzIC0xM3EwIC00NCAtMzAuNSAtNjguNXQtNzMuNSAtMjUuNXEtNTkgMCAtOTQgMzZsMzAgNDlxMjggLTI1IDU5IC0yNXExNiAwIDI3LjUgOHQxMS41IDIzcTAgMzUgLTU4IDMxbC0xMyAzMHE0IDYgMTcuNSAyNHQyMy41IDMwLjV0MjAgMjAuNXYxcS05IDAgLTI3IC0xdC0yNiAwdi0zMGgtNTh2ODRoMTgydi00OGwtNTIgLTY0cTI4IC02IDQ0LjUgLTI2LjV0MTYuNSAtNDguNXpNMjI0IDMzMXYtODdoLTE5OHEtNCAxOSAtNCAyOQpxMCAyOSAxMy41IDUxLjV0MzAuNSAzN3QzNi41IDI2LjV0MzAuNSAyMy41dDE0IDI0LjVxMCAxNCAtOSAyMS41dC0yMiA3LjVxLTI0IDAgLTQ0IC0zMmwtNDYgMzJxMTMgMjggMzkuNSA0My41dDU3LjUgMTUuNXEzOSAwIDY2LjUgLTIyLjV0MjcuNSAtNjEuNXEwIC0yOCAtMTguNSAtNTAuNXQtNDEgLTM1dC00MS41IC0yNy41dC0yMCAtMjloNzB2MzNoNTh6TTk5NiAxNTZ2LTEwNXEwIC04IC01IC0xMi41dC0xMyAtNC41aC02NjYKcS03IDAgLTEyIDQuNXQtNSAxMi41djEwNXEwIDggNSAxM3QxMiA1aDY2NnE3IDAgMTMgLTZ0NSAtMTJ6TTIyNCA2NDl2LTU1aC0xODN2NTVoNTh2Njd0MSA2NnY2aC0xcS00IC05IC0yNyAtMjlsLTM5IDQxbDc0IDcwaDU4di0yMjFoNTl6TTk5NiA0Mzd2LTEwNnEwIC03IC01IC0xMnQtMTMgLTVoLTY2NnEtNyAwIC0xMiA1dC01IDEydjEwNnEwIDcgNSAxMnQxMiA1aDY2NnE3IDAgMTMgLTV0NSAtMTJ6TTk5NiA3MTd2LTEwNXEwIC03IC01IC0xMgp0LTEzIC02aC02NjZxLTcgMCAtMTIgNnQtNSAxMnYxMDVxMCA4IDUgMTIuNXQxMiA0LjVoNjY2cTcgMCAxMyAtNC41dDUgLTEyLjV6IiAvPgogICAgPGdseXBoIGdseXBoLW5hbWU9InN0cmlrZXRocm91Z2giIHVuaWNvZGU9IiYjeGU2MDA7IiAKZD0iTTIwIDMyMXY2M2gyNzlxLTMyIDQwIC0zNCA0MnEtNjAgNjggLTYwIDE1My41dDYwIDE1My41cTc3IDg2IDIwNCAxMDFxMTI0IDE2IDIyNyAtNDhxOTcgLTYwIDEyMCAtMTY0cTAgLTIgNSAtNDJoLTEyM3EtNiA3MiAtODcgMTA3cS0xMTggNTEgLTIyNCAtMTVxLTQ0IC0yNyAtNTYgLTY4cS0xNyAtNjQgNDQgLTExMHE1NyAtNDMgMTM5IC00NHExMTIgLTIgMTk2IC02MHE3IC01IDIwIC01aDI3NHYtNjRoLTIyNGwyMiAtNDQKcTUxIC0xMjggLTQwIC0yMzZxLTc2IC05MCAtMjA5IC0xMDVxLTEzOSAtMTUgLTI0NSA2M3EtOTYgNzEgLTEwMyAxODR2N2gxMjJxNiAtNDggMzYgLTc1dDc5IC00MnExMDQgLTMyIDE5NCAyNHExOCAxMiAzMiAyNnEzMCAzMiAyOSA3MS41dC0zMyA3MC41cS02MCA1NiAtMTU4IDU2aC00NjZoLTIwdjB6IiAvPgogICAgPGdseXBoIGdseXBoLW5hbWU9ImgxIiB1bmljb2RlPSImI3hlNjFjOyIgCmQ9Ik0yNjIgMzc0cS0yOCAwIC0zMyAtMy41dC01IC0yMi41di0xMzFxMCAtNjIgNy41IC03Ny41dDM4LjUgLTIwLjVsMjkgLTNxNSAtNCA1IC0xNnQtNSAtMTZxLTc4IDMgLTEzOCAzcS02NSAwIC0xMzUgLTNxLTUgNCAtNSAxNnQ1IDE2bDIyIDJxMzEgNSAzOC41IDIwLjV0Ny41IDc4LjV2MzM3cTAgNjMgLTcuNSA3OXQtMzguNSAyMGwtMjIgMnEtNSA0IC01IDE2dDUgMTZxNjcgLTMgMTM1IC0zcTY2IDAgMTI2IDNxNSAtNCA1IC0xNnQtNSAtMTYKbC0xOSAtMnEtMzAgLTQgLTM3IC0yMC41dC03IC03OC41di0xMDVxMCAtMjAgNSAtMjMuNXQzMyAtMy41aDE4OHEyOCAwIDMzIDMuNXQ1IDIzLjV2MTA1cTAgNDQgLTMuNSA2MnQtMTIgMjV0LTMwLjUgMTFsLTI1IDNxLTUgNCAtNSAxNnQ1IDE2cTc1IC0zIDEzOCAtM3E2NSAwIDEyOCAzcTUgLTQgNSAtMTZ0LTUgLTE2bC0xOSAtMnEtMzEgLTUgLTM5IC0yMXQtOCAtNzh2LTMzN3EwIC00NCA0IC02MnQxMi41IC0yNXQzMC41IC0xMWwyMiAtMwpxNiAtNCA2IC0xNnQtNiAtMTZxLTY4IDMgLTEzMSAzcS02OCAwIC0xMzMgLTNxLTYgNCAtNiAxNnQ2IDE2bDIwIDJxMzEgNSAzOC41IDIwLjV0Ny41IDc4LjV2MTMxcTAgMTkgLTUgMjIuNXQtMzMgMy41aC0xODh6TTk0NCAxNzNxMCAtNDAgNiAtNTAuNXQzMSAtMTIuNWwyOCAtMnE1IC0zIDQuNSAtMTIuNXQtNS41IC0xMS41cS0zNyAyIC0xMDcgMnEtNzQgMCAtMTEwIC0ycS01IDIgLTUuNSAxMS41dDQuNSAxMi41bDI3IDIKcTI1IDIgMzEuNSAxMi41dDYuNSA1MC41djIxOXEwIDM1IC01LjUgNDUuNXQtMjcuNSAxMy41bC0zMSA0cS01IDMgLTUgMTJ0NCAxMnEzOCA1IDg2IDE5cTEzIDMgMjcuNSA4LjV0MjMgOXQxMC41IDMuNXE3IDAgOSAtN3EtMiAtMjQgLTIgLTgxdi0yNTh6IiAvPgogICAgPGdseXBoIGdseXBoLW5hbWU9ImgyIiB1bmljb2RlPSImI3hlNjFlOyIgCmQ9Ik0yNTIgMzY2cS0yNyAwIC0zMS41IC0zLjV0LTQuNSAtMjIuNXYtMTI1cTAgLTYwIDcgLTc1dDM3IC0xOGwyOCAtNHE1IC00IDUgLTE1dC01IC0xNXEtNzUgMiAtMTMyIDJxLTYzIDAgLTEzMCAtMnEtNSA0IC01IDE1dDUgMTVsMjEgM3EzMCA0IDM3IDE5dDcgNzV2MzIzcTAgNjEgLTcgNzZ0LTM3IDE5bC0yMSAzcS01IDQgLTUgMTV0NSAxNXE2NCAtMyAxMzAgLTNxNjMgMCAxMjAgM3E2IC00IDYgLTE1dC02IC0xNWwtMTggLTMKcS0yOCAtNCAtMzUgLTE5LjV0LTcgLTc1LjV2LTEwMHEwIC0xOSA0LjUgLTIyLjV0MzEuNSAtMy41aDE4MXEyNyAwIDMxLjUgMy41dDQuNSAyMi41djEwMHEwIDYwIC03IDc1dC0zNyAxOWwtMjQgNHEtNSA0IC01IDE1dDUgMTVxNzIgLTMgMTMyIC0zcTYzIDAgMTIzIDNxNSAtNCA1IC0xNXQtNSAtMTVsLTE3IC0zcS0zMSAtNSAtMzguNSAtMjB0LTcuNSAtNzV2LTMyM3EwIC00MiAzLjUgLTU5LjV0MTIgLTI0dDMwLjUgLTkuNWwyMCAtNApxNiAtNCA2IC0xNXQtNiAtMTVxLTY1IDIgLTEyNiAycS02NSAwIC0xMjcgLTJxLTUgNCAtNSAxNXQ1IDE1bDE5IDNxMzAgNCAzNyAxOXQ3IDc1djEyNXEwIDE5IC00LjUgMjIuNXQtMzEuNSAzLjVoLTE4MXpNOTE0IDE1NnEzNyAwIDQ5IDUuNXQyNSAzMC41cTQgNCAxMi41IDN0MTAuNSAtN3EtNSAtMjkgLTE0LjUgLTU4LjV0LTE3LjUgLTQxLjVxLTM5IDIgLTkxIDJoLTEwM3EtNTcgMCAtNzMgLTJxLTkgMiAtNyAxNHE2MCA1NSAxMDEgMTAwCnE0MCA0NCA2Mi41IDg1dDIyLjUgODhxMCAzNSAtMTkuNSA1N3QtNTEuNSAyMnEtNDkgMCAtODMgLTU5cS02IC00IC0xMy41IC0xLjV0LTguNSAxMC41cTIwIDQ4IDYwLjUgNzQuNXQ4OC41IDI2LjVxNTYgMCA4OS41IC0zMS41dDMzLjUgLTc4LjVxMCAtMzkgLTIwIC03M3QtNzggLTg4bC0zMSAtMjlxLTM0IC0zMiAtMzQgLTQxcTAgLTggMTIgLThoNzh2MHoiIC8+CiAgICA8Z2x5cGggZ2x5cGgtbmFtZT0iaDMiIHVuaWNvZGU9IiYjeGU2MWY7IiAKZD0iTTI0OSAzODhxLTI3IDAgLTMyIC0zLjV0LTUgLTIyLjV2LTEyNnEwIC02MCA3LjUgLTc1dDM3LjUgLTE5bDI4IC00cTUgLTQgNSAtMTUuNXQtNSAtMTUuNXEtNzUgMyAtMTMzIDNxLTY0IDAgLTEzMSAtM3EtNSA0IC01IDE1LjV0NSAxNS41bDIxIDNxMzAgNCAzNy41IDE5dDcuNSA3NnYzMjZxMCA2MSAtNy41IDc2LjV0LTM3LjUgMTkuNWwtMjEgMnEtNSA0IC01IDE1LjV0NSAxNS41cTY0IC0zIDEzMSAtM3E2NCAwIDEyMSAzCnE2IC00IDYgLTE1LjV0LTYgLTE1LjVsLTE4IC0ycS0yOSAtNCAtMzYgLTE5LjV0LTcgLTc2LjV2LTEwMXEwIC0yMCA1IC0yMy41dDMyIC0zLjVoMTgycTI4IDAgMzIuNSAzLjV0NC41IDIzLjV2MTAxcTAgNjEgLTcgNzUuNXQtMzggMTkuNWwtMjMgM3EtNiA0IC02IDE1LjV0NiAxNS41cTcyIC0zIDEzMyAtM3E2MyAwIDEyMyAzcTYgLTQgNiAtMTUuNXQtNiAtMTUuNWwtMTcgLTJxLTMxIC01IC0zOC41IC0yMHQtNy41IC03NnYtMzI2CnEwIC00MiAzLjUgLTU5LjV0MTIgLTI0LjV0MzAuNSAtMTBsMjEgLTRxNSAtNCA1IC0xNS41dC01IC0xNS41cS02NiAzIC0xMjcgM3EtNjYgMCAtMTI5IC0zcS01IDQgLTUgMTUuNXQ1IDE1LjVsMTkgM3EzMSA0IDM4IDE5dDcgNzZ2MTI2cTAgMTkgLTQuNSAyMi41dC0zMi41IDMuNWgtMTgyek03NTIgNDY4cS02IC0yIC0xMiAydC02IDEwcTE5IDQwIDU1LjUgNjEuNXQ4MS41IDIxLjVxNDcgMCA3NS41IC0yMXQyOC41IC01NApxMCAtMjQgLTE2LjUgLTQzLjV0LTY2LjUgLTQwLjVxLTcgLTQgLTEgLTdxMyAtMiA3IC0ycTQ2IDIgNzggLTI2LjV0MzIgLTc1LjVxMCAtNzggLTc1IC0xMzNxLTczIC01MyAtMTUxIC01M3EtMzAgMCAtNTAuNSAxMnQtMjAuNSAzNXEwIDE0IDEwLjUgMjV0MjguNSAxMXE1IDAgOS41IC0xLjV0OC41IC00dDcuNSAtNS41dDYuNSAtN3Q1IC02dDQuNSAtNnQyLjUgLTVxMTAgLTE1IDI4IC0xNXEyOCAwIDU4IDMydDMwIDg2cTAgNDQgLTIxIDcyCnQtNTYgMjhxLTM0IDAgLTY0IC0yN3EtMTAgMiAtMTUgMTF0MCAyMHE3NSAyOSAxMDUgNTNxMjggMjMgMjggNTlxMCAxOSAtMTUuNSAzMy41dC0zOC41IDE0LjVxLTQ1IDAgLTgxIC01NHoiIC8+CiAgICA8Z2x5cGggZ2x5cGgtbmFtZT0iaDQiIHVuaWNvZGU9IiYjeGU2MjA7IiAKZD0iTTI0NiAzNTRxLTI3IDAgLTMyIC0zLjV0LTUgLTIyLjV2LTEyNXEwIC02MCA3LjUgLTc1dDM2LjUgLTE5bDI4IC0zcTUgLTQgNSAtMTUuNXQtNSAtMTQuNXEtNzQgMiAtMTMyIDJxLTYzIDAgLTEyOSAtMnEtNSAzIC01IDE0LjV0NSAxNS41bDIxIDNxMzAgNCAzNyAxOXQ3IDc1djMyNHEwIDYwIC03IDc1dC0zNyAxOWwtMjEgM3EtNSA0IC01IDE1dDUgMTVxNjQgLTIgMTI5IC0ycTY0IDAgMTIxIDJxNSAtNCA1IC0xNXQtNSAtMTVsLTE4IC0zCnEtMjkgLTQgLTM2IC0xOS41dC03IC03NC41di0xMDFxMCAtMTkgNSAtMjIuNXQzMiAtMy41aDE4MHEyNyAwIDMyIDMuNXQ1IDIyLjV2MTAxcTAgNjAgLTcgNzQuNXQtMzcgMTguNWwtMjQgNHEtNSA0IC01IDE1dDUgMTVxNzIgLTIgMTMyIC0ycTYzIDAgMTIzIDJxNSAtNCA1IC0xNXQtNSAtMTVsLTE4IC0zcS0zMCAtNCAtMzcuNSAtMTkuNXQtNy41IC03NC41di0zMjRxMCAtNDIgMy41IC01OS41dDEyIC0yNHQyOS41IC0xMC41bDIxIC0zCnE1IC00IDUgLTE1LjV0LTUgLTE0LjVxLTY1IDIgLTEyNiAycS02NSAwIC0xMjggLTJxLTUgMyAtNSAxNC41dDUgMTUuNWwyMCAzcTMwIDQgMzcgMTl0NyA3NXYxMjVxMCAxOSAtNSAyMi41dC0zMiAzLjVoLTE4MHpNODY2IDE3OXEwIDEzIC0yLjUgMTZ0LTEyLjUgM2gtMTUwcS0xMiA1IC03IDIxbDIxMSAzMDFxMTEgMTYgMjEgMTZoMTlxMjAgMCA3IC0xN2wtMTk1IC0yNzFxLTYgLTYgLTMgLTkuNXQxNyAtMy41aDgwcTEwIDAgMTIuNSAzCnQyLjUgMTZ2OTBxMCAxOSAxNCAyNHE0OCAyMCA2MyAyMHE5IDAgOSAtMTF2LTEyM3EwIC0xMyAyLjUgLTE2dDEyLjUgLTNoNDNxNyAtNCA3IC0xOHQtNyAtMTloLTQzcS0xMCAwIC0xMi41IC0zdC0yLjUgLTE2di0xOHEwIC0zOSA1LjUgLTQ5dDI2LjUgLTEybDE0IC0ycTQgLTMgMy41IC0xMnQtNC41IC0xMHEtMzUgMiAtODggMnEtNzEgMCAtMTA0IC0ycS01IDEgLTUuNSAxMHQ0LjUgMTJsMjYgMnEyNCAyIDMwIDEydDYgNDl2MTh6IiAvPgogIDwvZm9udD4KPC9kZWZzPjwvc3ZnPgo=) format(\'svg\');  /* iOS 4.1- */}.eicon {  font-family: "iconfont" !important;  font-size: 16px;  font-style: normal;  -webkit-font-smoothing: antialiased;  -moz-osx-font-smoothing: grayscale;}.eicon-quotes:before {  content: "\\e60b";}.eicon-justifycenter:before {  content: "\\e601";}.eicon-justifyfull:before {  content: "\\e602";}.eicon-justifyright:before {  content: "\\e603";}.eicon-code:before {  content: "\\e612";}.eicon-upload:before {  content: "\\e618";}.eicon-justifyleft:before {  content: "\\e604";}.eicon-indent:before {  content: "\\e611";}.eicon-outdent:before {  content: "\\e613";}.eicon-createlink:before {  content: "\\e608";}.eicon-insertcode:before {  content: "\\e61a";}.eicon-bold:before {  content: "\\e60a";}.eicon-italic:before {  content: "\\e605";}.eicon-underline:before {  content: "\\e606";}.eicon-undo:before {  content: "\\e614";}.eicon-insertimage:before {  content: "\\e60c";}.eicon-insertvideo:before {  content: "\\e60d";}.eicon-close:before {  content: "\\e79e";}.eicon-math:before {  content: "\\e61d";}.eicon-insertunorderedlist:before {  content: "\\e60e";}.eicon-fontname:before {  content: "\\e607";}.eicon-backcolor:before {  content: "\\e615";}.eicon-forecolor:before {  content: "\\e743";}.eicon-resize:before {  content: "\\e61b";}.eicon-removeformat:before {  content: "\\e609";}.eicon-redo:before {  content: "\\e616";}.eicon-fontsize:before {  content: "\\e619";}.eicon-heading:before {  content: "\\e60f";}.eicon-insertorderedlist:before {  content: "\\e610";}.eicon-strikethrough:before {  content: "\\e600";}.eicon-h1:before {  content: "\\e61c";}.eicon-h2:before {  content: "\\e61e";}.eicon-h3:before {  content: "\\e61f";}.eicon-h4:before {  content: "\\e620";}.eui-toolbar {  display: -webkit-box;  display: -ms-flexbox;  display: flex;  padding: 0 5px;  /* 单个菜单 */}.eui-toolbar .eui-menu-group {  display: -webkit-box;  display: -ms-flexbox;  display: flex;  background: #f9f9f9;  border: 1px solid #f2f2f2;  border-radius: 5px;}.eui-toolbar .eui-menu-group:not(:last-child) {  margin-right: 10px;}.eui-toolbar .eui-menu-group .eui-menu-item:hover {  background: #f2f2f2;}.eui-toolbar .eui-menu-group .eui-menu-item:hover i {  color: #999;}.eui-toolbar .eui-menu-group .eui-menu-item:not(:last-child) {  border-right: 1px solid #f2f2f2;}.eui-toolbar .eui-menu-group .eui-active i {  color: #1e88e5;}.eui-toolbar .eui-menu-group .eui-active:hover i {  color: #1e88e5;}.eui-toolbar .eui-menu-item {  position: relative;  z-index: 10001;  text-align: center;  padding: 4px 8px;  cursor: pointer;}.eui-toolbar .eui-menu-item i {  font-size: 14px;  color: #999;}.eui-toolbar .eui-menu-item:hover i {  color: #333;}.eui-toolbar .eui-active i {  color: #1e88e5;}.eui-toolbar .eui-active:hover i {  color: #1e88e5;}.eui-panel-wrap {  position: absolute;  top: 0;  left: 50%;  border: 1px solid #ccc;  border-top: 0;  -webkit-box-shadow: 1px 1px 2px #ccc;          box-shadow: 1px 1px 2px #ccc;  color: #333;  background-color: #fff;  /* 上传图片的 panel 定制样式 */}.eui-panel-wrap .eui-panel-close {  position: absolute;  right: 0;  top: 0;  padding: 5px;  margin: 2px 5px 0 0;  cursor: pointer;  color: #999;}.eui-panel-wrap .eui-panel-close:hover {  color: #333;}.eui-panel-wrap .eui-panel-close .eicon {  font-size: 12px;  font-weight: bold;}.eui-panel-wrap .eui-panel-tab-title {  list-style: none;  display: -webkit-box;  display: -ms-flexbox;  display: flex;  font-size: 14px;  margin: 2px 10px 0 10px;  border-bottom: 1px solid #f1f1f1;}.eui-panel-wrap .eui-panel-tab-title .eui-tab-item {  padding: 3px 5px;  color: #999;  cursor: pointer;  margin: 0 3px;  position: relative;  top: 1px;}.eui-panel-wrap .eui-panel-tab-title .eui-tab-active {  color: #333;  border-bottom: 1px solid #333;  cursor: default;  font-weight: 700;}.eui-panel-wrap .eui-panel-tab-content {  padding: 10px 15px 10px 15px;  font-size: 16px;  /* 输入框的样式 */  /* 按钮的样式 */}.eui-panel-wrap .eui-panel-tab-content input:focus,.eui-panel-wrap .eui-panel-tab-content textarea:focus,.eui-panel-wrap .eui-panel-tab-content button:focus {  outline: none;}.eui-panel-wrap .eui-panel-tab-content textarea {  width: 100%;  border: 1px solid #ccc;  padding: 5px;}.eui-panel-wrap .eui-panel-tab-content textarea:focus {  border-color: #1e88e5;}.eui-panel-wrap .eui-panel-tab-content input[type=text] {  border: none;  border-bottom: 1px solid #ccc;  font-size: 14px;  height: 20px;  color: #333;  padding: 10px 5px;  text-align: left;}.eui-panel-wrap .eui-panel-tab-content input[type=text].small {  width: 30px;  text-align: center;}.eui-panel-wrap .eui-panel-tab-content input[type=text].block {  display: block;  width: 100%;  margin: 10px 0;}.eui-panel-wrap .eui-panel-tab-content input[type=text]:focus {  border-bottom: 2px solid #1e88e5;}.eui-panel-wrap .eui-panel-tab-content .eui-button-container button {  font-size: 14px;  color: #1e88e5;  border: none;  padding: 5px 10px;  background-color: #fff;  cursor: pointer;  border-radius: 3px;}.eui-panel-wrap .eui-panel-tab-content .eui-button-container button.left {  float: left;  margin-right: 10px;}.eui-panel-wrap .eui-panel-tab-content .eui-button-container button.right {  float: right;  margin-left: 10px;}.eui-panel-wrap .eui-panel-tab-content .eui-button-container button.gray {  color: #999;}.eui-panel-wrap .eui-panel-tab-content .eui-button-container button.red {  color: #c24f4a;}.eui-panel-wrap .eui-panel-tab-content .eui-button-container button:hover {  background-color: #f1f1f1;}.eui-panel-wrap .eui-panel-tab-content .eui-button-container:after {  content: "";  display: table;  clear: both;}.eui-panel-wrap .eui-up-img-container {  text-align: center;}.eui-panel-wrap .eui-up-img-container .eui-up-btn {  display: inline-block;  *display: inline;  *zoom: 1;  color: #999;  cursor: pointer;  font-size: 60px;  line-height: 1;}.eui-panel-wrap .eui-up-img-container .eui-up-btn:hover {  color: #333;}.eui-panel-wrap .eui-up-img-container .eui-up-btn .eicon {  font-size: 60px;}.eui-container {  position: relative;  z-index: 10000;}.eui-container .eui-progress {  position: absolute;  background-color: #1e88e5;  bottom: 0;  left: 0;  height: 1px;}.eui-content {  padding: 0 10px;  overflow-y: scroll;}.eui-content p,.eui-content h1,.eui-content h2,.eui-content h3,.eui-content h4,.eui-content h5,.eui-content table,.eui-content pre {  margin: 10px 0;  line-height: 1.5;}.eui-content ul,.eui-content ol {  margin: 10px 0 10px 20px;}.eui-content blockquote {  display: block;  border-left: 8px solid #d0e5f2;  padding: 5px 10px;  margin: 10px 0;  line-height: 1.4;  font-size: 100%;  background-color: #f1f1f1;}.eui-content code {  display: inline-block;  *display: inline;  *zoom: 1;  background-color: #f1f1f1;  border-radius: 3px;  padding: 3px 5px;  margin: 0 3px;}.eui-content pre code {  display: block;}.eui-content table {  border-top: 1px solid #ccc;  border-left: 1px solid #ccc;}.eui-content table td,.eui-content table th {  border-bottom: 1px solid #ccc;  border-right: 1px solid #ccc;  padding: 3px 5px;}.eui-content table th {  border-bottom: 2px solid #ccc;  text-align: center;}.eui-content:focus {  outline: none;}.eui-content img {  cursor: pointer;}.eui-content img:hover {  -webkit-box-shadow: 0 0 5px #333;          box-shadow: 0 0 5px #333;}.eui-content img.eui-selected {  border: 2px solid #1e88e5;}.eui-content img.eui-selected:hover {  -webkit-box-shadow: none;          box-shadow: none;}';

// 将 css 代码添加到 <style> 中
var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = inlinecss;
document.getElementsByTagName('HEAD').item(0).appendChild(style

// 返回
);var index = window.SEditor || Editor;

return index;

})));
