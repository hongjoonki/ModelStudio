var express = require('express');
var router = express.Router();
var multer = require('multer');
let {PythonShell} = require('python-shell');

var bodyParser = require('body-parser');
var fs3 = require('fs-extra');
var formidable = require('formidable');
var fs = require('fs');


var Pool = require('../pool');
var Mydb = require('../mydb');

const DB_INFO = {
	host     : 'model-db.cvdolyhapzj7.ap-northeast-2.rds.amazonaws.com',
	user     : 'admin',
	password : '11111111',
	port     : '3306',
	database : 'modeldb'
};

const DB_INFO2 = {
	host     : 'model-db.cvdolyhapzj7.ap-northeast-2.rds.amazonaws.com',
	user     : 'admin',
	password : '11111111',
	port     : '3306',
	database : 'celebdb'
};

var pool = new Pool(DB_INFO);
var pool2 = new Pool(DB_INFO2);

//multer 의 diskStorage를 정의
var storage = multer.diskStorage({
  //경로 설정
  destination : function(req, file, cb){    

    cb(null, 'public/images/uploads/');
  },

  //실제 저장되는 파일명 설정
  filename : function(req, file, cb){
    var mimeType;

    switch (file.mimetype) {
      case "image/jpeg":
        mimeType = "jpg";
      break;
      case "image/png":
        mimeType = "png";
      break;
      case "image/gif":
        mimeType = "gif";
      break;
      case "image/bmp":
        mimeType = "bmp";
      break;
      default:
        mimeType = "jpg";
      break;
    }

    cb(null, file.originalname);
  }
});

//multer 의 diskStorage를 정의
var storage2 = multer.diskStorage({
  //경로 설정
  destination : function(req, file, cb){    

    cb(null, 'public/images/celeb_profile/');
  },

  //실제 저장되는 파일명 설정
  filename : function(req, file, cb){
    var mimeType;

    switch (file.mimetype) {
      case "image/jpeg":
        mimeType = "jpg";
      break;
      case "image/png":
        mimeType = "png";
      break;
      case "image/gif":
        mimeType = "gif";
      break;
      case "image/bmp":
        mimeType = "bmp";
      break;
      default:
        mimeType = "jpg";
      break;
    }

    cb(null, file.originalname);
  }
});


var upload = multer({storage: storage});
var upload2 = multer({storage: storage2})

router.post('/', upload.single('imgFile'), function (req, res) {
  var imgFile = req.file;
  
  let options = {
	mode: 'text',
	pythonPath: '/usr/bin/python3',
	pythonOptions: ['-u'], // get print results in real-time
	scriptPath: 'public/python/',
	args: ['uploads/'+imgFile.originalname, req.param("Sex")]
  };

  PythonShell.run('find_similar_celeb.py', options, function(err,results){
  	if(err) throw err;

  	if(results.length == 0) {
  		res.redirect('/similar_engine');
  	} else {
  		var sql = "SELECT * FROM celeb WHERE 1 ";
  		for(var i = 0; i < results.length; i++) {
  			if(i == 0) {
  				sql = sql + `and celeb_num = '${results[i]}' `;
  			} else {
  				sql = sql + `|| celeb_num = '${results[i]}' `;
  			}
  			
  		}
	  	search_celeb_db = new Mydb(pool2);

		search_celeb_db.execute( conn => {
			conn.query(sql, (err, result) => {
				res.render('search_celebs', { celeb_list: result, state: true, length_list: result.length });
			});
		});
  	}
  });
});


