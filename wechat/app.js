'use strict';

var Koa = require('koa');
var weichat = require('./weichat/g');
var path = require('path');
var util = require('./libs/util');
var config = require('./config');
var weixin = require('./weixin');

var wechat_file = path.join(__dirname, './config/wechat.txt');


var app = new Koa();

app.use(weichat(config.wechat, weixin.reply));

app.listen(1234);

console.log('Listening: 1234');