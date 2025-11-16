const mysql = require("mysql2/promise");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const geminiKey = process.env.GEMINI_API_KEY;
const { promptHindi, promptEnglish, promptPunjabi } = require("./prompt.js");

let db; // global reusable connection

async function initDB() {
  if (!db) {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });
  }
  return db;
}

function getDB() {
  return db; // return the initialized db
}
const genAI = new GoogleGenerativeAI(geminiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  responseMimeType: "application/json",
});
async function getAiReply(userMessage, session_id, language) {
  let db = getDB();
  let systemPrompt;
  if (language == "HINDI") {
    systemPrompt = promptHindi;
  } else if (language == "ENGLISH") {
    systemPrompt = promptEnglish;
  } else if (language == "PUNJABI") {
    systemPrompt = promptPunjabi;
  }

  let chat;
  let descPrompt;

  if (!userMessage || userMessage.trim() === "") {
    descPrompt = `Do not phrase it as if a conversation is already ongoing. Initialise chat by tell about yourself.`;
  } else {
    descPrompt = `Answer the user query in 1 to 2 sentences : ${userMessage}`;
  }

  if (!session_id) {
    chat = await model.startChat({
      history: [{ role: "user", parts: [{ text: systemPrompt }] }],
    });
  } else {
    // Fetch session history from DB for existing session
    const [sessionHistory] = await db.query(
      "SELECT * FROM message WHERE session_id = ? ORDER BY id ASC",
      [session_id]
    );
    console.log(sessionHistory, "---------------------");
    let formattedHistory = {};
    formattedHistory = sessionHistory.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.message }],
    }));
    if (formattedHistory.length > 0) {
      formattedHistory[0].role = "user";
    }
    console.log("formatted----", formattedHistory);

    chat = await model.startChat({
      history: [...formattedHistory],
    });
  }
  response = await chat.sendMessage(descPrompt);

  return response.response.text();
}

module.exports = { initDB, getDB, getAiReply };
