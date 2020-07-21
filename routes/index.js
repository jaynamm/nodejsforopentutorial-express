var express = require('express');
var router = express.Router();
var template = require('../lib/template.js'); // 모듈화한 스크립트 파일을 가져온다.

// route 또는 routing 을 통해 원하는 경로로 이동한다.
// app.get(path, callback)
router.get('/', function (request, response) {
    var title = 'Welcome';
    var description = 'Hello, Node.js';
    var list = template.list(request.list);
    var html = template.html(title, list,
        `
        <h2>${title}</h2>${description}
        <img src="/images/splash.png" style="width=100px; display=block; margin-top=8px;">
        `,
        `<a href="/topic/create">create</a>`
    );

    response.send(html);
})

module.exports = router;