var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function (db, callback) {
	db.createTable('sessions', {
		id: { type: 'int', primaryKey: true },
		name: { type: 'string' },
		course: { type: 'int' }
	}, function() {
		db.insert('sessions', ['id','name', 'course'] , [1, 'Introduction To Computer Science', 1], function() {
			db.insert('sessions', ['id','name', 'course'] , [2, 'Efficiency and Order of Growth', 1], function() {
				db.insert('sessions', ['id','name', 'course'] , [3, 'Memory and Search Methods', 1], callback);
				});
			});
		});
	};

exports.down = function (db, callback) {
  db.dropTable('sessions', callback);
};