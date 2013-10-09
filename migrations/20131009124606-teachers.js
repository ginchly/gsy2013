var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function (db, callback) {
	db.createTable('teachers', {
		id: { type: 'int', primaryKey: true },
		name: { type: 'string' }
	}, function() {
		db.insert('teachers', ['id','name'] , [1, 'Mr Teacher'], callback);
	});
};

exports.down = function (db, callback) {
  db.dropTable('teachers', callback);
};