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
                            // 触发 onchange
                            editor.change && editor.change(true);
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
                            // 触发 onchange
                            editor.change && editor.change(true);
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
                            // 触发 onchange
                            editor.change && editor.change(true);
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
                this.change = function (isChange) {
                    var _this2 = this;

                    // 判断是否有变化
                    var currentHtml = this.content.html
                    // 如果指定改变，则不必判断 应用场景：比如图片改变宽度值
                    ();if (!isChange && currentHtml.length === beforeChangeHtml.length) return;

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
var inlinecss = '.eui-content:focus,.eui-panel-wrap .eui-panel-tab-content button:focus,.eui-panel-wrap .eui-panel-tab-content input:focus,.eui-panel-wrap .eui-panel-tab-content textarea:focus{outline:0}.eui-container,.eui-menu-panel,.eui-toolbar{font-family:"Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;font-size:14px;padding:0;margin:0;-webkit-box-sizing:border-box;box-sizing:border-box}.eui-container *,.eui-menu-panel *,.eui-toolbar *{padding:0;margin:0;-webkit-box-sizing:border-box;box-sizing:border-box}.eui-menu-item .eui-droplist{position:absolute;left:0;top:0;background-color:#fff;border:1px solid #f1f1f1;border-right-color:#ccc;border-bottom-color:#ccc}.eui-menu-item .eui-droplist ul.eui-drop-block li.eui-drop-item:hover,.eui-menu-item .eui-droplist ul.eui-drop-list li.eui-drop-item:hover{background-color:#f1f1f1}.eui-menu-item .eui-droplist .eui-drop-title{text-align:center;color:#999;line-height:2;border-bottom:1px solid #f1f1f1;font-size:13px}.eui-menu-item .eui-droplist ul.eui-drop-list{list-style:none;line-height:1}.eui-menu-item .eui-droplist ul.eui-drop-list li.eui-drop-item{line-height:1.5;color:#333;padding:5px 0}.eui-menu-item .eui-droplist ul.eui-drop-block{list-style:none;text-align:left;padding:5px}.eui-menu-item .eui-droplist ul.eui-drop-block li.eui-drop-item{display:inline-block;padding:3px 5px}@font-face{font-family:iconfont;src:url(data:application/x-font-ttf;charset=utf-8;base64,) format(\'truetype\')}.eicon{font-family:iconfont!important;font-size:16px;font-style:normal;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.eicon-quotes:before{content:"\\e60b"}.eicon-justifycenter:before{content:"\\e601"}.eicon-justifyfull:before{content:"\\e602"}.eicon-justifyright:before{content:"\\e603"}.eicon-code:before{content:"\\e612"}.eicon-upload:before{content:"\\e618"}.eicon-justifyleft:before{content:"\\e604"}.eicon-indent:before{content:"\\e611"}.eicon-outdent:before{content:"\\e613"}.eicon-createlink:before{content:"\\e608"}.eicon-insertcode:before{content:"\\e61a"}.eicon-bold:before{content:"\\e60a"}.eicon-italic:before{content:"\\e605"}.eicon-underline:before{content:"\\e606"}.eicon-undo:before{content:"\\e614"}.eicon-insertimage:before{content:"\\e60c"}.eicon-insertvideo:before{content:"\\e60d"}.eicon-close:before{content:"\\e79e"}.eicon-math:before{content:"\\e61d"}.eicon-insertunorderedlist:before{content:"\\e60e"}.eicon-fontname:before{content:"\\e607"}.eicon-backcolor:before{content:"\\e615"}.eicon-forecolor:before{content:"\\e743"}.eicon-resize:before{content:"\\e61b"}.eicon-removeformat:before{content:"\\e609"}.eicon-redo:before{content:"\\e616"}.eicon-fontsize:before{content:"\\e619"}.eicon-heading:before{content:"\\e60f"}.eicon-insertorderedlist:before{content:"\\e610"}.eicon-strikethrough:before{content:"\\e600"}.eicon-h1:before{content:"\\e61c"}.eicon-h2:before{content:"\\e61e"}.eicon-h3:before{content:"\\e61f"}.eicon-h4:before{content:"\\e620"}.eui-toolbar{display:-webkit-box;display:-ms-flexbox;display:flex;padding:0 5px}.eui-toolbar .eui-menu-group{display:-webkit-box;display:-ms-flexbox;display:flex;background:#f9f9f9;border:1px solid #f2f2f2;border-radius:5px}.eui-toolbar .eui-menu-group:not(:last-child){margin-right:10px}.eui-toolbar .eui-menu-group .eui-menu-item:hover{background:#f2f2f2}.eui-toolbar .eui-menu-group .eui-menu-item:hover i{color:#999}.eui-toolbar .eui-menu-group .eui-menu-item:not(:last-child){border-right:1px solid #f2f2f2}.eui-toolbar .eui-menu-group .eui-active i,.eui-toolbar .eui-menu-group .eui-active:hover i{color:#1e88e5}.eui-toolbar .eui-menu-item{position:relative;z-index:10001;text-align:center;padding:4px 8px;cursor:pointer}.eui-toolbar .eui-menu-item i{font-size:14px;color:#999}.eui-toolbar .eui-menu-item:hover i{color:#333}.eui-toolbar .eui-active i,.eui-toolbar .eui-active:hover i{color:#1e88e5}.eui-panel-wrap{position:absolute;top:0;left:50%;border:1px solid #ccc;border-top:0;-webkit-box-shadow:1px 1px 2px #ccc;box-shadow:1px 1px 2px #ccc;color:#333;background-color:#fff}.eui-panel-wrap .eui-panel-close{position:absolute;right:0;top:0;padding:5px;margin:2px 5px 0 0;cursor:pointer;color:#999}.eui-panel-wrap .eui-panel-close:hover{color:#333}.eui-panel-wrap .eui-panel-close .eicon{font-size:12px;font-weight:700}.eui-panel-wrap .eui-panel-tab-title{list-style:none;display:-webkit-box;display:-ms-flexbox;display:flex;font-size:14px;margin:2px 10px 0;border-bottom:1px solid #f1f1f1}.eui-panel-wrap .eui-panel-tab-title .eui-tab-item{padding:3px 5px;color:#999;cursor:pointer;margin:0 3px;position:relative;top:1px}.eui-panel-wrap .eui-panel-tab-title .eui-tab-active{color:#333;border-bottom:1px solid #333;cursor:default;font-weight:700}.eui-panel-wrap .eui-panel-tab-content{padding:10px 15px;font-size:16px}.eui-panel-wrap .eui-panel-tab-content textarea{width:100%;border:1px solid #ccc;padding:5px}.eui-panel-wrap .eui-panel-tab-content textarea:focus{border-color:#1e88e5}.eui-panel-wrap .eui-panel-tab-content input[type=text]{border:none;border-bottom:1px solid #ccc;font-size:14px;height:20px;color:#333;padding:10px 5px;text-align:left}.eui-panel-wrap .eui-panel-tab-content input[type=text].small{width:30px;text-align:center}.eui-panel-wrap .eui-panel-tab-content input[type=text].block{display:block;width:100%;margin:10px 0}.eui-panel-wrap .eui-panel-tab-content input[type=text]:focus{border-bottom:2px solid #1e88e5}.eui-panel-wrap .eui-panel-tab-content .eui-button-container button{font-size:14px;color:#1e88e5;border:none;padding:5px 10px;background-color:#fff;cursor:pointer;border-radius:3px}.eui-panel-wrap .eui-panel-tab-content .eui-button-container button.left{float:left;margin-right:10px}.eui-panel-wrap .eui-panel-tab-content .eui-button-container button.right{float:right;margin-left:10px}.eui-panel-wrap .eui-panel-tab-content .eui-button-container button.gray{color:#999}.eui-panel-wrap .eui-panel-tab-content .eui-button-container button.red{color:#c24f4a}.eui-panel-wrap .eui-panel-tab-content .eui-button-container button:hover{background-color:#f1f1f1}.eui-panel-wrap .eui-panel-tab-content .eui-button-container:after{content:"";display:table;clear:both}.eui-panel-wrap .eui-up-img-container{text-align:center}.eui-panel-wrap .eui-up-img-container .eui-up-btn{display:inline-block;color:#999;cursor:pointer;line-height:1;padding:6px 0;-webkit-transition:all .3s;transition:all .3s}.eui-panel-wrap .eui-up-img-container .eui-up-btn:hover{color:#333}.eui-panel-wrap .eui-up-img-container .eui-up-btn .eicon{font-size:60px}.eui-container{position:relative;z-index:10000}.eui-container .eui-progress{position:absolute;background-color:#1e88e5;bottom:0;left:0;height:1px}.eui-content{padding:0 10px;overflow-y:scroll}.eui-content h1,.eui-content h2,.eui-content h3,.eui-content h4,.eui-content h5,.eui-content p,.eui-content pre,.eui-content table{margin:10px 0;line-height:1.5}.eui-content ol,.eui-content ul{margin:10px 0 10px 20px}.eui-content blockquote{display:block;border-left:8px solid #d0e5f2;padding:5px 10px;margin:10px 0;line-height:1.4;font-size:100%;background-color:#f1f1f1}.eui-content code{display:inline-block;background-color:#f1f1f1;border-radius:3px;padding:3px 5px;margin:0 3px}.eui-content pre code{display:block}.eui-content table{border-top:1px solid #ccc;border-left:1px solid #ccc}.eui-content table td,.eui-content table th{border-bottom:1px solid #ccc;border-right:1px solid #ccc;padding:3px 5px}.eui-content table th{border-bottom:2px solid #ccc;text-align:center}.eui-content img{cursor:pointer}.eui-content img:hover{-webkit-box-shadow:0 0 5px #333;box-shadow:0 0 5px #333}.eui-content img.eui-selected{border:2px solid #1e88e5}.eui-content img.eui-selected:hover{-webkit-box-shadow:none;box-shadow:none}';

// 将 css 代码添加到 <style> 中
var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = inlinecss;
document.getElementsByTagName('HEAD').item(0).appendChild(style

// 返回
);var index = window.SEditor || Editor;

return index;

})));
