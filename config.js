"use strict";
exports.DATABASE_URL =
  process.env.DATABASE_URL || "mongodb://localhost/musicianship";
exports.TEST_DTABASE_URL =
  process.env.TEST_DATABASE_URL || "mongodb://localhost/test-musicianship";
exports.PORT = process.env.PORT || 8080;
