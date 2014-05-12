
var settings = require('./settings'),
    theme = settings.site.theme;
module.exports = function (app) {
    app.all('*', function(req, res){
        res.status(404).render(theme + "/404", { url: req.originalUrl })
    });
};