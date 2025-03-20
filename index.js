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

app.get('/articles', (req, res) => {
    // SQL 쿼리: articles 테이블에서 모든 데이터를 조회
    const sql = "SELECT * FROM articles"; // 최신 글이 위에 오도록 정렬

    // db.all을 사용하여 여러 행을 가져오기
    db.all(sql, [], (err, rows) => {
        if (err) {
            // 오류 발생 시
            return res.status(500).json({ error : err.message});
        }

        // 아티클 리스트를 성공적으로 가져왔을 경우 응답
        res.json(rows);
    })
})

// 개별 아티클을 조회하는 API
app.get("/articles/:id", (req, res) => {
    const articleId = req.params.id;  // URL에서 id 파라미터 추출

    const sql = "SELECT * FROM articles WHERE id = ?";

    db.get(sql, [articleId], (err, row) => {
        if (err) {
            // 오류 발생 시 로그에 출력하고 500 상태 코드로 반환
            console.error("Database error: ", err.message);
            return res.status(500).send('Database error');
        }

        if (!row) {
            // 해당 id의 아티클이 없을 경우
            console.log("No article found for ID:", articleId);  // 해당 ID의 아티클을 찾지 못했을 때 로그
            return res.status(404).send('Article not found');
        }

        // 아티클을 찾은 경우
        res.status(200).json(row);  // 찾은 아티클 반환
    });
});
