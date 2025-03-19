const express = require('express');
const cors = require('cors');  // CORS 패키지 추가
const app = express();

// CORS 미들웨어 추가
app.use(cors());

// JSON 파싱 미들웨어
app.use(express.json());

const PORT = 3000;

// 기존 코드...

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
//json으로 된 post의 바디를 읽기 위해 필요
app.use(express.json())

const users =  [
    {
      "id": 1,
      "name": "홍길동",
      "email": "hong@example.com",
      "signup_date": "2023-03-18T12:00:00Z"
    },
    {
      "id": 2,
      "name": "김철수",
      "email": "kim@example.com",
      "signup_date": "2023-02-17T09:30:00Z"
    },
    {
      "id": 3,
      "name": "이영희",
      "email": "lee@example.com",
      "signup_date": "2022-11-16T15:20:00Z"
    },
    {
      "id": 4,
      "name": "박준호",
      "email": "park@example.com",
      "signup_date": "2022-10-15T10:10:00Z"
    },
    {
      "id": 5,
      "name": "최민수",
      "email": "choi@example.com",
      "signup_date": "2022-09-14T18:45:00Z"
    },
    {
      "id": 6,
      "name": "정다은",
      "email": "jung@example.com",
      "signup_date": "2022-08-13T14:00:00Z"
    },
    {
      "id": 7,
      "name": "김지수",
      "email": "kim2@example.com",
      "signup_date": "2022-07-12T11:30:00Z"
    },
    {
      "id": 8,
      "name": "이수민",
      "email": "lee2@example.com",
      "signup_date": "2022-06-11T17:15:00Z"
    },
    {
      "id": 9,
      "name": "박지현",
      "email": "park2@example.com",
      "signup_date": "2022-05-10T08:40:00Z"
    },
    {
      "id": 10,
      "name": "최지우",
      "email": "choi2@example.com",
      "signup_date": "2022-04-09T20:00:00Z"
    }] 
const articles = [
    {
      "id": 1,
      "title": "첫 번째 게시글 제목",
      "content": "첫 번째 게시글 내용입니다.",
      "author_id": 1,
      "date": "2025-03-18T12:00:00Z"
    },
    {
      "id": 2,
      "title": "두 번째 게시글 제목",
      "content": "두 번째 게시글 내용입니다.",
      "author_id": 2,
      "date": "2025-03-17T09:30:00Z"
    },
    {
      "id": 3,
      "title": "세 번째 게시글 제목",
      "content": "세 번째 게시글 내용입니다.",
      "author_id": 3,
      "date": "2025-03-16T15:20:00Z"
    },
    {
      "id": 4,
      "title": "네 번째 게시글 제목",
      "content": "네 번째 게시글 내용입니다.",
      "author_id": 4,
      "date": "2025-03-15T10:10:00Z"
    },
    {
      "id": 5,
      "title": "다섯 번째 게시글 제목",
      "content": "다섯 번째 게시글 내용입니다.",
      "author_id": 5,
      "date": "2025-03-14T18:45:00Z"
    },
    {
      "id": 6,
      "title": "여섯 번째 게시글 제목",
      "content": "여섯 번째 게시글 내용입니다.",
      "author_id": 6,
      "date": "2025-03-13T14:00:00Z"
    },
    {
      "id": 7,
      "title": "일곱 번째 게시글 제목",
      "content": "일곱 번째 게시글 내용입니다.",
      "author_id": 7,
      "date": "2025-03-12T11:30:00Z"
    },
    {
      "id": 8,
      "title": "여덟 번째 게시글 제목",
      "content": "여덟 번째 게시글 내용입니다.",
      "author_id": 8,
      "date": "2025-03-11T17:15:00Z"
    },
    {
      "id": 9,
      "title": "아홉 번째 게시글 제목",
      "content": "아홉 번째 게시글 내용입니다.",
      "author_id": 9,
      "date": "2025-03-10T08:40:00Z"
    },
    {
      "id": 10,
      "title": "열 번째 게시글 제목",
      "content": "열 번째 게시글 내용입니다.",
      "author_id": 10,
      "date": "2025-03-09T20:00:00Z"
    }]

app.get('/ping', (req, res)=>{
    res.send('pong');
});

app.get('/tic', (req, res) =>{
    res.send('qwerty');
});

app.get('/abc', (req, res) =>{
    res.send('가나다');
});

app.get('/users', (req, res) =>{
    res.json(users);
});

app.get('/test', (req,res)=>{
    
    console.log(req.query);
    console.log(req.query.id)
    res.send("ok")

});

app.get('/articles', (req,res)=>{
  console.log(req);
  res.send(articles)
});

app.post('/articles',(req,res)=>{
  let data = req.body
  let lastId = articles[articles.length - 1].id
  data["id"] = lastId + 1

  const now = new Date().toISOString().slice(0, 19) + 'Z';
  data.date = now;

  articles.push(data)
  return res.json("ok")
})

app.delete('/articles/:id', (req, res) => {
  let id = req.params.id

  console.log(id);

  articles.splice(id-1, 1)

  res.send("ok")


  //const id = parseInt(req.params.id);
  //// articles 배열에서 해당 id의 게시글을 찾고 삭제
  //const index = articles.findIndex(article => article.id === id);
  //if (index !== -1) {
  //  articles.splice(index, 1);  // 해당 id의 게시글을 삭제
  //  res.json("ok");  // 삭제 성공
  //} else {
  //  res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });  // 게시글을 못 찾으면 에러 처리
  //}
});

app.get('/articles/:id', (req, res)=>{

  let id = req.params.id

  for(let i = 0; i < articles.length ; i++){
    if (articles[i].id == id){
      return res.json(articles[i])
    }
  }

  return res.send("Nien!") 

});