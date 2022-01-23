const express = require("express");
const userController = require("../controllers/user");

const router = express.Router();

router.get("/", userController.getUsers);
router.post("/filter", userController.filterUsers);
router.delete("/", userController.deleteUser);

module.exports = router;
