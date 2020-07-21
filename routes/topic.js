var express = require('express');
var router = express.Router();
var path = require('path'); // 경로를 표시하지 않게 해준다.
var fs = require('fs');
var sanitizeHtml = require('sanitize-html'); // 결점이 있는 스크립트를 걸러준다.
var template = require('../lib/template.js'); // 모듈화한 스크립트 파일을 가져온다.

router.get('/create', function (request, response) {
    var title = 'WEB - create';
    var list = template.list(request.list);
    var html = template.html(title, list, `
            <form action="/topic/create_process" method="POST">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
                <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
                <input type="submit">
            </p>
            </form>
            `, ''
    );

    response.send(html);
});

router.post('/create_process', function (request, response) {
    var post = request.body;
    var title = post.title;
    var description = post.description;

    fs.writeFile(`data/${title}`, description, 'utf-8', function (err) {
        response.redirect(`/topic/${title}`)
    });
});




router.get('/update/:pageId', function (request, response) {
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf-8', function (err, description) {
        var title = request.params.pageId;
        var list = template.list(request.list);
        var html = template.html(title, list,
            `
                    <form action="/topic/update_process" method="POST">
                    <input type="hidden" name="id" value="${title}">
                    <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                    <p>
                        <textarea name="description" placeholder="description">${description}</textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                    </form>
                            ` ,
            `<a href="/topic/create">create</a> <a href="/topic/update/${title}">update</a>`
        );

        response.send(html);
    });
})

router.post('/update_process', function (request, response) {
    var post = request.body;
    var id = post.id;
    var title = post.title;
    var description = post.description;
    var filteredId = path.parse(id).base;
    var filteredTitle = path.parse(title).base;

    fs.rename(`data/${filteredId}`, `data/${filteredTitle}`, function (error) {
        // 에러 처리
        fs.writeFile(`data/${title}`, description, 'utf-8',
            function (err) {
                response.redirect(`/topic/${title}`);
            });
    });
})

router.post('/delete_process', function (request, response) {

    var post = request.body;
    var id = post.id;
    var filteredId = path.parse(id).base;

    fs.unlink(`data/${filteredId}`, function (error) {
        // express 에서 제공해주는 리다이렉션 기능
        response.redirect('/');
    });

})
// :pageId 를 통해 파라미터 값을 가져온다.
router.get('/:pageId', function (request, response, next) {
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf-8', function (error, description) {
        if(error) {
            // error 미들웨어가 실행되도록 한다.
            // 인자가 4개인 에러 핸들러 미들웨어가 실행된다.
            next(error);
        } else {
            var title = request.params.pageId;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description, {
                allowedTags: ['h1']
            });
            var list = template.list(request.list);
            var html = template.html(sanitizedTitle, list,
                `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
                ` <a href="/topic/create">create</a>
                      <a href="/topic/update/${sanitizedTitle}">update</a>
                      <form action="/topic/delete_process" method="post">
                      <input type="hidden" name="id" value="${sanitizedTitle}">
                      <input type="submit" value="delete">
                      </form>`
            );
    
            response.send(html);
        }
        
    })
});

module.exports = router;