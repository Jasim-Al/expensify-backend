const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const expenseSchema = new Schema({
  description: { type: String, required: true },
  note: { type: String, required: false },
  amount: { type: Number, required: true },
  createdAt: { type: Number, required: true },
  userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});

expenseSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Expense", expenseSchema);
