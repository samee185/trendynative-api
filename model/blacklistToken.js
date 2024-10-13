const mongoose = require("mongoose");
const blackList = new mongoose.Schema({
  token: {
    type: String,
  },
});

const BlackListModel = mongoose.model("BlackListedTokens", blackList);

module.exports = BlackListModel;
