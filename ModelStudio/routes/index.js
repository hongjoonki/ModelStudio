var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var fs = require('fs');
var fs3 = require('fs-extra');
var formidable = require('formidable');
var multer = require('multer');

var Pool = require('../pool');
var Mydb = require('../mydb');


const DB_INFO = {
	host     : 'model-db.cvdolyhapzj7.ap-northeast-2.rds.amazonaws.com',
	user     : 'admin',
	password : '11111111',
	port     : '3306',
	database : 'modeldb'
}

const DB_INFO2 = {
	host     : 'model-db.cvdolyhapzj7.ap-northeast-2.rds.amazonaws.com',
	user     : 'admin',
	password : '11111111',
	port     : '3306',
	database : 'celebdb'
}


var pool = new Pool(DB_INFO);
var pool2 = new Pool(DB_INFO2);

router.use(bodyParser.urlencoded());
router.use(bodyParser.json());

router.use(express.json());
router.use(express.urlencoded({ extended: false }));



/* GET home page. */
router.get('/', function(req, res, next) {
  var index_db = new Mydb(pool);
  var model1 = "model1"
  var model102 = "model102"
  var model122 = "model122"
  var model230 = "model230"
  var model37 = "model37"
  var model103 = "model103"
  var sql = `select * from model where model_num = '${model1}' || 
  model_num ='${model102}' || 
  model_num = '${model122}' || 
  model_num = '${model230}' || 
  model_num = '${model37}' ||
  model_num = '${model103}'`

  index_db.execute( conn => {
		conn.query(sql, (err, result) => {
			res.render('index', { model_list: result, state: true, length_list: result.length });
			//res.send(result);
		});
	});
  // res.render('index');
});


/* GET search_models page. */
router.get('/search_models', function(req, res, next) {
  if (req.query.exampleRadios || req.query.MinimumAge || req.query.MaxAge || req.query.Gender || req.query.MinimumHeight || req.query.MaxHeight || req.query.MinimumWeight || req.query.MaxWeight || req.query.SidoId || req.query.Career) {
  		
  		var radios = String(req.query.exampleRadios);
		search_db = new Mydb(pool);

		var MinimumAge = Number(req.query.MinimumAge);
	    var MaxAge = Number(req.query.MaxAge);
	    
	    var Gender = Number(req.query.Gender);
	    
	    var MinimumHeight = Number(req.query.MinimumHeight);
	    var MaxHeight = Number(req.query.MaxHeight);

	    var MinimumWeight = Number(req.query.MinimumWeight);
	    var MaxWeight = Number(req.query.MaxWeight);

	    var SidoId = Number(req.query.SidoId);

	    var Career = Number(req.query.Career);

	    var sql = "SELECT * FROM model WHERE like_num != -1 ";

	    if(Gender == 0){

	    }else if(Gender == 1){
	        sql = sql+"and sex ='여' ";
	    }else if(Gender == 2){
	        sql = sql+"and sex ='남' ";
	    }

	    if(SidoId == 0){

	    }else if(SidoId == 1){
	        sql = sql+"and location like('서%') ";
	    }else if(SidoId == 2){
	        sql = sql+"and location like('경%') ";
	    }

	    if(Career == 0){

	    }else if(Career == 1){
	        sql = sql+"and career <= 1 ";
	    }else if(Career == 2){
	        sql = sql+"and career >= 1 and career <= 15 ";
	    }else if(Career == 3){
	        sql = sql+"and career >= 3 and career <= 15 ";
	    }else if(Career == 4){
	        sql = sql+"and career >= 5 and career <= 15 ";
	    }else if(Career == 5){
	        sql = sql+"and career >= 10 and career <= 15 ";
	    }

	    if(MinimumAge == 0 && MaxAge == 0){

	    }else if(MinimumAge != 0 && MaxAge == 0){
	        sql = sql+"and age >= "+String(MinimumAge)+" ";
	    }else if(MinimumAge == 0 && MaxAge != 0){
	        sql = sql+"and age <= "+String(MinimumAge)+" ";
	    }else if(MinimumAge != 0 && MaxAge != 0){
	        sql = sql+"and age <= "+String(MaxAge)+" and age >= "+String(MinimumAge)+" ";
	    }

	    if(MinimumHeight == 0 && MaxHeight == 0){

	    }else if(MinimumHeight != 0 && MaxHeight == 0){
	        $sql = sql+"and height >= "+String(MinimumHeight)+" ";
	    }else if(MinimumHeight == 0 && MaxHeight != 0){
	        sql = sql+"and height <= "+String(MaxHeight)+" ";
	    }else if(MinimumHeight != 0 && MaxHeight != 0){
	        sql = sql+"and height <= "+String(MaxHeight)+" and height >= "+String(MinimumHeight)+" ";
	    }

	    if(MinimumWeight == 0 && MaxWeight == 0){

	    }else if(MinimumWeight != 0 && MaxWeight == 0){
	        sql = sql+"and weight >= "+String(MinimumWeight)+" ";
	    }else if(MinimumWeight == 0 && MaxWeight != 0){
	        sql = sql+"and weight <= "+String(MaxWeight)+" ";
	    }else if(MinimumWeight != 0 && MaxWeight != 0){
	        sql = sql+"and weight <= "+String(MaxWeight)+" and weight >= "+String(MinimumWeight)+" ";
	    }

	    if(!req.query.exampleRadios){
	    	
	    }else{
	    	sql = sql+"and model_num in(select * from "+radios+")";
	    }

		search_db.execute( conn => {
			conn.query(sql, (err, result) => {
				res.render('search_models', { model_list: result, state: true, length_list: result.length });
				//res.send(result);
			});
		});
	}
	else {
		res.render('search_models', { state: false });
	}
});


