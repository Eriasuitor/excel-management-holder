const {Strategy: JwtStrategy, ExtractJwt} = require('passport-jwt')
const config = require('../config')
const jwt = require('jsonwebtoken')

exports.jwtStrategy = () => {
  return new JwtStrategy({
    secretOrKey: config.jwt.key,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
  }, (payload, done) => {
    done(null, payload)
  })
}

exports.jwtSign = (payload) => jwt.sign(payload, config.jwt.key, {expiresIn: config.jwt.expiresIn})
