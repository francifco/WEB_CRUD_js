var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var Sequelize = require('sequelize');
var sequelizeConfig = require('.././database/config');

var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');


var User = sequelizeConfig.define('users', {

  id: {
    type: Sequelize.INTEGER,
    field: 'id',
    primaryKey: true
  },

  username: {
    type: Sequelize.STRING,
    field: 'username'
  },

  password: {
    type: Sequelize.STRING,
    field: 'userpassword'
  },

  phoneNumber: {
    type: Sequelize.STRING,
    field: 'phoneNumber'
  },

  mail: {
    type: Sequelize.STRING,
    field: 'mail'
  },

  address: {
    type: Sequelize.STRING,
    field: 'address'
  },

  active: {
    type: Sequelize.BOOLEAN,
    field: 'active'
  },

  isAdmin: {
    type: Sequelize.BOOLEAN,
    field: 'isAdmin'
  },

}, {
  freezeTableName: true,
  timestamps: false
});


function sendMail(user){

var client = nodemailer.createTransport({
  service: 'SendGrid',
  auth: {
    user: 'dieguito12',
    pass: 'donkingkong12'
  }
});


  var email = {
    from: 'webcrud@bar.com',
    to: user.mail,
    subject: 'welcome to web crud',
    text: 'you are registered',
  };

  client.sendMail(email, function(err, info){
      if (err ){
        console.log(err);
      }
      else {
        console.log('Message sent: ' + info.response);
      }
  });

}

