'use strict';

var sha1 = require('sha1');
var getRawBody = require('raw-body');
var Wechat = require('./wechat');
var util = require('./util');


module.exports = function(opts, handler) {
    
    var wechat = new Wechat(opts);
    
    return function *(next) {

        // console.log(this.query);

        var token = opts.token;
        var signature = this.query.signature;
        var nonce = this.query.nonce;
        var timestamp = this.query.timestamp;
        var echostr = this.query.echostr;


        //字典排序
        var str = [token, timestamp, nonce].sort().join('');

        //加密
        var sha = sha1(str);

        if(this.method === 'GET'){//验证是否是微信过来的

            if(sha == signature) {

                this.body = echostr + '';

            } else {

                this.body = 'wrong'
            }

        } else if(this.method === 'POST'){//处理用户事件,数据

            if(sha !== signature) {

                this.body = 'wrong';

                return false;

            }

            var data = yield getRawBody(this.req, {

                length: this.length,
                limit: '1mb',
                encoding: this.charset
            })

            // console.log(data.toString());

            var content = yield util.parseXMLAsync(data);
            
            // console.log(content);
            
            var message = util.formatMessage(content.xml);
            
            console.log(message);

            this.weixin = message;

            yield handler.call(this, next);
            
            wechat.reply.call(this);
        }

    }
}

