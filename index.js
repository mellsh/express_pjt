const express = require('express');
const cors = require('cors');  // CORS 패키지 추가
const app = express();

// CORS 미들웨어 추가
app.use(cors());

// JSON 파싱 미들웨어
app.use(express.json());

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  });

app.post("/articles", (req, res)=>{

    console.log(req.body.title)
    console.log(req.body.content)

    res.send('ok')

})
