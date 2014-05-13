/**
 * Created by hexin on 2014/5/11.
 */
var fs = require('fs'),
    path = require('path'),
    Q = require('q');
module.exports = {

    /**
     * 递归创建目录传递过来必须是目录
     * @param p
     */
    mkdirs: function (p) {
        var tmppath = p, paths = [];
        while (!fs.existsSync(tmppath)) {
            paths.unshift(tmppath);
            tmppath = path.dirname(tmppath);
        }
        paths.forEach(function (t) {
            if (!fs.existsSync(t)) {
                fs.mkdirSync(t);
            }
        })
    },

    // 写入文件，
    write_file: function (file_name, content) {

        var deferred = Q.defer(), self = this;
        self.mkdirs(path.dirname(file_name));
        fs.writeFile(file_name, content, function (err) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve();
            }
        });
        return deferred.promise;
    },

    //异步读取文件
    read_file: function (file_path) {
        var deferred = Q.defer();
        fs.readFile(file_path, function (err, data) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(data.toString());
            }
        });
        return deferred.promise;
    },

    is_directory: function (file_path) {
        var deferred = Q.defer();
        try {
            var stat = fs.lstatSync(file_path);
            deferred.resolve(stat.isDirectory());
        } catch (err) {
            deferred.reject(err);
        }
        return deferred.promise;
    }
};