/* GET search_models page. */
router.get('/search_celebs', function(req, res, next) {
	if (req.query.Sex) {
		var gender = Number(req.query.Sex);
		var name = "";
		name = name + String(req.query.Name);

		var sql = "SELECT * FROM celeb WHERE 1 ";

		// 성별 처리
		if(gender == 2) {
			sql = sql+"AND sex = '여' ";
		} else if(gender == 3) {
			sql = sql+"AND sex = '남' ";
		}

		// 이름 처리
		if(name === "") {

		}else {
			sql = sql+`AND celeb_name like "%${name}%"` 
		}

		search_celeb_db = new Mydb(pool2);

		search_celeb_db.execute( conn => {
			conn.query(sql, (err, result) => {
				res.render('search_celebs', { celeb_list: result, state: true, length_list: result.length });
			});
		});
	}else {
		res.render('search_celebs', { state: false });
	}
});


/* GET model's detail profile page. */
router.get('/model_detail/:model_number', function(req, res, next) {
	var pool = new Pool(DB_INFO);
	
	var model_number = req.params.model_number;

	var imgFolder = 'public/images/models/'+model_number;
	var jsonFile = 'public/json/profile_new.json';
	var sql = "SELECT * FROM model WHERE model_num = '"+model_number+"'";
	
	var model_id = Number(model_number.split("l")[1]);

	var data = fs.readFileSync('public/json/profile_new.json', 'utf-8');
	var json_data = JSON.parse(data);
	var index = 0;
	for(var i = 0; i < json_data.length; i++){
		if(json_data[i]["model_num"]== model_number){
			index = index+i;
		}
	};

	search_db = new Mydb(pool);

	search_db.execute( conn => {
		conn.query(sql, (err, result) => {

			fs.readdir(imgFolder, function(err, filelist) {
				res.render('model_profile', {model_num: result[0]["model_num"], name: result[0]["name"], career: result[0]["career"],
					introduction: result[0]["introduction"], like_num: result[0]["like_num"], age: result[0]["age"], sex: result[0]["sex"],
					top: result[0]["top"], top_size: result[0]["top_size"], height: result[0]["height"], bottom: result[0]["bottom"],
					bottom_size: result[0]["bottom_size"], weight: result[0]["weight"], shoe: result[0]["shoe"], location: result[0]["location"],
					imgArr: filelist, profile_career: json_data[index]["career"], profile_introduction: json_data[index]["introduction"] });
			});
		});
	});
});


