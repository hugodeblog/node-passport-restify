import path from 'path';
import util from 'util';
import { default as express } from 'express';
import { default as passport } from 'passport';
import { default as passportLocal } from 'passport-local';
const LocalStrategy = passportLocal.Strategy;
import { sessionCookieName } from '../app.mjs';
import {default as request} from 'superagent';
import * as url from 'url';
const URL = url.URL;

const BasicAuthKey = {
  user: process.env.BASIC_AUTH_USER,
  pass: process.env.BASIC_AUTH_PASS
};

function requestURL(path) {
  const requrl = new URL('http://localhost:4000');
  requrl.pathname = path;
  return requrl.toString();
}

export const router = express.Router();

export function initPassport(app) {
  app.use(passport.initialize());
  app.use(passport.session());
}

// ログイン用ストラテジー
passport.use(new LocalStrategy({
    passReqToCallback : false
  },
  async (username, password, done) => {
    console.log('passport strategy called');
    console.log(`username = ${username}, passowrd = ${password}`);
    try {
      var res = await request.post(requestURL('/password-check'))
      .timeout({response: 5*1000, deadline: 10*1000})
      .send({'username':username, 'password':password})
      .set('Content-Type', 'application/json')
      .auth(BasicAuthKey.user, BasicAuthKey.pass);
      console.log({ id: res.body.id, username: res.body.username});
      done(null, { id: res.body.id, username: res.body.username});
    } catch(err) {
      if(err.response && err.response.status && err.response.body) {
        //done(null, false, `stauts=>${err.response.status}, message=>${err.response.body}`);
        done(null, false);
      }
      else {
        done(err);
      }
    }
  }
));

passport.serializeUser(function(user, done) {
  console.log('serializeUser called');
  try {
    console.log(`serialized user=${user}`);
    done(null, user);
  } catch (e) { done(e); }
});

passport.deserializeUser(async (user, done) => {
  console.log('deserializeUser called');
  try {
    console.log(`deserialized user=${user}`);
    done(null, user);
  } catch(e) { done(e); }
});

// 認証ログイン画面
router.get('/login', function(req, res, next) {
  console.log('/login called');
  try {
    res.render('login', {title: 'ログイン', user: req.user ? req.user : undefined});
  } catch (e) { next(e); }
});

// ログインを試す
router.post('/login',
passport.authenticate('local', {
  successRedirect: '/', // 成功時のログイン先
  failureRedirect: 'login-failure', // 失敗時
})
);

// 認証キャッシュを削除する
router.get('/logout', function(req, res, next) {
  try {
    req.session.destroy();
    req.logout();
    res.clearCookie(sessionCookieName);
    res.redirect('login');
  } catch (e) { next(e); }
});

// ログイン失敗
router.get('/login-failure', function(req, res, next) {
  try {
    res.render('login-failure');
  } catch (e) { next(e); }
});


// サインアップページ
router.get('/signup', function(req, res, next) {
  console.log('get /signup called');
  try {
    res.render('signup', {title: 'サインアップ', user: req.user ? req.user : undefined});
  } catch (e) { next(e); }
});

// サインアップ処理
router.post('/signup', async function(req, res, next) {
  try {
    var result = await request.post(requestURL('/users'))
      .timeout({response: 5*1000, deadline: 10*1000})
      .send({'username':req.body.username, 'password':req.body.password, 'address':req.body.address})
      .set('Content-Type', 'application/json')
      .auth(BasicAuthKey.user, BasicAuthKey.pass);
    console.log({ id: result.body.id, username: result.body.username});
    res.redirect('signup-success');
  } catch (err) {
    if(err.response && err.response.status && err.response.body)
      res.redirect('signup-failure?error=' + `stauts=>${err.response.status}, message=>${err.response.body}`);
    else
      res.redirect('signup-failure?error=' + err);
  }
});

// サインアップ失敗
router.get('/signup-failure', function(req, res, next) {
  var passedVariable = req.query.error;
  try {
    res.render('signup-failure', {message: passedVariable ? passedVariable : undefined});
  } catch (e) { next(e); }
});

// サインアップ成功
router.get('/signup-success', function(req, res, next) {
  try {
    res.render('signup-success');
  } catch (e) { next(e); }
});
