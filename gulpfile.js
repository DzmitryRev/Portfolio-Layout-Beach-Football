let project_folder = "dist";
let source_folder = "#src";

let path = {
    build: {
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        img: project_folder + "/img/",
        fonts: project_folder + "/fonts/",
    },
    src: {
        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
        css: source_folder + "/scss/style.scss",
        js: source_folder + "/js/script.js",
        img: source_folder + "/img/**/*.+(png|jpg|gif|ico|svg|webp)",
        fonts: source_folder + "/fonts/*.ttf",
    },
    watch: {
        html: source_folder + "/**/*.html",
        css: source_folder + "/scss/**/*.scss",
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/img/**/*.+(png|jpg|gif|ico|svg|webp)",
    },
    clean: "./" + project_folder + "/",
};

let { src, dest } = require("gulp"),
    gulp = require("gulp"),
    browsersync = require("browser-sync").create(),
    fileinclude = require("gulp-file-include"),
    del = require("del"),
    scss = require("gulp-sass")(require("sass")),
    autoprefixer = require("gulp-autoprefixer"),
    group_media = require("gulp-group-css-media-queries"),
    clean_css = require("gulp-clean-css"),
    rename = require("gulp-rename"),
    uglify = require("gulp-uglify-es").default,
    imagemin = require("gulp-imagemin"),
    webp = require("gulp-webp"),
    webphtml = require("gulp-webp-html"),
    webpcss = require("gulp-webpcss"),
    svgsprite = require("gulp-svg-sprite");

// Функция для синхронизации с браузером

function browserSync(params) {
    browsersync.init({
        server: {
            baseDir: "./" + project_folder + "/",
        },
        port: 3000,
        notify: false,
    });
}

// Функция для работы с html

function html() {
    return (
        src(path.src.html)
            .pipe(fileinclude()) //Обьеденение html файлов
            // .pipe(webphtml())
            .pipe(dest(path.build.html)) //Выгружает из src в build
            .pipe(browsersync.stream())
    ); //Перезагрузка
}

// Функция для работы с css

function css() {
    return src(path.src.css)
        .pipe(
            scss({
                outputStyle: "expanded",
            })
        )
        .pipe(group_media())
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["last 5 versions"],
                cascade: true,
            })
        )
        .pipe(webpcss({ webpClass: ".webp", noWebpClass: ".no-webp" }))
        .pipe(dest(path.build.css)) //Выгружает из src в build
        .pipe(clean_css())
        .pipe(
            rename({
                extname: ".min.css",
            })
        )
        .pipe(dest(path.build.css)) //Сжимает и выгружает из min.css src в build
        .pipe(browsersync.stream()); //Перезагрузка
}

// Функция для работы с js

function js() {
    return src(path.src.js)
        .pipe(fileinclude()) //Обьеденение js файлов
        .pipe(dest(path.build.js)) //Выгружает из src в build
        .pipe(uglify())
        .pipe(
            rename({
                extname: ".min.js",
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream()); //Перезагрузка
}

// Функция для работы с image

function images() {
    return src(path.src.img)
        // .pipe(
        // 	imagemin({
        // 		progressive: true,
        // 		svgoPlugins: [{ removeViewBox: false }],
        // 		interplaced: true,
        // 		optimizationLevel: 3,
        // 	})
        // )
        .pipe(dest(path.build.img)) //Выгружает из src в build
        .pipe(browsersync.stream()); //Перезагрузка
}

gulp.task("svgSprite", function () {
    return gulp
        .src([source_folder + "/iconsprite/*svg"])
        .pipe(
            svgsprite({
                mode: {
                    stack: {
                        sprite: "../icons/icons.svg",
                        example: true,
                    },
                },
            })
        )
        .pipe(dest(path.build.img));
});

// Функция для отслеживания изменений
function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
}

// Функция для очистки dist
function clean() {
    return del(path.clean); // Путь к папке которую очистить
}

let build = gulp.series(clean, gulp.parallel(css, js, html, images));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.images = images;
exports.js = js;
exports.css = css;
exports.build = build;
exports.html = html;
exports.watch = watch;
exports.default = watch;
