const express = require('express');
const app = express();
const port = 5000;
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { User } = require('./models/user');
const { auth } = require('./middleware/auth.js');
const config = require('./config/key');


mongoose
.connect(config.mongoURI,  
  {
    useNewUrlParser: true, useUnifiedTopology: true,
    useCreateIndex: true, useFindAndModify: false
  }
  )
  .then(() => console.log('DB connected'))
  .catch((err) => console.error(err));
  
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(cookieParser());
  
  app.get('/', (req, res) => {
    res.send('Home page')
  });

  app.get('/api/user/auth', auth, (req, res) => {
    res.status(200).json({
      _id: req._id,
      isAuth: true,
      email: req.user.email,
      name: req.user.name,
      lastname: req.user.lastname,
      role: req.user.role,
    });
  });

app.post('/api/user/resister', (req, res) => {

  const user = new User(req.body);
  
  user.save((err, userData) => {
    if (err) return res.json({ success: false, err });
    return res.send(200).json({
      success: true
    });
  });
});

app.post("/api/user/login", (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user)
      return res.json({
        loginSuccess: false,
        message: "Auth failed, email not found"
        });

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({ loginSuccess: false, message: "Wrong password" });

    user.generateToken((err, user) => {
      if (err) return res.status(400).send(err);
      res.cookie("w_authExp", user.tokenExp);
      res
        .cookie("w_auth", user.token)
        .status(200)
        .json({
          loginSuccess: true, userId: user._id
        });
      });
    });
  });
});


app.listen(port, () => {
  console.log(`localhost${port} connected`)
});