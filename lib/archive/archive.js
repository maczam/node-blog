/**
 * Created by hexin on 2014/5/11.
 */

var fs = require('fs'),
    path = require('path'),
    markdown = require("markdown"),
    Q = require('q'),
    ejs = require('ejs'),
    fsext = require('../fs/fsext'),
    ejstpl = require('../render/ejstpl'),
    settings = require("../../settings");

var tpl_path = path.join(__dirname, '../../public/blog/themes', settings.site.theme);

module.exports = {

    get_all_archive: function (archive_root) {
        var posts = fs.readdirSync(archive_root), self = this,
            post_funs = posts.map(function (file) {
                return self.translation_md(path.join(archive_root, file));
            });
        return Q.all(post_funs);
    },
    translation_md: function (archive_md_path) {
        var deferred = Q.defer();
        fsext.read_file(archive_md_path)
            .then(function (file_content) {
                var file_content_line = file_content.split('\n');
                var sing = true, post_context_lines = [], post = {}, xx = /^\s*(\w+)\s*?\:\s*(.+)/;

                post.file_name = path.basename(archive_md_path, '.md');
                post.url = 'todo';
                for (var index = 0, len = file_content_line.length, line; index < len; index++) {
                    line = file_content_line[index];
                    if (index == 0 && line.indexOf('---') >= 0) {
                        sing = true;
                        continue;
                    }
                    if (sing && line.indexOf('---') >= 0 && index <= 6) {
                        sing = false;
                        continue;
                    }
                    if (sing) {
                        var desc = xx.exec(line);
                        switch (desc[1]) {
                            case 'layout':
                                post.tpl_file = path.join(tpl_path, desc[2] + '.ejs');
                                break;
                            case 'tags':
                                var tags = desc[2];
                                if (tags && tags.charAt(0) == '[') {
                                    post.tags = tags.substr(1, tags.length - 2).split(',');
                                } else {
                                    post.tags = [desc[2]];
                                }
                                break;
                            case 'categories':
                                var categories = desc[2];
                                if (categories && categories.charAt(0) == '[') {
                                    post.categories = tags.substr(1, tags.length - 2).split(',');
                                } else {
                                    post.categories = [desc[2]];
                                }
                                break;
                            default :
                                post[desc[1]] = desc[2];
                                break;
                        }
                    } else {
                        post_context_lines.push(line);
                    }
                }
                post.context = markdown.parse(post_context_lines.join('\n'));
                deferred.resolve(post);
            })
            .fail(function (err) {
                deferred.reject(err);
            });
        return deferred.promise;
    },

    /**
     * 创建archive的html文件，成功返回html文件的绝对地址
     * @param archive
     * @param html_path
     * @returns {promise|*|Q.promise}
     */
    crate_archive_file: function (archive, html_path) {
        try {
            var renderObj = {archive: archive, title: settings.site.title};
            renderObj.filename = archive.tpl_file;
            fs.writeFileSync(html_file, ejs.render(ejstpl.archive_html_tlp(), renderObj))
        } catch (err) {
           console.log(err.track);
        }
    },

    create_archive_list_file: function (archives, html_path, pager) {
        try {

            var renderObj = {title: settings.site.title}, pager = {};
            renderObj.archives = archives;
            var renderObj = {archives: archives, title: settings.site.title,pager:pager};
            var tpl = ejstpl.index_html_tlp();
            renderObj.filename = tpl.path;
            var html_file = path.join(html_path, 'index.html');
            console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
            console.log(renderObj);
            console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');


            fs.writeFile(html_file, ejs.render(tpl.context, renderObj), function (err, data) {
                console.log(err);
                console.log(data);
            })
        } catch (e) {
            console.log(e.stack);
        }
    }
};