router.post('/profile/:model_num', function (req, res) {

  var m_name = "";
  var form = new formidable.IncomingForm();
  var temp_path = "";
  var upload_db = new Mydb(pool);
  var sql = "";
  var new_location="";
  var file_name = "";
  var introduction = "";
  var career = "";
  form.parse(req, function(err, fields, files) {
      m_name = fields.name;
      career = career + fields.Career;
      introduction = introduction + fields.Introduction;
  });


  form.on('end', function(fields, files) {

    temp_path = this.openedFiles[0].path;
    model_num = String(req.params.model_num);

    sql = "SELECT * FROM model where model_num='"+model_num+"'";
    name = "";
    upload_db.execute( conn => {
      conn.query(sql, (err, result) => {
        name = String(result[0]["name"]);
        new_location = 'public/images/models/'+model_num+"/";
        file_name = name+"_profile.jpg";

        fs3.copy(temp_path,new_location + file_name, function(err) {
          if (err) {
            console.error(err);
          }
          fs.readFile('public/json/profile_new.json', 'utf8', function readFileCallback(err, data){
            if (err){
              console.log(err);
            } else {
              obj = JSON.parse(data); //now it an object
              obj.push({"model_id": model_num, "introduction": introduction, "career": career}); //add some data
              json = JSON.stringify(obj); //convert it back to json
              fs.writeFile('public/json/profile_new.json', json, 'utf8'); // write it back
              res.redirect('/');
            }
          });
        });
      });
    });
  });
});


router.post('/models/', function (req, res) {
	
	var name=""; var age = 0; var height = 0; var weight = 0; var career = 0; var top = 0; var bottom = 0; var gender = ""; var shoe = 0; var category = "";
    var intro = ""; var location = ""; var top_size=""; var bottom_size = ""; var keyword_one = ""; var keyword_two = ""; var keyword_three = "";

	if(req.param("Name")){ name = String(req.param("Name")); } if(req.param("Age")){ age = Number(req.param("Age")); }
	if(req.param("Height")){ height = Number(req.param("Height")); } if(req.param("Weight")){ weight = Number(req.param("Weight")); }
	if(req.param("Career")){ career = Number(req.param("Career")); }
	if(req.param("Top")){
		top = Number(req.param("Top"));
		if(top == 44){
	    	top_size = "S";
	    }else if(top == 55){
	    	top_size = "M";
	    }else if(top == 66){
	    	top_size = "L";
	    }else if(top == 88){
	    	top_size = "XL";
	    }else if(top == 95){
	    	top_size = "S";
	    }else if(top == 100){
	    	top_size = "M";
	    }else if(top == 105){
	    	top_size = "L";
	    }else if(top == 110){
	    	top_size = "XL";
	    }
	}
	if(req.param("Bottom")){
		bottom = Number(req.param("Bottom"));
	    if(bottom == 23){
	    	bottom_size = "XS";
	    }else if(bottom == 24){
	    	bottom_size = "S";
	    }else if(bottom == 25){
	    	bottom_size = "M";
	    }else if(bottom == 26){
	    	bottom_size = "L";
	    }else if(bottom == 27){
	    	bottom_size = "XL";
	    }else if(bottom == 28){
	    	bottom_size = "XL";
	    }else if(bottom == 29){
	    	bottom_size = "S";
	    }else if(bottom == 30){
	    	bottom_size = "M";
	    }else if(bottom == 31){
	    	bottom_size = "L";
	    }else if(bottom == 32){
	    	bottom_size = "XL";
	    }else if(bottom == 33){
	    	bottom_size = "XL";
	    }else if(bottom == 34){
	    	bottom_size = "XL";
	    }

	}
	if(req.param("Gender")){ gender = String(req.param("Gender")); }
	if(req.param("Shoe")){ shoe = Number(req.param("Shoe")); }
	if(req.param("Intro")){ intro = String(req.param("Intro")); }
	if(req.param("Location")){ location = String(req.param("Location")); }
	if(req.param("Category")){ category = req.param("Category"); }
    upload_db = new Mydb(pool);
    upload_db2 = new Mydb(pool);
    upload_db3 = new Mydb(pool);
    var model_num = "model";
    var model_id = new Array;


    var sql1 = "SELECT model_num FROM model";
    upload_db.execute( conn => {
		conn.query(sql1, (err, result) => {
			for(var i = 0; i < result.length; i++){
				model_id.push(Number(result[i]["model_num"].split("l")[1]));
			}
			model_id.sort(function(a, b) {
			    return b - a;
			});
			model_num = model_num+String(model_id[0]+1);


			var sql2 = "Insert into model values('"+model_num+"', '"+name+"', "+String(career)+", '"+intro+"', 0, "+String(age)+", '"+gender+"', "+String(top)+", '"+top_size+"', "+String(height)+", "+String(bottom)+", '"+bottom_size+"', "+String(weight)+", "+String(shoe)+", '"+location+"', '"+String(keyword_one)+"', '"+String(keyword_two)+"', '"+String(keyword_three)+"')";
		    upload_db2.execute( conn => {
				conn.query(sql2, (err, result) => {
					var category_arr = new Array;
					if(typeof(category)=="string"){
						category_arr.push(category);
						if (category=="fitting_simple" || category=="magazine" || category=="fashion" || category=="wedding") {
							category_arr.push("fitting");
						}else if(category=="cf" || category=="beauty" || category=="homeshopping") {
							category_arr.push("media");
						}

					}else{
						category_arr = category.slice();
						if(category.includes("fitting_simple") || category.includes("magazine") || category.includes("fashion") || category.includes("wedding")) {
							category_arr.push("fitting");
						}
						if(category.includes("cf") || category.includes("beauty") || category.includes("homeshopping")) {
							category_arr.push("media");
						}
					}
					
					var idx = 0;
					var sql3 = "Insert into "+String(category_arr[idx])+" values('"+model_num+"')";
					upload_db3.execute( conn => {
						conn.query(sql3, (err, result) => {
							if(idx == category_arr.length){
								res.render("upload_profile", {model_number: model_num});
							}else{
								idx = idx+1;
								var sql4 = "Insert into "+String(category_arr[idx])+" values('"+model_num+"')";
								upload_db4 = new Mydb(pool);
								upload_db4.execute( conn => {
									conn.query(sql4, (err, result) => {
										if(idx == category_arr.length){
											res.render("upload_profile", {model_number: model_num});
										}else{
											idx = idx+1;
											var sql5 = "Insert into "+String(category_arr[idx])+" values('"+model_num+"')";
											upload_db5 = new Mydb(pool);
											upload_db5.execute( conn => {
												conn.query(sql5, (err, result) => {
													if(idx == category_arr.length){
														res.render("upload_profile", {model_number: model_num});
													}else{
														idx = idx+1;
														var sql6 = "Insert into "+String(category_arr[idx])+" values('"+model_num+"')";
														upload_db6 = new Mydb(pool);
														upload_db6.execute( conn => {
															conn.query(sql6, (err, result) => {
																if(idx == category_arr.length){
																	res.render("upload_profile", {model_number: model_num});
																}
															});
														});
													}
												});
											});
										}
									});
								});
							}
						});
					});
				});
			});
		});
	});
});


