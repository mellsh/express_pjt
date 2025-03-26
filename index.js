const express = require('express');
const cors = require('cors');  // CORS 패키지 추가
const { Database } = require('sqlite3');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt'); // bcrypt 가져오기
const jwt = require('jsonwebtoken'); // jsonwebtoken 모듈 가져오기
// JWT 비밀 키 (환경 변수로 관리하는 것이 좋음)
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

const db = new sqlite3.Database('./database.db');  //db 연결
// CORS 미들웨어 추가
app.use(cors());

// JSON 파싱 미들웨어
app.use(express.json());

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  });

function authMiddleware(req, res, next){
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "토큰이 없습니다." });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
        }

        req.user = decoded; // 요청 객체에 사용자 정보 추가
        next(); // 다음 미들웨어로 이동
    });
};



  app.post('/articles', authMiddleware,(req, res) => {
    const { title, content } = req.body;
        // 토큰이 유효하면 게시글 작성
        db.run(`INSERT INTO articles (title, content, created_at) VALUES (?, ?, ?)`,
            [title, content, new Date().toISOString()],
            function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                // 게시글 작성이 성공하면 새 게시글 정보 반환
                res.json({ id: this.lastID, title, content, created_at: new Date().toISOString() });
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
            return res.status(500).json({ error: err.message });
        }

        if (!row) {
            // 해당 id의 아티클이 없을 경우
            return res.status(404).json('Article not found');
        }

        // 아티클을 찾은 경우
        res.json(row);  // 찾은 아티클 반환
    });
});




// 아티클 수정 API
app.put("/articles/:id", authMiddleware,(req, res) => {
    let articleId = req.params.id;  // URL에서 id 파라미터 추출
    let { title, content } = req.body;  // 요청 본문에서 title과 content 추출

    const sql = "UPDATE articles SET title = ?, content = ? WHERE id = ?";

    db.run(sql, [title, content, articleId], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: 'Article not found' });
        }

        return res.status(200).json({ message: 'Article updated successfully' });
    });
});


// 아티클 삭제 API
app.delete("/articles/:id", authMiddleware,(req, res) => {
    const articleId = req.params.id;

    // SQL DELETE 쿼리 실행
    db.run("DELETE FROM articles WHERE id = ?", [articleId], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: 'Article not found' });
        }

        return res.status(200).json({ message: 'Article deleted successfully' });
    });
});

// 댓글 작성 API
app.post("/articles/:id/comments", authMiddleware,(req, res) => {
    const articleId = req.params.id;  // URL에서 article_id 추출
    const { content } = req.body;  // 요청 본문에서 댓글 내용 추출

    // 댓글이 빈 내용일 경우 처리
    if (!content || content.trim() === "") {
        return res.status(400).json({ message: "Content is required." });
    }

    // SQL INSERT 쿼리 실행
    const sql = "INSERT INTO comments (content, article_id) VALUES (?, ?)";

    db.run(sql, [content, articleId], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // 성공적으로 댓글이 추가된 경우
        res.status(201).json({
            id: this.lastID,  // 방금 삽입된 댓글의 ID
            content,
            article_id: articleId,
            created_at: new Date().toISOString()  // 현재 시간
        });
    });
});

app.get("/articles/:id/comments", (req,res)=>{
    const sql = "SELECT * FROM comments WHERE article_id = ?"; // 최신 글이 위에 오도록 정렬
    const articleId = req.params.id

    // db.all을 사용하여 여러 행을 가져오기
    db.all(sql, [articleId], (err, rows) => {
        if (err) {
            // 오류 발생 시
            return res.status(500).json({ error : err.message});
        }

        // 아티클 리스트를 성공적으로 가져왔을 경우 응답
        res.json(rows);
    })
})

app.post('/users', async (req, res) => {
    let { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    // 이메일 중복 확인
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (row) {
            return res.status(409).json({ message: "Email already exists." }); // 409 Conflict
        }

        try {
            // 비밀번호 해싱 (10번 솔트)
            const hashedPassword = await bcrypt.hash(password, 10);

            // 해싱된 비밀번호를 DB에 저장
            db.run("INSERT INTO users (email, password) VALUES (?, ?)", [email, hashedPassword], function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                res.status(200).json({
                    message: "회원가입 완료"
                });
            });

        } catch (hashError) {
            return res.status(500).json({ error: "Password hashing failed." });
        }
    });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    // 이메일로 사용자 조회
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // 이메일이 존재하지 않으면 로그인 실패
        if (!user) {
            return res.status(401).json({ message: "이메일 없음!" });
        }

        // 비밀번호 비교 (입력된 비밀번호 vs 해싱된 비밀번호)
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // 비밀번호가 일치하지 않으면 로그인 실패
            if (!isMatch) {
                return res.status(401).json({ message: "비밀번호 틀림" });
            }

            // JWT 토큰 생성
            const token = jwt.sign(
                { id: user.id, email: user.email }, // 토큰에 포함될 데이터 (payload)
                SECRET_KEY,                    // 비밀 키
                { expiresIn: '1h' }                // 토큰 만료 시간 설정 (1시간)
            );

            // 로그인 성공, 토큰과 사용자 정보 반환
            res.status(200).json({
                message: "로그인 성공",
                token, // 발급된 JWT 토큰 반환
                user: {
                    id: user.id,
                    email: user.email
                }
            });
        });
    });
});

app.get('/logintest', (req, res)=>{
    console.log(req.headers.authorization.split(' ')[1])
    let token = req.headers.authorization.split(' ')[1]

    jwt.verify(token, SECRET_KEY, (err, decoded)=>{
        if(err){
            return res.send("에러")
        }

        return res.send("로그인 성공")
    })
})
