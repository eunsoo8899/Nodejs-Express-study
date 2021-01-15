# Server

## 1. Download node and express

### install express

```
 npm install express --save
```

### index.js 생성, 작성

---

## 2. Connetct to mongo db

### mongoDB sign in and make Cluster

- id,password 기억해야함

### connect with my app

#### download mongoose

```
 npm install mongoose --save
```

#### connect

```js
const mongoose = require('mongoose');

mongoose
  .connect(
    'mongodb+srv://<username>:<password>@boilerplate.rkhdg.gcp.mongodb.net/<dbname>?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log('DB connected'))
  .catch((err) => console.error(err));
```

---

## 3. Create user model

### make models

- model 폴더를 만들고 그 안에 user.js를 만든다

### make schema in model/user.js

- 필요한 내용을 넣어준다

```js
const mongoose = require('mongoos');
const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50
  },
  ect...
});
// 만들고자 하는 DB collection의 이름을 넣어준다, 여기서는 User
// userSchema에 저장될 Schema를 써준다. 여기서는 userSchema
const User = mongoose.model('User',userSchema)
module.export = { User }
```

---

## 4. Resister function using postman

### install body-parsor

```
npm install body-parser --save
```

### body-parser put in index.js

```js
const bodyParser = require('body-parser');
```

### bodyParser -> middleware -> app.use

```js
// for query
app.use(bodyParser.urlencoded({ extended: true }));
// for json
app.use(bodyParser.json());
```

### install cookie-parser

```
npm install cookie-parser --save
```

### cookie-parser put in index.js

```js
const cookieParser = require('cookie-parser');
```

### cookieParser -> middleware -> app.use

```js
app.use(cookieParser());
```

### route register page

- Bring user model

```js
const { User } = require('models/user.js 경로');
```

- post

```js
app.post('api/users/resister', (req, res) => {
  // new User에 bodyParser 를 통해 가져온 body를 request 해준다
  const user = new User(req.body);
  // 가져온 body를 DB에 save한다
  user.save((err, userData) => {
    if (err) return res.json({ success: false, err });
    return res.send(200).json({
      success: true,
    });
  });
});
```

---

## 5. Install nodemon for development mode

```
npm install nodemon --save-dev
```

- add scripts in package.json

```js
"scripts": {
"start" : "node index.js",
"dev": "nodemon index.js"
}
```

---

## 6. Secure private info with ENV file

- make config folder in root dir
- make dev, prod, key.js in config forder

### key.js

```js
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./prod');
} else {
  module.exports = require('./dev');
}
```

### dev.js

```js
module.exports = {
  mongoURI:
    'mongodb+srv://<mongoDB_ID>:<password>@boilerplate.rkhdg.gcp.mongodb.net/<dbname>?retryWrites=true&w=majority',
};
```

### prod.js

```js
module.exports = {
  mongoURI: process.env.MONGO_URI,
};
```

- bring key.js in index.js

```js
const config = require('./config/key.js');
```

- change mongoose.connect

```js
mongoose.connect(
  'mongodb+srv://ID:password@boilerplate.rkhdg.gcp.mongodb.net/<dbname>?retryWrites=true&w=majority'
);
// change
mongoose.connect(config.mongoURI);
```

- config/dev.js add to .gitignore

---

## 7. Hash password with bcrypt

- DB에 password가 그대로 들어가기 때문에 보안을 위해 hash과정이 필요

### install

```
npm install bcrypt --save
```

### Usage

```
https://www.npmjs.com/package/bcrypt
```

- models/user.js add

```js
const bcrypt = require('bcrypt');
const saltRounds = 10;

// put under const userSchema = mongoose.Schema({
// pre는 save이전 을 의미, this는 userSchema
userSchema.pre('save', function (next) {
  var user = this;
  // modified 된 경우만 hash
  if (user.isModified('password')) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);
      // if no err
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});
```

---

## 8. Login function with JsonWebToken

- make login route in index.js

```js
app.post('/api/user/login', (req, res) => {
  // 1. find email
  // 2. compare password
  // 3. generateToken
});
```

- find email

