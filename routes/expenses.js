const express = require("express");
const { check } = require("express-validator");

const expensesController = require("../controllers/expenses");

const router = express.Router();

router.get("/", expensesController.getExpensesByUserId);

router.post(
  "/",
  [
    check("description").not().isEmpty(),
    check("amount").not().isEmpty(),
    check("createdAt").not().isEmpty(),
  ],
  expensesController.createExpense
);

router.patch(
  "/:eid",
  [
    check("description").not().isEmpty(),
    check("amount").not().isEmpty(),
    check("createdAt").not().isEmpty(),
  ],
  expensesController.updateExpense
);

router.delete("/:eid", expensesController.deleteExpense);

module.exports = router;
