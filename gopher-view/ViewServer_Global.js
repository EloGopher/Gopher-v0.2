var sqlite3 = require('sqlite3');
var dbPath = 'ManagerDB.db';
var fs = exports.fs = require('fs');


exports.dbConn = function (callBack) {
    fs.exists(dbPath, function (exists) {
        if (exists) {
            return callBack(null,new sqlite3.Database(dbPath));
        } else {
            return callBack('Database does not exist.',null);
        }
    });
};

exports.gopherViewRoot = 'gopher-view';

exports.extensions = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".png": "image/png",
    ".gif": "image/gif",
    ".jpg": "image/jpeg",
    ".gbn": "application/javascript",
    ".woff":"application/x-font-woff",
    ".ttf":"application/x-font-woff",
    ".eot":"application/x-font-eot"
};

