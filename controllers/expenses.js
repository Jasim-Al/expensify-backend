const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const Expense = require("../models/Expense");
const HttpError = require("../models/http-error");
const User = require("../models/User");

const getExpensesByUserId = async (req, res, next) => {
  const userId = req.userData.userId;

  let userWithExpenses;

  try {
    userWithExpenses = await User.findById(userId).populate("expenses");
  } catch (error) {
    const err = new HttpError(
      "Fetching expenses failed, please try again later.",
      500
    );
    return next(err);
  }

  if (!userWithExpenses || userWithExpenses.expenses.length == 0) {
    return next(
      new HttpError("Could not find expenses for the provided user id.", 404)
    );
  }

  res.json({
    expenses: userWithExpenses.expenses.map((expense) => {
      expense.toObject({ getters: true });
    }),
  });
};

const createExpense = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { description, note, createdAt, amount } = req.body;

  const createdExpense = new Expense({
    description,
    note,
    createdAt,
    amount,
    userId: req.userData.userId,
  });

  let user;

  try {
    user = await User.findById(req.userData.userId);
  } catch (error) {
    const err = new HttpError(
      "Creating expense failed, please try again.",
      500
    );
    return next(err);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }

  try {
    const sess = mongoose.startSession();
    sess.startTransaction();
    await createExpense.save({ session: sess });
    user.expenses.push(createdExpense);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    const err = new HttpError("Creating place failed, please try again.", 500);
    return next(err);
  }

  res.status(201).json({ expense: createdExpense });
};

const updateExpense = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { description, note, amount } = req.body;
  const expenseId = req.params.eid;

  let expense;
  try {
    expense = Expense.findById(expenseId);
  } catch (error) {
    const err = new HttpError(
      "Something went wrong, could not update place.",
      500
    );
    return next(err);
  }

  if (expense.userId.toString() !== req.userData.userId) {
    return next(new HttpError("You are not allowed to edit this place.", 401));
  }

  expense.description = description;
  expense.note = note;
  expense.amount = amount;

  try {
    await expense.save();
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not update expense.", 500)
    );
  }

  res.status(200).json({ expense: expense.toObject({ getters: true }) });
};

const deleteExpense = async (req, res, next) => {
  let expenseId = req.params.eid;

  let expense;

  try {
    expense = await Expense.findById(expenseId);
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not delete expense.", 500)
    );
  }

  if (!expense) {
    return next("Could'nt find expense for the given id.", 404);
  }

  if (expense.userId !== req.userData.userId) {
    return next(
      new HttpError("You are not allowed to delete this expense.", 401)
    );
  }

  try {
    const sess = mongoose.startSession();
    await expense.remove({ session: sess });
    expense.userId.expenses.pull(expense);
    await expense.userId.save({ session: sess });
    (await sess).commitTransaction();
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not delete expense.", 500)
    );
  }
  res.status(200).json({ message: "Deleted expense." });
};

exports.getExpensesByUserId = getExpensesByUserId;
exports.createExpense = createExpense;
exports.updateExpense = updateExpense;
exports.deleteExpense = deleteExpense;