/* GET upload page. */
router.get('/upload', function(req, res, next) {
  res.render('upload');
});


/* GET upload_celeb page. */
router.get('/upload_celeb', function(req, res, next) {
  res.render('upload_celeb');
});



/* GET update page. */
router.get('/update', function(req, res, next) {
	var pool = new Pool(DB_INFO);
	update_db = new Mydb(pool);
	var sql = "SELECT * FROM model";
	
	update_db.execute( conn => {
		conn.query(sql, (err, result) => {
			res.render('update', { model_list: result, state: true, length_list: result.length });
			//res.send(result);
		});
	});
});


/* GET delete page. */
router.get('/delete', function(req, res, next) {
	var pool = new Pool(DB_INFO);
	var delete_db = new Mydb(pool);
	var sql = "SELECT * FROM model";
	
	delete_db.execute( conn => {
		conn.query(sql, (err, result) => {
			res.render('delete', { model_list: result, state: true, length_list: result.length });
		});
	});
});


/* GET delete with Model number. */
router.get('/delete/:model_number', function(req, res, next) {
	// var pool = new Pool(DB_INFO);
	
	// var model_number = req.params.model_number;

	// var sql = "SELECT * FROM model WHERE model_num = '"+model_number+"'";
	
	

	// delete_model_db = new Mydb(pool);

	// delete_model_db.execute( conn => {
	// 	conn.query(sql, (err, result) => {
	// 		res.send("hello world");
	// 	});remove
	// });
	res.send("hello");
});


/* GET keyword based search output page. */
router.get('/keyword_search/:keyword', function(req, res, next) {
	var pool = new Pool(DB_INFO);
	
	var keyword = req.params.keyword;
	var sql = `SELECT * FROM model WHERE keyword_one like '%${keyword}%' || keyword_two like '%${keyword}%' || keyword_three like '%${keyword}%'`
	keyword_search_db = new Mydb(pool);

	keyword_search_db.execute( conn => {
		conn.query(sql, (err, result) => {
			res.render('search_models', { model_list: result, state: true, length_list: result.length });
		});
	});
});


/* GET celeb based search output page. */
router.get('/celeb_to_model/:celeb_number', function(req, res, next) {
	var pool = new Pool(DB_INFO);
	
	var celeb_number = req.params.celeb_number;

	var data = fs.readFileSync('public/json/celeb_model.json', 'utf-8');
	var json_data = JSON.parse(data);

	var new_arr = json_data.filter(function(item){    
	  return item.celeb === celeb_number;
	});

	var arr_length = new_arr[0]["models"].length;
	var arr_models = new_arr[0]["models"]
	celeb_model_db = new Mydb(pool);

	// var sql = `SELECT * FROM model WHERE 1 keyword_one like '${keyword}' || keyword_two like '${keyword}' || keyword_three like '${keyword}'`
	var sql = "SELECT * FROM model WHERE 1 and ";

	if(arr_length == 0) {
		res.redirect('/search_celebs')
	} else {
		for(var i = 0; i < arr_length; i++) {
			if(i == 0) {
				sql = sql + `model_num = '${arr_models[i]}' `
			} else {
				sql = sql + `|| model_num = '${arr_models[i]}' `
			}
		}

		celeb_model_db.execute( conn => {
			conn.query(sql, (err, result) => {
				res.render('search_models', { model_list: result, state: true, length_list: arr_length})
			});
		});
	}
});


/* Get Keyword based search engine page */
router.get('/keywords_engine', function(req, res, next) {
  if (req.query.Keyword) {
		var keyword = req.query.Keyword;
		re_dir = '/keyword_search/'+keyword
		res.redirect(re_dir)
	}else {
		res.render('keyword', { state: false });
	}
});


/* GET fine_similar_celebrity page. */
router.get('/similar_engine', function(req, res, next) {
	res.render('find_similar_celebrity')
});


module.exports = router;