router.post('/celeb/', upload.single('imgFile'), function (req, res) {
	var imgFile = req.file.originalname;
	var name = req.param("Name");
	var sex = req.param("Sex");
	var keyword_one = req.param("keyword_one");
	var keyword_two = req.param("keyword_two");
	var keyword_three = req.param("keyword_three");
	var gender = "";
	if(sex === "celeb_male") {
		gender = "남";
	} else {
		gender = "여";
	}
	
	var upload_db = new Mydb(pool2);
	var sql1 = "SELECT celeb_num FROM celeb";
	var celeb_id = new Array;

    upload_db.execute( conn => {
		conn.query(sql1, (err, result) => {
			for(var i = 0; i < result.length; i++){
				celeb_id.push(Number(result[i]["celeb_num"].split("b")[1]));
			}
			celeb_id.sort(function(a, b) {
			    return b - a;
			});
			var celeb_num = "celeb"
			celeb_num = celeb_num+String(celeb_id[0]+1);

			var upload_db2 = new Mydb(pool2);
			var sql2 = "Insert into celeb values('"+celeb_num+"', '"+name+"', '"+gender+"', '"+keyword_one+"', '"+keyword_two+"', '"+keyword_three+"')";
			
			upload_db2.execute( conn => {
				conn.query(sql2, (err, result2) => {
					res.redirect("/");
				});
			});
		});
	});
});




module.exports = router;