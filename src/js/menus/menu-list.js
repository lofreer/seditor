/*
    所有菜单的汇总
*/

// 存储菜单的构造函数
const MenuConstructors = {}

import Bold from './bold'
MenuConstructors.bold = Bold

import Italic from './italic'
MenuConstructors.italic = Italic

import Underline from './underline'
MenuConstructors.underline = Underline

import Head from './head'
MenuConstructors.head = Head

import StrikeThrough from './strikethrough'
MenuConstructors.strikeThrough = StrikeThrough

import Undo from './undo'
MenuConstructors.undo = Undo

import Redo from './redo'
MenuConstructors.redo = Redo

import ForeColor from './foreColor'
MenuConstructors.foreColor = ForeColor

import BackColor from './backColor'
MenuConstructors.backColor = BackColor

import List from './list'
MenuConstructors.list = List

import Justify from './justify'
MenuConstructors.justify = Justify

import Quote from './quote'
MenuConstructors.quote = Quote

import Image from './image'
MenuConstructors.image = Image

import Video from './video'
MenuConstructors.video = Video

import Code from './code'
MenuConstructors.code = Code

// 吐出所有菜单集合
export default MenuConstructors