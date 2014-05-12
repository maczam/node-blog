/**
 * Created by hexin on 2014/5/11.
 */

var fs = require('fs'),
    path = require('path'),
    markdown = require("markdown"),
    Q = require('q'),
    ejs = require('ejs'),
    log = require('log4js').getLogger('archive'),
    fsext = require('../fs/fsext'),
    ejstpl = require('../render/ejstpl'),
    settings = require("../../settings");

var tpl_path = path.join(__dirname, '../../public/blog/themes', settings.site.theme);

module.exports = {

    /**
     *
     * @param archive_root
     * @returns {*}
     */
    get_all_archive: function (archive_root) {
        //递归
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
                log.debug('translation_md archive_md_path >>>> ' + archive_md_path);
                var file_content_line = file_content.split('\n');
                var sing = true, post_context_lines = [], post = {}, xx = /^\s*(\w+)\s*?\:\s*(.+)/;

                post.file_name = path.basename(archive_md_path, '.md');
                //index 需要增加上开头和结尾的两行
                for (var index = 0, len = file_content_line.length, line; index < len; index++) {
                    line = file_content_line[index];
                    if (index == 0 && line.indexOf('---') >= 0) {
                        sing = true;
                        continue;
                    }
                    if (sing && line.indexOf('---') >= 0 && index <= 10) {
                        sing = false;
                        continue;
                    }
                    /// post相关信息
                    if (sing) {
                        console.log(line);
                        var desc = xx.exec(line);
                        switch (desc[1]) {
                            case 'layout':
                                post.tpl_file = path.join(tpl_path, desc[2] + '.ejs');
                                break;
                            case 'date':
                                post.sort_date = new Date(desc[2]);
                                post.date = desc[2];
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

                //最后补全所有的值
                post.tags ? void 0 : post.tags = ['随笔'];

                post.content = markdown.parse(post_context_lines.join('\n'));
                deferred.resolve(post);
            })
            .fail(function (err) {
                log.error(err.stack);
                deferred.reject(err);
            });
        return deferred.promise;
    },

    /**
     *
     * 将archive文件写入不同的地方
     * @param archive
     * @param html_file
     * @returns {promise|*|Q.promise}
     */
    crate_archive_html_file: function (archive, html_file) {
        try {
            var renderObj = {archive: archive, title: settings.site.title},
                tpl = ejstpl.archive_html_tlp();
            renderObj.filename = archive.tpl_file;
            fs.writeFileSync(html_file, ejs.render(tpl.context, renderObj))
        } catch (err) {
            if (err) {
                log.error(err.stack);
            }
        }
    },

    /**
     *
     * @param archives
     * @param html_path
     * @param pager
     */
    create_archive_list_file: function (archives, html_paths, pager) {
        try {
            log.debug('create archive_list html_paths >> ' + html_paths);
            log.debug('create archive_list pager >> ' + JSON.stringify(pager));
            var renderObj = {title: settings.site.title}, pager = pager || {};
            renderObj.archives = archives;
            var renderObj = {archives: archives, title: settings.site.title, pager: pager};
            var tpl = ejstpl.index_html_tlp();
            renderObj.filename = tpl.path;
            if (html_paths instanceof Array) {
                html_paths.forEach(function (html_path) {
                    var html_file = path.join(html_path, 'index.html');
                    fs.writeFileSync(html_file, ejs.render(tpl.context, renderObj))
                });
            } else {
                var html_file = path.join(html_paths, 'index.html');
                fs.writeFileSync(html_file, ejs.render(tpl.context, renderObj))
            }
        } catch (err) {
            if (err) {
                log.error(err.stack);
            }
        }
    }
};