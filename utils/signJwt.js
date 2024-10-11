const jwt = require("jsonwebtoken");


const signJwt = (id) => {
    return jwt.sign({ id }, process.env.jwtSecret, {
        expiresIn: process.env.jwtExpiresIn,
    });
};
module.exports = signJwt ;