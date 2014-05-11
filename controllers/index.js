var markdown = require("markdown");
var moment = require("moment");
var Q = require('q');
var settings = require("../settings");
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;

///数据库配置
var dbSettings = settings.db;
var db = new Db(dbSettings.name, new Server(dbSettings.host, dbSettings.port, {}), {w: 1});
db.open(function (err, db) {
    if (dbSettings.username) {
        db.authenticate(dbSettings.username, dbSettings.password, function (err, result) {
            if (err) {
                console.error(err);
                db.close();
                return;
            }
        });
    }
});

var siteSeting = settings.site;
module.exports = {

    /**
     * 获取主页
     * @param req
     * @param res
     */
    index: function (req, res) {

    },
    archive: function (req, res) {
        var id = req.params.id;
        db.collection('archive', function (err, collection) {
            collection.findOne({_id: id}, function (err, item) {

                item.content = markdown.parse(item.content);
                item.createTime = util.formatDate(item.createTime, 'yyyy-MM-dd hh:mm:ss');
                res.render(siteSeting.theme + 'archive', {
                    title: siteSeting.title,
                    archive: item
                });
            });
        });
    },
    tags: function (req, res) {
        var p = req.query.p, tag = req.query.tag, perPage = settings.peger.perPage,
            currentPage = parseInt(p) || 1 ,
            skip = perPage * (currentPage - 1);
        db.collection('archive', function (err, collection) {
            collection.find({tags: tag}, {skip: skip, limit: perPage, sort: {createTime: -1}})
                .toArray(function (err, items) {
                    //裁剪文章内容 格式化日期
                    items.forEach(function (item) {
                        item.createTime = util.formatDate(item.createTime, 'yyyy-MM-dd hh:mm:ss');
                    });
                    var renderObj = {title: siteSeting.title}, pager = {};
                    renderObj.archives = items;
                    renderObj.pager = pager;
                    //页码计算
                    pager.count = items.length;
                    pager.previous = currentPage > 1 ? currentPage - 1 : 0;
                    if (items.length >= perPage) {
                        pager.next = currentPage + 1;
                    } else {
                        pager.next = 0;
                    }
                    res.render(siteSeting.theme + 'index', renderObj);
                })
        });
    },
    categories: function (req, res) {
        var p = req.query.p, categorie = req.query.categorie, perPage = settings.peger.perPage,
            currentPage = parseInt(p) || 1 ,
            skip = perPage * (currentPage - 1);
        db.collection('archive', function (err, collection) {
            collection.find({categories: categorie}, {skip: skip, limit: perPage, sort: {createTime: -1}})
                .toArray(function (err, items) {
                    //裁剪文章内容 格式化日期
                    items.forEach(function (item) {
                        item.createTime = moment(item.createTime, 'yyyy-MM-dd hh:mm:ss');
                    });
                    var renderObj = {title: siteSeting.title}, pager = {};
                    renderObj.archives = items;
                    renderObj.pager = pager;
                    //页码计算
                    pager.count = items.length;
                    pager.previous = currentPage > 1 ? currentPage - 1 : 0;
                    if (items.length >= perPage) {
                        pager.next = currentPage + 1;
                    } else {
                        pager.next = 0;
                    }
                    res.render(siteSeting.theme + 'index', renderObj);
                })
        });
    },

    about : function(req,res){
        res.render(siteSeting.theme + 'about',{title: siteSeting.title});
    },
    send: function (req, res) {
        res.render(siteSeting.theme + 'admin/edit-archive');
    },
    saveArchive: function (req, res) {
        var archive = req.body, tags = archive.tags, categories = archive.categories;
        if (!archive._id) {
            archive._id = '' + new Date().getTime();
        }
        if (tags) {
            archive.tags = tags.split(';');
        }
        if (categories) {
            archive.categories = categories.split(';');
        }
        archive.createTime = new Date();

        db.collection('archive', function (err, collection) {
            collection.insert(archive, function () {
                res.redirect('/');
            })
        });
    },
    page404: function (req, res) {
        res.status(404).render(siteSeting.theme + "404", { url: req.originalUrl });
    }
};

