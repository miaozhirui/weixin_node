'use strict';

var path = require('path');
var util = require('./libs/util');

var wechat_file = path.join(__dirname, './config/wechat.txt');

var config = {

    wechat : {
        appID: 'wx0c1c18ae371dc28b',
        appSecret: 'e1f6a0d6bd3d35ef73573d7be59c0ae5',
        token: 'mzr',
        getAccessToken: function(data) {

            return util.readFileAsync(wechat_file);
        },

        saveAccessToken: function(data) {

            data = JSON.stringify(data)
            return util.writeFileAsync(wechat_file, data);
        }
    }
}

module.exports = config;