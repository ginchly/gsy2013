var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function (db, callback) {
  db.createTable('transcripts', {
    id: { type: 'int', primaryKey: true },
    transcript: 'string'
  }, callback);
};

exports.down = function (db, callback) {
  db.dropTable('transcripts', callback);
};