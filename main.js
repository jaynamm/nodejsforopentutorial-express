var express = require('express'); // express module load
var app = express();
var fs = require('fs');
var path = require('path'); // 경로를 표시하지 않게 해준다.
var template = require('./lib/template.js'); // 모듈화한 스크립트 파일을 가져온다.
var bodyParser = require('body-parser'); // html body
var compression = require('compression');
var helmet = require('helmet'); // 보안 관련 미들웨어
app.use(helmet()); // 기본적으로 helmet 을 사용해야 한다.

var indexRouter = require('./routes/index');
var topicRouter = require('./routes/topic');

// 정적인 파일을 public 에서 찾는다.
app.use(express.static('public'))

// 사용자가 요청할 때npm마다 미들웨어 실행
// 사용자가 전송한 post 데이터를 내부적으로 분석 후 callback 호출
// 미들웨어는 순차적으로 실행된다.

// body parser 미들웨어 실행
app.use(bodyParser.urlencoded({ extended: false }))
// compression 미들웨어 실행
app.use(compression());

// 미들웨어 생성 후 실행
// get 방식에 대해서만 파일 목록을 가져온다. post 방식을 처리되지 않는다.
// * : 모든 경로
app.get('*', function (request, response, next) {
    fs.readdir('./data', function (error, filelist) {
        request.list = filelist;
        next();

        // next : 다음에 호출되어야 할 미들웨어가 담겨있다.
        // next() : 바로 다음 미들웨어 실행
    });
})

// index router 가져온다.
app.use('/', indexRouter);
// topic router 를 가져온다.
app.use('/topic', topicRouter);



// 404 에러 처리 , 가장 끝에서 처리 해준다.
app.use(function(request, response) {
    response.status(404).send("Sorry can't find that !");
})

// Error handler
// 에러 핸들러의 경우 4개의 인자를 받도록 되어있다.
// next(error) 를 실행할 경우 다음 미들웨어가 실행된다.
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
})

// listen 메소드가 실행되면서 웹페이지가 실행된다.
// port 3000 로 접속 가능하다.
app.listen(3000, () => console.log(`Example app listening at http://localhost:3000`))


/*
이후 공부해야 할 것들

template engine - pug
database - express 는 자체적으로 제공하지는 않는다.
mysql 사용하기

express 는 미들웨어라고도 불릴만큼 미들웨어의 사용법이 중요하다.
어떤 미들웨어가 있는지 많이 알수록 유용하다.
express - using middleware
미들웨어 사용법 익히기

*/