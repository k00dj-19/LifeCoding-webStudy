var M = {
	v: "v",
	f: function () {
		console.log(this.v);
	},
};

module.exports = M; //M을 바깥에서 사용할 수 있도록 exports한다.