module.exports = {

  postRegister: function (req, res, next){
    
    var bodyUser = {
      username  : req.body.username,
      password  : req.body.password,
      phoneNumber : req.body.phoneNumber,
      mail : req.body.mail,
      address : req.body.address,
      active : false, //default value
      isAdmin : false // default value
    }

    console.log("nombre" + req.body.username);


    ///test te connection with the data base
    sequelizeConfig.authenticate() .then(function () {

      User.findOne({
        where: {
          username: bodyUser.username
        } 

      }).then(function(result){
        if (!result) {
          
          User.create({
            
            username: bodyUser.username,
            password: bodyUser.password,
            phoneNumber: bodyUser.phoneNumber,
            mail : bodyUser.mail,
            address : bodyUser.address,
            active : bodyUser.active,
            isAdmin : bodyUser.isAdmin

          }).then(function(result){
          
            sendMail(bodyUser);

            var obj = '{"data": {"message":"User created"}}';
            res.status(200);
            res.send(JSON.parse(obj));

          });
        }
      
        else {
          var obj = '{"error": {"message":"User already exists", "code":"400" }}';
          res.status(400);
          res.send(JSON.parse(obj));
        }
      });

    }).catch(function (err) {
          var obj = '{"error": {"message":"Database connection not Found", "code":"500" }}';
          res.status(500);
          res.send(JSON.parse(obj));
      }).done();

  },

	postLogin: function(req, res, next){

		var bodyUser = {

			username 	: req.body.username,
			password	: req.body.password
		}


		///test te connection with the data base
		sequelizeConfig.authenticate() .then(function () {

        	// create a token
	        var token = jwt.sign(bodyUser, 'superSecret', {
	          expiresIn: 1800 // expires in 30 min.
        	});

        	User.findOne({
	       		where: {
	       			username: bodyUser.username,
	       			password: bodyUser.password
	       		}

			}).then(function(result){

				var obj = '{'
	       		+'"id":"' + result.id + '",'
	       		+'"username":"' + result.username + '",'
            +'"active":"' + result.active + '",'
            +'"isAdmin":"' + result.isAdmin + '",'
	       		+'"token":"' + token + '"'
	       		+'}';

				res.send(JSON.parse(obj));

			}).catch(function (err) {
    			var obj = '{"error": {"message":"Invalid Credentials", "code":"400" }}';
          res.status(400);
        	res.send(JSON.parse(obj));
			});

    	}).catch(function (err) {
      		var obj = '{"error": {"message":"Database connection not Found"}}';
          res.status(500);
       		res.send(JSON.parse(obj));
    	}).done();

	},


  postActivateUser: function (req, res, next){
    
    var bId = req.body.id;

    var reqToken = req.body.token;
    
    if (reqToken) {
          // verifies secret and checks exp
            jwt.verify(reqToken,'superSecret', function(err, decoded) {      
              if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });    
              } else {
             
                  ///test the connection with the data base
                sequelizeConfig.authenticate() .then(function () {
                
                  User.update({

                    active: true,
                    }, {
                      where: {
                        id: bId,
                        active: false
                      }
                    }).then(function(result){

                      var obj = '{"data": {"message":"User Enabled"}}';
                      res.status(200);
                      res.send(JSON.parse(obj));

                  }).catch(function (err) {
                      var obj = '{"error": {"message":"Invalid Credentials", "code":"400" }}';
                      res.status(400);
                      res.send(JSON.parse(obj));
                  });

              }).catch(function (err) {
                
                var obj = '{"error": {"message":"Database connection not Found"}}';
                    res.send(JSON.parse(obj));
              
              }).done();

                }
            });

        } else {

          return res.status(403).send({ 
              success: false, 
              message: 'No token provided.' 
          });
        }
  
  },

  postDisableUser: function (req, res, next){
    
    var bId = req.body.id;

    var reqToken = req.body.token;
    
    if (reqToken) {
          // verifies secret and checks exp
            jwt.verify(reqToken,'superSecret', function(err, decoded) {      
              if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });    
              } else {
             
                  ///test the connection with the data base
                sequelizeConfig.authenticate() .then(function () {
                
                  User.update({

                    active: false,
                    }, {
                      where: {
                        id: bId,
                        active: true
                      }
                    }).then(function(result){

                      var obj = '{"data": {"message":"User Disabled"}}';
                      res.status(200);
                      res.send(JSON.parse(obj));

                  }).catch(function (err) {
                      var obj = '{"error": {"message":"Invalid Credentials", "code":"400" }}';
                      res.status(400);
                      res.send(JSON.parse(obj));
                  });

              }).catch(function (err) {
                
                var obj = '{"error": {"message":"Database connection not Found"}}';
                    res.send(JSON.parse(obj));
              
              }).done();

                }
            });

        } else {

          return res.status(403).send({ 
              success: false, 
              message: 'No token provided.' 
          });
        }
  
  },



  getAllUsers: function (req, res, next){


    var reqToken = req.get("token");
    
    if (reqToken) {
          // verifies secret and checks exp
            jwt.verify(reqToken,'superSecret', function(err, decoded) {      
              if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });    
              } else {
             
                  ///test the connection with the data base
                sequelizeConfig.authenticate() .then(function () {
                
                  User.findAndCountAll({

                    }).then(function(result){

                      res.send(JSON.parse(JSON.stringify(result)));

                  }).catch(function (err) {
                      var obj = '{"error": {"message":"Invalid Credentials", "code":"400" }}';
                      res.status(400);
                      res.send(JSON.parse(obj));
                  });

              }).catch(function (err) {
                
                var obj = '{"error": {"message":"Database connection not Found"}}';
                    res.send(JSON.parse(obj));
              
              }).done();

                }
            });

        } else {

          return res.status(403).send({ 
              success: false, 
              message: 'No token provided.' 
          });
        }

  },

  getAllEnabledUsers: function (req, res, next){

    var reqToken = req.get("token");
    
    if (reqToken) {
          // verifies secret and checks exp
            jwt.verify(reqToken,'superSecret', function(err, decoded) {      
              if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });    
              } else {
             
                  ///test the connection with the data base
                sequelizeConfig.authenticate() .then(function () {
                
                  User.findAndCountAll({

                      where: {active: true}

                    }).then(function(result){

                      res.send(JSON.parse(JSON.stringify(result)));

                  }).catch(function (err) {
                      var obj = '{"error": {"message":"Invalid Credentials", "code":"400" }}';
                      res.status(400);
                      res.send(JSON.parse(obj));
                  });

              }).catch(function (err) {
                
                var obj = '{"error": {"message":"Database connection not Found"}}';
                    res.send(JSON.parse(obj));
              
              }).done();

                }
            });

        } else {

          return res.status(403).send({ 
              success: false, 
              message: 'No token provided.' 
          });
        }


  },

  getAllDisabledUsers: function (req, res, next){

    var reqToken = req.get("token");
    
  
    if (reqToken) {
          // verifies secret and checks exp
            jwt.verify(reqToken,'superSecret', function(err, decoded) {      
              if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });    
              } else {
             
                  ///test the connection with the data base
                sequelizeConfig.authenticate() .then(function () {
                
                  User.findAndCountAll({

                      where: {active: false}

                    }).then(function(result){

                      res.send(JSON.parse(JSON.stringify(result)));

                  }).catch(function (err) {
                      var obj = '{"error": {"message":"Invalid Credentials", "code":"400" }}';
                      res.status(400);
                      res.send(JSON.parse(obj));
                  });

              }).catch(function (err) {
                
                var obj = '{"error": {"message":"Database connection not Found"}}';
                    res.send(JSON.parse(obj));
              
              }).done();

                }
            });

        } else {

          return res.status(403).send({ 
              success: false, 
              message: 'No token provided.' 
          });
        }

  }


}