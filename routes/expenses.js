const express = require("express");
const { check } = require("express-validator");

const expensesController = require("../controllers/expenses");
const checkAuth = require("../middlewares/check-auth");

const router = express.Router();

router.use(checkAuth);

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

router.get("/:eid", expensesController.getExpenseById);
router.patch(
  "/:eid",
  [check("description").not().isEmpty(), check("amount").not().isEmpty()],
  expensesController.updateExpense
);

router.delete("/:eid", expensesController.deleteExpense);

module.exports = router;
