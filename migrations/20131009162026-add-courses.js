var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function (db, callback) {
	db.createTable('courses', {
		id: { type: 'int', primaryKey: true },
		name: { type: 'string' }
	}, function() {
		db.insert('courses', ['id','name'] , [1, 'CS101'], callback);
	});
};

exports.down = function (db, callback) {
  db.dropTable('courses', callback);
};