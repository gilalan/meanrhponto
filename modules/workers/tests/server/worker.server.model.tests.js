'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  WorkerObj = mongoose.model('Worker');

/**
 * Globals
 */
var user,
  worker;

/**
 * Unit tests
 */
describe('WorkerObj Model Unit Tests:', function() {
  beforeEach(function(done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password'
    });

    user.save(function() {
      worker = new WorkerObj({
        name: 'WorkerObj Name',
        user: user
      });

      done();
    });
  });

  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      this.timeout(0);
      return worker.save(function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without name', function(done) {
      worker.name = '';

      return worker.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function(done) {
    WorkerObj.remove().exec(function() {
      User.remove().exec(function() {
        done();
      });
    });
  });
});
