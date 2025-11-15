const { getDB, getAiReply } = require("./helper");
const { v4 } = require("uuid");
exports.insertDevice = async (req, res) => {
  let { device_id, about } = req.body;
  let db = getDB();

  try {
    const sql = `INSERT INTO device (device_id, about) VALUES (?, ?)`;
    const values = [device_id, about];
    await db.query(sql, values);
    res.send("Device inserted successfully.");
  } catch (error) {
    console.error("Error inserting device:", error);
    res.status(500).send("Error inserting device.");
  }
};

exports.insertSession = async (req, res) => {
  let { session_id, device_id } = req.body;
  let db = getDB();
  session_id = v4();
  try {
    const sql = `INSERT INTO sessions (session_id, device_id) VALUES (?, ?)`;
    const values = [session_id, device_id];
    let response = await getAiReply();
    console.log(response, "response---");
    await db.query(sql, values);
    let message_id = v4();
    await db.query(
      `INSERT INTO message (session_id, message_id, message, device_id, role) VALUES (?, ?, ?, ?, 'model')`,
      [session_id, message_id, response, device_id]
    );
    res.send(response);
  } catch (error) {
    console.error("Error inserting session:", error);
    res.status(500).send("Error inserting session.");
  }
};

exports.sendMessage = async (req, res) => {
  let { session_id, message_id, message, device_id } = req.body;
  let db = getDB();
  message_id = v4();
  try {
    const sql = `INSERT INTO message (session_id, message_id, message, device_id,role) VALUES (?, ?, ?, ?, 'user')`;
    const values = [session_id, message_id, message, device_id];
    let response = await getAiReply(message, session_id);
    await db.query(sql, values);
    await db.query(
      `INSERT INTO message (session_id, message_id, message, device_id, role) VALUES (?, ?, ?, ?, 'model')`,
      [session_id, v4(), response, device_id]
    );
    res.send(response);
  } catch (error) {
    console.error("Error inserting message:", error);
    res.status(500).send("Error inserting message.");
  }
};
