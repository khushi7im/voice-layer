const express = require("express");
const router = express.Router();
const { getAiReply } = require("./helper");
const controller = require("./controller");

router.post("/insert-device", controller.insertDevice);
router.post("/insert-session", controller.insertSession);
router.post("/message", controller.sendMessage);
module.exports = router;
