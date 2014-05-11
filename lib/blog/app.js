/**
 * Created by hexin on 2014/5/11.
 */
var path = require('path'),
    archive = require('../archive/archive'),
    settings = require("../../settings");


//TODO 文件不存在
var archive_path = path.join(__dirname, '../../source/posts');
var tpl_path = path.join(__dirname, '../../public/blog/themes', settings.site.theme);
var html_path = path.join(__dirname, '../../public/blog/');

archive.get_all_archive(archive_path)
    .then(function (archives) {

        archives.forEach(function (post) {
            var url_path = path.join('/archives', post.file_name + '.html');
            var html_file = path.join(html_path, url_path);
            archive.crate_archive_file(post, html_path)
        });

        //index
        var per = settings.peger.per_page, len = archives.length, index = 0;
        for (var i = 0 , max_page = parseInt(len / per) + 1; i < max_page; i++) {
            var tmp = Math.max(per, len - index), pager = {}, as = [];
            //页码计算
            pager.count = len;
            pager.previous = i > 1 ? i - 1 : 0;
            if ((i + 1) * per > len) {
                pager.next = i;
            } else {
                pager.next = i + 1;
            }
            for (var j = 0; j < tmp - 1; j++ , index++) {
                as.push(archives[j]);
            }
            archive.create_archive_list_file(as, html_path, pager);
        }
    });