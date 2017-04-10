'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  WorkerObj = mongoose.model('Worker'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  worker;

/**
 * WorkerObj routes tests
 */
describe('WorkerObj CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new WorkerObj
    user.save(function () {
      worker = {
        name: 'WorkerObj name'
      };

      done();
    });
  });

  it('should be able to save a WorkerObj if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new WorkerObj
        agent.post('/api/workers')
          .send(worker)
          .expect(200)
          .end(function (workerSaveErr, workerSaveRes) {
            // Handle WorkerObj save error
            if (workerSaveErr) {
              return done(workerSaveErr);
            }

            // Get a list of WorkerObjs
            agent.get('/api/workers')
              .end(function (workersGetErr, workersGetRes) {
                // Handle WorkerObjs save error
                if (workersGetErr) {
                  return done(workersGetErr);
                }

                // Get WorkerObjs list
                var workers = workersGetRes.body;

                // Set assertions
                (workers[0].user._id).should.equal(userId);
                (workers[0].name).should.match('WorkerObj name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an WorkerObj if not logged in', function (done) {
    agent.post('/api/workers')
      .send(worker)
      .expect(403)
      .end(function (workerSaveErr, workerSaveRes) {
        // Call the assertion callback
        done(workerSaveErr);
      });
  });

  it('should not be able to save an WorkerObj if no name is provided', function (done) {
    // Invalidate name field
    worker.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new WorkerObj
        agent.post('/api/workers')
          .send(worker)
          .expect(400)
          .end(function (workerSaveErr, workerSaveRes) {
            // Set message assertion
            (workerSaveRes.body.message).should.match('Please fill WorkerObj name');

            // Handle WorkerObj save error
            done(workerSaveErr);
          });
      });
  });

  it('should be able to update an WorkerObj if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new WorkerObj
        agent.post('/api/workers')
          .send(worker)
          .expect(200)
          .end(function (workerSaveErr, workerSaveRes) {
            // Handle WorkerObj save error
            if (workerSaveErr) {
              return done(workerSaveErr);
            }

            // Update WorkerObj name
            worker.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing WorkerObj
            agent.put('/api/workers/' + workerSaveRes.body._id)
              .send(worker)
              .expect(200)
              .end(function (workerUpdateErr, workerUpdateRes) {
                // Handle WorkerObj update error
                if (workerUpdateErr) {
                  return done(workerUpdateErr);
                }

                // Set assertions
                (workerUpdateRes.body._id).should.equal(workerSaveRes.body._id);
                (workerUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of WorkerObjs if not signed in', function (done) {
    // Create new WorkerObj model instance
    var workerObj = new WorkerObj(worker);

    // Save the worker
    workerObj.save(function () {
      // Request WorkerObjs
      request(app).get('/api/workers')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single WorkerObj if not signed in', function (done) {
    // Create new WorkerObj model instance
    var workerObj = new WorkerObj(worker);

    // Save the WorkerObj
    workerObj.save(function () {
      request(app).get('/api/workers/' + workerObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', worker.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single WorkerObj with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/workers/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'WorkerObj is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single WorkerObj which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent WorkerObj
    request(app).get('/api/workers/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No WorkerObj with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an WorkerObj if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new WorkerObj
        agent.post('/api/workers')
          .send(worker)
          .expect(200)
          .end(function (workerSaveErr, workerSaveRes) {
            // Handle WorkerObj save error
            if (workerSaveErr) {
              return done(workerSaveErr);
            }

            // Delete an existing WorkerObj
            agent.delete('/api/workers/' + workerSaveRes.body._id)
              .send(worker)
              .expect(200)
              .end(function (workerDeleteErr, workerDeleteRes) {
                // Handle worker error error
                if (workerDeleteErr) {
                  return done(workerDeleteErr);
                }

                // Set assertions
                (workerDeleteRes.body._id).should.equal(workerSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an WorkerObj if not signed in', function (done) {
    // Set WorkerObj user
    worker.user = user;

    // Create new WorkerObj model instance
    var workerObj = new WorkerObj(worker);

    // Save the WorkerObj
    workerObj.save(function () {
      // Try deleting WorkerObj
      request(app).delete('/api/workers/' + workerObj._id)
        .expect(403)
        .end(function (workerDeleteErr, workerDeleteRes) {
          // Set message assertion
          (workerDeleteRes.body.message).should.match('User is not authorized');

          // Handle WorkerObj error error
          done(workerDeleteErr);
        });

    });
  });

  it('should be able to get a single WorkerObj that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new WorkerObj
          agent.post('/api/workers')
            .send(worker)
            .expect(200)
            .end(function (workerSaveErr, workerSaveRes) {
              // Handle WorkerObj save error
              if (workerSaveErr) {
                return done(workerSaveErr);
              }

              // Set assertions on new WorkerObj
              (workerSaveRes.body.name).should.equal(worker.name);
              should.exist(workerSaveRes.body.user);
              should.equal(workerSaveRes.body.user._id, orphanId);

              // force the WorkerObj to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the WorkerObj
                    agent.get('/api/workers/' + workerSaveRes.body._id)
                      .expect(200)
                      .end(function (workerInfoErr, workerInfoRes) {
                        // Handle WorkerObj error
                        if (workerInfoErr) {
                          return done(workerInfoErr);
                        }

                        // Set assertions
                        (workerInfoRes.body._id).should.equal(workerSaveRes.body._id);
                        (workerInfoRes.body.name).should.equal(worker.name);
                        should.equal(workerInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      WorkerObj.remove().exec(done);
    });
  });
});
