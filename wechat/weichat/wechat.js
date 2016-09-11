'use strict';

var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var util = require('./util');
var fs = require('fs');

var prefix = 'https://api.weixin.qq.com/cgi-bin/';
var api = {

    accessToken: prefix + 'token?grant_type=client_credential',
    upload: prefix + 'media/upload?'
}

function Wechat(opts) {

    var self = this;
    this.appID = opts.appID;
    this.appSecret = opts.appSecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;

    this.fetchAccessToken();


}

Wechat.prototype.isValidAccessToken = function(data) {

    //如果数据有一个没有就false
    if(!data || !data.access_token || !data.expires_in) {

        return false;
    }

    //判断票据有没有过期
    var access_token = data.access_token;
    var expires_in = data.expires_in;
    var now = (new Date().getTime());


    if(now < expires_in) {

        return true;
    } else {

        return false;
    }
}


Wechat.prototype.updateAccessToken = function() {

    var appID = this.appID;
    var appSecret = this.appSecret;
    var url = api.accessToken + '&appid=' +appID + '&secret=' +appSecret;

    return new Promise(function(resolve, reject) {

        //向某一个服务器发送一个请求
        request({url: url, json: true}).then(function(data) {

            var data = data.body;

            var now =  (new Date().getTime());

            var expires_in = now + (data.expires_in - 20) *1000;

            data.expires_in = expires_in;

            resolve(data);
        })
    })

}

Wechat.prototype.uploadMaterial = function(type, filePath) {
    var self = this;

    var form = {
        media: fs.createReadStream(filePath)
    }


    var appID = this.appID;
    var appSecret = this.appSecret;
    var url = api.accessToken + '&appid=' +appID + '&secret=' +appSecret;

    return new Promise(function(resolve, reject) {

        self
            .fetchAccessToken()
            .then(function(data) {

                var url = api.upload + 'access_token=' + data.access_token + '&type=' + type;
                console.log(url)
                //向某一个服务器发送一个请求
                request({method: 'POST', url: url, formData: form, json: true}).then(function(data) {

                    var data = data.body;

                    if(data) {

                        resolve(data);
                    } else {

                        throw new Error('Upload material fails');
                    }

                })
            })
            .catch(function(err) {

                reject(err);
            })

    })

}

Wechat.prototype.fetchAccessToken = function(data) {

    var self = this;

    if(this.access_token && this.expires_in) {

        if(this.isValidAccessToken(this)) {

            return Promise.resolve(this);
        }
    }

    this.getAccessToken()
        .then(function(data) {

            try{

                data = JSON.parse(data);
            } catch(e) {
                //读取的票据不存在,或者格式错误
                return self.updateAccessToken(data);
            }

            //判断票据是否在有效期内的
            if(self.isValidAccessToken(data)) {

                return data;
            } else {

                return self.updateAccessToken();
            }
        })
        .then(function(data) {

            self.access_token = data.access_token;
            self.expires_in = data.expires_in

            self.saveAccessToken(data);

            return Promise.resolve(data);
        })
}

Wechat.prototype.reply = function() {

    var content = this.body;
   
    var message = this.weixin;

    var xml = util.tpl(content, message);
    console.log(message)
    console.log(xml)
    this.status = 200;
    this.type = 'application/xml';
    this.body = xml;
}

module.exports = Wechat;