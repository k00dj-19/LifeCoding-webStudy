var fs = require("fs");

/*
 //synchronous 동기식(순서대로) - A B C 출력
//readFileSync
console.log("A");
var result = fs.readFileSync("syntax/sample.txt", "utf8");
console.log(result);
console.log("C");

*/

//asynchronous 비동기식(성능이 좋음) - A C B 출력
console.log("A");
fs.readFile("syntax/sample.txt", "utf8", function (err, result) {
	console.log(result);
});
console.log("C");
