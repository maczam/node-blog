/**
 * Created by hexin on 2014/5/11.
 */
var path = require('path'),
    Q = require('q'),
    log = require('log4js').getLogger('blog-app'),
    archive = require('../archive/archive'),
    fsext = require('../fs/fsext'),
    settings = require("../../settings");

console.time('app cast');
//TODO 文件不存在
var archive_path = path.join(__dirname, '../../source/posts');
var tpl_path = path.join(__dirname, '../../public/blog/themes', settings.site.theme);
var html_path = path.join(__dirname, '../../public/blog/html/');

var posts;
archive.get_all_archive(archive_path)
    .then(function (ps) {
        //倒叙排列
        ps.sort(function (a, b) {
            var adate = a.sort_date ? a.sort_date : new Date(),
                bdate = b.sort_date ? b.sort_date : new Date();
            return adate.getTime() <= bdate.getTime() ? 1 : -1;
        });
        posts = ps;
        log.debug(" total posts >>> " + ps.length);
        var create_html_funs = ps.map(function (post) {
            var url_path = path.join('/archives', post.file_name + '.html'),
                file_path = path.join(html_path, '/archives'),
                file_name = path.join(html_path, url_path);
            fsext.mkdirs(file_path);
            post.url_path = url_path;
            return archive.crate_archive_html_file(post, file_name)
        });
        return Q.all(create_html_funs);
    })
    .then(function () {
        //index
        var per = settings.peger.per_page, len = posts.length, index = 0, max_page = parseInt(len / per) + 1;
        for (var i = 1; i <= max_page; i++) {
            var pager = {}, as = [], page_paths = [], page_path;
            pager.total_pages = max_page;
            pager.current_page = i;
            for (var j = 0; j < per && index < len; j++, index++) {
                as.push(posts[index]);
            }

            if (i == 1) {
                page_paths.push(path.dirname(html_path));
                page_paths.push(html_path);
            }
            page_path = path.join(html_path, '/page' + i);
            fsext.mkdirs(page_path);
            page_paths.push(page_path);
            archive.create_archive_list_file(as, page_paths, pager);
        }

        //tag
        var tags = {};
        posts.forEach(function (p) {
            p.tags.forEach(function (tag) {
                if (tags.hasOwnProperty(tag)) {
                    tags[tag].push(p);
                } else {
                    tags[tag] = [p];
                }
            })
        });
        Object.keys(tags).forEach(function (tag) {
            var base_html_path = path.join(html_path, 'tags/', tag);
            fsext.mkdirs(base_html_path);
            archive.create_archive_list_file(tags[tag], base_html_path, void 0);
        });

        console.timeEnd('app cast');
    })
    .fail(function (err) {
        log.error(err.stack);
    });
