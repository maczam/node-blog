/**
 * Created by hexin on 2014/5/11.
 */
var fs = require('fs'),
    path = require('path'),
    settings = require("../../settings");
var theme_path = path.join(__dirname, '../../public/blog/themes', settings.site.theme);

module.exports = {
    archive_html_tlp: function () {
        var ejs_file = path.join(theme_path, 'archive.ejs');
        return {
            path: ejs_file,
            context: (new Buffer(fs.readFileSync(ejs_file))).toString()
        };
    },

    index_html_tlp: function () {
        var ejs_file = path.join(theme_path, 'index.ejs');
        return {
            path: ejs_file,
            context: (new Buffer(fs.readFileSync(ejs_file))).toString()
        }
    }
};