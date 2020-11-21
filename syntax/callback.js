const { compileFunction } = require("vm");

/*
function a(){
    console.log('A');
}
*/

//java에선 함수가 값이 될 수 있다.
var a = function () {
	console.log("A");
};

function slowfunc(callback) {
	callback();
}

slowfunc(a);
