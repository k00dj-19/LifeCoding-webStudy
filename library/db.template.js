// db.js가 외부에 노출될 수 있으므로 따로 템플릿을 만들어 버전관리 시스템에는 이 파일을 올린다.
var mysql = require('mysql');
var db = mysql.createConnection({
	host: "",
	user: "",
	password: "",
	database: "",
});
db.connect();
module.exports = db;