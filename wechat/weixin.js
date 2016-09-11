'use strict';

var config = require('./config');
var Wechat = require('./weichat/wechat');

var wechatApi = new Wechat(config.wechat);

exports.reply = function* (next) {

    var message = this.weixin;

    if(message.MsgType === 'event') {

        if(message.Event === 'subscribe') {

            if(message.EventKey) {
                console.log('扫描二维码进来:' + message.EventKey + '' +message.ticket);
            }

            this.body = '哈哈,你订阅了找个号\r\n';

        } else if(message.Event === 'unsubscribe'){

            console.log('无情取关');
            this.body = '';

        } else if(message.Event === 'LOCATION') {

            this.body = '您上报的位置是: ' + message.Latitude + '/' + message.Longitude + '-' + message.Precision;

        } else if(message.Event === 'CLICK') {

            this.body = '您点击了菜单:' + message.EventKey;

        } else if(message.Event === 'SCAN') {

            console.log('关注后扫二维码' + message.EventKey + ' ' +message.Ticket);

            this.body = '看到你扫了一下哦';

        } else if(message.Event === 'VIEW') {

            this.body = '您点击了菜单中的链接: ' + message.EventKey;

        }


    } else if(message.MsgType === 'text'){

        var content = message.Content;
        var reply = '额, 你说的 '+ content + '太复杂了';

        if(content === '1') {

            reply = '天下第一吃大米';
        } else if(content === '2') {

            reply = '天下第二吃豆腐'
        } else if(content === '3') {

            reply = '天下第二吃仙丹'
        } else if(content === '4') {

            reply = [
                {
                    title: '技术改变世界',
                    description: '只是个描述而已',
                    picUrl :"http://ziseyiliao.com/images/ba2.jpg",
                    url: 'https://github.com'
                }
            ]
        } else if(content == '5') {

            var data = yield wechatApi.uploadMaterial('image', __dirname + '/2.jpg' );

            reply = {
                type: 'image',
                mediaId: data.media_id
            }
        } else if(content == '6') {

            var data = yield wechatApi.uploadMaterial('video', __dirname + '/6.mp4' );
            console.log(data)
            reply = {
                type: 'video',
                title: '回复视屏内容',
                description: '打个🏀玩玩',
                mediaId: data.media_id
            }
        } else if(content == '7') {

            var data = yield wechatApi.uploadMaterial('image', __dirname + '/2.jpg' );
            console.log(data)
            reply = {
                type: 'music',
                title: '回复音乐内容',
                description: '放松一下',
                musicUrl: 'http://mpge.5nd.com/2015/2015-9-12/66325/1.mp3',
                mediaId: data.media_id
            }
        }


        this.body = reply;
    }




    yield next;
}