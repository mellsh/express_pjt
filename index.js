const express = require('express');
const cors = require('cors');  // CORS 패키지 추가
const { Database } = require('sqlite3');
const app = express();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');  //db 연결
// CORS 미들웨어 추가
app.use(cors());

// JSON 파싱 미들웨어
app.use(express.json());

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  });

app.post('/articles', (req, res) => {
    const { title, content } = req.body;
    //^^^  언팩킹문법으로 post보낼 값들이 많아질 걸 대비해 위와 방식으로 편하게 쓰도록 한다.

    db.run(`INSERT INTO articles (title, content) VALUES (?, ?)`,
      [title, content],
      function(err) {
        if (err) {
          return res.status(500).json({error: err.message});
        }
        res.json({id: this.lastID, title, content});
      });
  });
