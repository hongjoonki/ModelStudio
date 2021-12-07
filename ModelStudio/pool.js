const mysql = require('mysql'),
	util = require('util'),
	Promise = require('bluebird');

Promise.promisifyAll(mysql);
Promise.promisifyAll(require('mysql/lib/Connection').prototype);
Promise.promisifyAll(require('mysql/lib/Pool').prototype);

// const DB_INFO = {
// 	host : 'model-db.cvdolyhapzj7.ap-northeast-2.rds.amazonaws.com',
// 	user : 'admin',
// 	password : '11111111',
// 	database : 'modeldb',
// 	multipleStatements : true,
// 	connectionLimit : 5,
// 	waitForConnections: false
// };

const DB_INFO = {
	host     : 'model-db.cvdolyhapzj7.ap-northeast-2.rds.amazonaws.com',
	user     : 'admin',
	password : '11111111',
	port     : '3306',
	database : 'modeldb'
}

module.exports = class {
	constructor(dbinfo) {
		dbinfo = dbinfo || DB_INFO;
		this.pool = mysql.createPool(dbinfo);
	}

	connect() {
		return this.pool.getConnectionAsync().disposer(conn => {
			return conn.release();
		});
	}

	end() {
		this.pool.end(function(err) {
			util.log(">>>>>>>>>>>>>>>>>>>>>>>> END of pool !!");
			if (err)
				util.log('ERR pool ending!!');
		});
	}
};