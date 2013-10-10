var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function (db, callback) {
	db.createTable('courses', {
		id: { type: 'int', primaryKey: true, autoIncrement: true  },
		name: { type: 'string' },
		lat: {type: 'decimal'},
		long: {type: 'decimal'}
	}, function() {
		db.insert('courses', ['name', 'lat', 'long'] , ['Global Startup Youth - Kuala Lumpur', 3.17717, 101.66675], callback);
	});
};

exports.down = function (db, callback) {
  db.dropTable('courses', callback);
};