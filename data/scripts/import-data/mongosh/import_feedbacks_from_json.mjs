/* global INPUT_FILE, DROP_COLLECTION, db */

(function main() {
  const required = ['_id', 'userId', 'courseId', 'rating', 'message', 'createdAt', 'updatedAt'];

  if (typeof INPUT_FILE !== 'string' || !INPUT_FILE) {
    throw new Error('INPUT_FILE is required');
  }

  const fs = require('fs');
  const raw = fs.readFileSync(INPUT_FILE, 'utf8');
  const docs = JSON.parse(raw);

  if (!Array.isArray(docs)) {
    throw new Error('Root JSON must be an array.');
  }

  docs.forEach((doc, idx) => {
    if (!doc || typeof doc !== 'object') {
      throw new Error(`Record #${idx + 1} must be an object.`);
    }

    required.forEach(key => {
      if (!(key in doc) || doc[key] === null || doc[key] === '') {
        throw new Error(`Record #${idx + 1} missing required field: ${key}`);
      }
    });

    if (!Number.isInteger(doc.rating)) {
      throw new Error(`Record #${idx + 1} rating must be integer.`);
    }

    if (!ObjectId.isValid(doc._id)) {
      throw new Error(`Record #${idx + 1} _id must be a valid ObjectId hex string.`);
    }

    doc._id = ObjectId(doc._id);
    doc.createdAt = new Date(doc.createdAt);
    doc.updatedAt = new Date(doc.updatedAt);

    if (Number.isNaN(doc.createdAt.getTime()) || Number.isNaN(doc.updatedAt.getTime())) {
      throw new Error(`Record #${idx + 1} has invalid createdAt/updatedAt date format.`);
    }
  });

  const col = db.getCollection('feedbacks');

  if (DROP_COLLECTION === true) {
    col.drop();
    print('Dropped collection feedbacks.');
  }

  if (docs.length > 0) {
    col.insertMany(docs, { ordered: false });
  }

  col.createIndex({ courseId: 1, _id: -1 });

  print(`Imported ${docs.length} feedback documents into ${db.getName()}.feedbacks`);
}());
