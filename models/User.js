const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  password: { type: String, required: true, minlength: 6 },
  mail: {
    type: String,
    required: true,
    unique: true,
    uniqueCaseInsensitive: true,
  },
  expenses: [{ type: mongoose.Types.ObjectId, required: true, ref: "Expense" }],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
