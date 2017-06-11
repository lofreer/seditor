const path = require('path')
const fs = require('fs')
const gulp = require('gulp')
const rollup = require('rollup')
const uglify = require('gulp-uglify')
const sourcemaps = require('gulp-sourcemaps')
const rename = require('gulp-rename')
const less = require('gulp-less')
const concat = require('gulp-concat')
const cssmin = require('gulp-cssmin')
const eslint = require('rollup-plugin-eslint')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const cssgrace = require('cssgrace')
const resolve = require('rollup-plugin-node-resolve')
const babel = require('rollup-plugin-babel')
const gulpReplace = require('gulp-replace')
const connect = require('gulp-connect')
const liverreload = require('gulp-livereload')

gulp.task('connect', function() {
    connect.server({
        root: './',
        port: 8000,
        livereload: true
    })
})

gulp.task('html', function() {
    return gulp.src('./example/*.html')
        .pipe(connect.reload())
})

// 拷贝fonts文件
gulp.task('fonts', () => {
    gulp.src('./src/fonts/*')
    .pipe(gulp.dest('./lib/fonts'))
    .pipe(connect.reload())
})

gulp.task('styles', () => {
    gulp.src('./src/less/*')
    .pipe(less())
    .pipe(concat('seditor.css'))
    .pipe(postcss([
        autoprefixer,
        cssgrace
    ]))
    // 将 css 引用的字体文件转换为 base64 格式
    .pipe(gulpReplace( /'fonts\/iconfont\..+?'/gm, function (fontFile) {
        // fontFile 例如 'fonts/icomoon.eot?paxlku'
        fontFile = fontFile.slice(0, -1).slice(1)
        fontFile = fontFile.split('?')[0]
        var ext = fontFile.split('.')[1]
        // 读取文件内容，转换为 base64 格式
        var filePath = path.resolve(__dirname, 'lib', fontFile)
        var content = fs.readFileSync(filePath)
        var base64 = content.toString('base64')
        // 返回
        return 'data:application/x-font-' + ext + ';charset=utf-8;base64,' + base64
    }))
    .pipe(gulp.dest('./lib'))
    .pipe(rename('seditor.min.css'))
    .pipe(cssmin())
    .pipe(gulp.dest('./lib'))
    .pipe(connect.reload())
})

gulp.task('scripts', () => {
    return rollup.rollup({
        entry: './src/js/index.js',
        plugins: [
            eslint(),
            resolve(),
            babel({
                exclude: 'node_modules/**'
            })
        ]
    }).then(bundle => {
        bundle.write({
            format: 'umd',
            moduleName: 'SEditor',
            dest: './lib/seditor.js'
        }).then(() => {
            gulp.src('./lib/seditor.js')
            // inline css
            .pipe(gulpReplace(/__INLINE_CSS__/gm, function () {
                // 读取 css 文件内容
                var filePath = path.resolve(__dirname, 'lib', 'seditor.css')
                var content = fs.readFileSync(filePath).toString('utf-8')
                // 替换 \n \ ' 三个字符
                content = content.replace(/\n/g, '').replace(/\\/g, '\\\\').replace(/'/g, '\\\'')
                return content
            }))
            .pipe(gulp.dest('./lib'))
            .pipe(sourcemaps.init())
            .pipe(uglify()) 
            .pipe(rename('seditor.min.js'))
            .pipe(sourcemaps.write(''))
            .pipe(gulp.dest('./lib'))
            .pipe(connect.reload())
        })
    })
})

gulp.task('default', () => {
    gulp.run('fonts', 'styles', 'scripts', 'connect')

    gulp.watch('./src/js/**/*.js', ['scripts'])
    gulp.watch('./src/less/*.less', ['styles'])
    gulp.watch('./example/**/*.html', ['html'])
})