```js
User.findOne({ email: req.body.email }, (err, user) => {
  if (!user)
    return res.json({
      loginSuccess: false,
      message: 'email not found',
    });
});
```

- compare password

```js
// (req.body.passwords) = plane password
user.comparePassword(req.body.password, (err, isMatch) => {
  if (!isMatch) {
    return res.json({ loginSuccess: false, message: 'wrong password' });
  }
});
```

- make comparePassword method in models/user.js

```js
userSchema.methods.coomparePassword = function (plainPassword, cb) {
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};
```

- generate Token install

```
npm install jsonwebtoken --save
```

- generate Token require

```js
const jwt = require('jsonwebtoken');
```

- generate Token

```js
user.generateToken((err, user) => {
  if (err) return res.status(400).send(err);
  res.cookie('X_auth', user.token).status(200).json({
    loginSuccess: true,
  });
});
```

- make comparePassword method in models/user.js

```js
userSchema.methods.generateToken = function (cb) {
  var user = this;
  // _id는 mongoDB에서 알아서 처리해줌
  var token = jwt.sign(user._id.toHexString(), 'secret');

  user.token = token;
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};
```

- login route

```js
app.post('/api/user/login', (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user)
      return res.json({
        loginSuccess: false,
        message: 'Auth failed, email not found',
      });

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({ loginSuccess: false, message: 'Wrong password' });

      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);
        res.cookie('w_authExp', user.tokenExp);
        res.cookie('w_auth', user.token).status(200).json({
          loginSuccess: true,
          userId: user._id,
        });
      });
    });
  });
});
```

---

## 9. Authentication middleware

### login된 user만 data를 upload 할 수 있게

- make middleware/auth.js in root dir

```js
const { User } = require('../models/user');

let auth = (req, res, next) => {
  // we need token in here
  let token = req.cookies.x_auth;

  // make findByToken in models/user.js before write here
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user)
      return res.json({
        isAuth: false,
        error: true,
      });
    // 위의 작업이 끝나고 index.js의 auth로 req를 보내준다
    req.token = token;
    req.user = user;
    next();
  });
};

module.exports = { auth };
```

- models/user.js add static findByToken

```js
userSchema.statics.findByToken = function (token, cb) {
  // parameter를 일치 시켜 줘야 한다  => token,cb
  var user = this;
  // middleware-generateToken에서 token을 만들때 이용한 key값인 secret을 이용
  // token을 가져와서 decode
  // decode 하기 위해 verify 사용
  jwt.verify(token, 'secret', function (err, decode) {
    user.findOne({ _id: decode, token: token }, function (err, user) {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};
```

- auth middleware add in index.js

```js
const { auth } = require('./middleware/auth.js');
```

- index.js -> app.get = 데이터가 많지 않기 때문에 get을 이용

```js
// auth.js / findByToken => req를 받아옴
app.get('/api/user/auth', auth, (req, res) => {
  // response data
  res.status(200).json({
    _id: req._id,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
  });
});
```

---

## 10. Log out

### 토큰을 삭제!

- index.js

```js
app.get('./api/user/logout', auth, (req, res) => {
  User.findOneUpdate({ _id: req.user._id }, { token: '' }, (err, doc) => {
    if (err) return res.json({ success: false });
    return res.status(200).send({
      success: true,
    });
  });
});
```

- postman으로 테스트 => DB에 들어가서 token이 지워졌는지 확인

---

## 11. make server,client dir

- move index.js, (models, middleware, config)folder to server folder

---

---

---

---

---

---

# Client

## 1. Create React App

- Create in client folder

```
npx create-react-app .
```

## 2. Axios

- Promise based HTTP client for the browser and node.js
- website에서 server로 data를 보내기 위해 필요
- Install

```
npm install axios --save
```

- Delete App.test.js, logo.svg, App.css, reportWebVitals.js, setupTests.js
- mkdir component folder in src folder and move App.js to component folder
- Delete code in App.js in div tag

- components/App.js

```js
import React from 'react';

function App() {
  return <div className='App'>something...</div>;
}

export default App;
```

- App.js

```js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
```
