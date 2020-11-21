var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require("querystring");
var template = require("./library/template.js");
var path = require("path");
var sanitizeHtml = require("sanitize-html"); //<tag> 가 들어있으면 사용하지 않게 함.
var mysql = require("mysql");
var db = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "kdj0630",
	database: "opentutorials",
});
db.connect();

var app = http.createServer(function (request, response) {
	var _url = request.url;
	var queryData = url.parse(_url, true).query;
	var pathname = url.parse(_url, true).pathname;
	if (pathname === "/") {
		//home으로 간 경우
		if (queryData.id === undefined) {
			// fs.readdir("./data", function (error, filelist) {
			// 	var title = "Welcome";
			// 	var description = "Hello Node.js";
			// 	var list = template.list(filelist);
			// 	var html = template.html(title, list, `<h2>${title}</h2>${description}`, `<a href="/create">create</a>`);
			// 	response.writeHead(200);
			// 	response.end(html);
			// });
			db.query(`SELECT * FROM topic`, function (error, topics) {
				var title = "Welcome";
				var description = "Hello Node.js";
				var list = template.list(topics);
				var html = template.html(title, list, `<h2>${title}</h2>${description}`, `<a href="/create">create</a>`);
				response.writeHead(200);
				response.end(html);
			});
		} else {
			//home이 아닌 다른 주소인경우
			/*
			fs.readdir("./data", function (error, filelist) {
				var filteredId = path.parse(queryData.id).base;
				fs.readFile(`data/${filteredId}`, "utf8", function (err, description) {
					var title = queryData.id;
					var sanitizedTitle = sanitizeHtml(title);
					var sanitizedDescription = sanitizeHtml(description, {
						allowedTags: ["h1"],
					});
					var list = template.list(filelist);
					var html = template.html(
						sanitizedTitle,
						list,
						`<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,

						`<a href="/create">create</a>
                     <a href="/update?id=${sanitizedTitle}">update</a>
                     <form action="delete_process" method="post">
                        <input type="hidden" name="id" value="${sanitizedTitle}">
                        <input type="submit" value="delete">
                     </form>`,
					);
					response.writeHead(200);
					response.end(html);
				});
			});
			*/
			db.query(`SELECT * FROM topic`, function (error, topics) {
				if (error) {
					throw error; //에러가 나면 밑의 코드를 실행하지 않고 즉시 중지시킴.
				}
				db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`, [queryData.id], function (error2, topic) {
					//?`, [queryData.id] : id=${queryData.id} 를 사용했을 때 공격 위험이 있으므로 저것을 사용하여 세탁해준다.
					if (error2) {
						throw error2;
					}
					var title = topic[0].title;
					var description = topic[0].description;
					var list = template.list(topics);
					var html = template.html(
						title,
						list,
						`<h2>${title}</h2>
						${description}
						<p>by ${topic[0].name}</p>
						`,
						`<a href="/create">create</a>
						<a href="/update?id=${queryData.id}">update</a>
						<form action="delete_process" method="post">
						   <input type="hidden" name="id" value="${queryData.id}">
						   <input type="submit" value="delete">
						</form>`,
					);
					response.writeHead(200);
					response.end(html);
				});
			});
		}
	} else if (pathname === "/create") {
		db.query(`SELECT * FROM topic`, function (error, topics) {
			db.query(`SELECT * FROM author`, function(error2, authors){

				var tag = "";
				for(var i = 0; i < authors.length; i++){
					tag += `<option value="${authors[i].id}">${authors[i].name}</option>`
				}
				var title = "Create";
				var list = template.list(topics);
				var html = template.html(
					title,
					list,
					`<form action="/create_process" method="post">
							<p><input type="text" name="title" placeholder="title" /></p>
							<p>
								<textarea name="description" placeholder="description"  cols="30" rows="10"></textarea>
							</p>
							<p>
								${template.authorSelect(authors)}	
							</p>
							<p>
								<input type="submit" />
							</p>
						</form>				 
						 `,
					`<a href="/create">create</a>`
				);
				response.writeHead(200);
				response.end(html);
			});
		});
	} else if (pathname === "/create_process") {
		var body = "";
		//request.on - post 형식으로 데이터를 받을때 그 양이 너무 많을 때 사용
		request.on("data", function (data) {
			body = body + data;
		});
		request.on("end", function () {
			var post = qs.parse(body);
			db.query(
				`
				INSERT INTO topic (title, description, created, author_id)
				 VALUES(?, ?,NOW(), ?)`,
				[post.title, post.description, post.author],
			
				function (error, result) {
					if (error) {
						throw error;
					}
					response.writeHead(302, { Location: `/?id=${result.insertId}` }); //302:Location으로 이동
					response.end();
				},
			);
		});
	} else if (pathname === "/update") {
		/*
		fs.readdir("./data", function (error, filelist) {
			var filteredId = path.parse(queryData.id).base;
			fs.readFile(`data/${filteredId}`, "utf8", function (err, description) {
				var title = queryData.id;
				var list = template.list(filelist);
				var html = template.html(
					title,
					list,
					`
                    
                    <form action="/update_process" method="post">
                        <input type="hidden" name="id" value="${title}">
                        <p><input type="text" name="title" placeholder="title" value="${title}" /></p>
                        <p>
                            <textarea name="description" placeholder="description" cols="30" rows="10">${description}</textarea>
                        </p>
                        <p>
                            <input type="submit" />
                        </p>
                    </form>

                    
                    `,
					`<a href="/create">create</a> <a href="/update?id=${title}">update</a>`,
				);
				response.writeHead(200);
				response.end(html);
			});
		});
		*/
		db.query(`SELECT * FROM topic`, function (error, topics) {
			if (error) {
				throw error; //에러가 나면 밑의 코드를 실행하지 않고 즉시 중지시킴.
			}
			db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], function (error2, topic) {
				//?`, [queryData.id] : id=${queryData.id} 를 사용했을 때 공격 위험이 있으므로 저것을 사용하여 세탁해준다.
				if (error2) {
					throw error2;
				}
				db.query(`SELECT * FROM author`, function(error3, authors){
					var list = template.list(topics);
					var html = template.html(
						topic[0].title,
						list,
						`
						
						<form action="/update_process" method="post">
							<input type="hidden" name="id" value="${topic[0].id}">
							<p><input type="text" name="title" placeholder="title" value="${topic[0].title}" /></p>
							<p>
								<textarea name="description" placeholder="description" cols="30" rows="10">${topic[0].description}</textarea>
							</p>
							<p>
								${template.authorSelect(authors, topic[0].author_id)}
							</p>
							<p>
								<input type="submit" />
							</p>
						</form>
	
						
						`,
						`<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`,
					);
					response.writeHead(200);
					response.end(html);
				});
				
			});
		});
	} else if (pathname === "/update_process") {
		var body = "";
		//request.on - post 형식으로 데이터를 받을때 그 양이 너무 많을 때 사용
		request.on("data", function (data) {
			body = body + data;
		});
		request.on("end", function () {
			var post = qs.parse(body);
			db.query(
				`UPDATE topic SET title = ?, description = ?, author_id = ? WHERE id=?` ,
				[post.title, post.description, post.author,post.id],
				function (error, result) {
					if (error) {
						throw error;
					}
					response.writeHead(302, { Location: `/?id=${post.id}` }); //302:Location으로 이동
					response.end();
				},
			);
			// var id = post.id;
			// var title = post.title;
			// var description = post.description;
			// fs.rename(`data/${id}`, `data/${title}`, function (error) {
			// 	fs.writeFile(`data/${title}`, description, 'utf8', function(error){
			// 		response.writeHead(302, { Location: `/?id=${title}` }); //302:Location으로 이동
			// 		response.end();
			// 	})
			// });
		});
	} else if (pathname === "/delete_process") {
		var body = "";
		//request.on - post 형식으로 데이터를 받을때 그 양이 너무 많을 때 사용
		request.on("data", function (data) {
			body = body + data;
		});
		request.on("end", function () {
			var post = qs.parse(body);
			db.query(`DELETE FROM topic WHERE id=?`, [post.id], function(error, result){
				if(error){
					throw error;
				}

				response.writeHead(302, { Location: `/` }); //302:Location으로 이동
				response.end();
			})
			//var filteredId = path.parse(id).base;
			//fs.unlink(`data/${filteredId}`, function (error) {
				//unlink - 파일삭제
				
			});
		
	} else {
		response.writeHead(404);
		response.end("Not Found");
	}
});

app.listen(3000);
