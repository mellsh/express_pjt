let password = 1234

// let encPassword = password * 12312 /10 + 7364 -123788 12732

//🔽 밑에 코드는 비밀번호 해싱(Hashing)으로 그 누구도 알기 어렵도록 하는 코드이다(중요)
let encPassword = password % 100

console.log(encPassword)