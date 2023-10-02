const express = require("express");
const mysql = require("mysql2/promise");

const app = express();

app.use(express.json());

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "quiz",
};

const pool = mysql.createPool(dbConfig);

app.post("/quiz/add", async (req, res) => {
  try {
    const {
      question,
      question_category,
      type,
      difficulty,
      correct_answer,
      wrong_answer_1,
      wrong_answer_2,
      wrong_answer_3,
    } = req.body;

    const connection = await pool.getConnection();
    console.log("Connected to the database");

    const query = `
      INSERT INTO quiz_questions
      (question, question_category, type, difficulty, correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      question,
      question_category,
      type,
      difficulty,
      correct_answer,
      wrong_answer_1,
      wrong_answer_2,
      wrong_answer_3,
    ];

    // Execute the INSERT query
    await connection.query(query, values);

    connection.release();

    res.status(201).json({ message: "Quiz question added successfully" });
  } catch (error) {
    console.error("Error adding quiz question:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST route for adding multiple quiz questions
app.post("/quiz/addmultiple", async (req, res) => {
  try {
    const quizData = req.body; // Assuming req.body is an array of JSON objects

    const connection = await pool.getConnection();

    for (const data of quizData) {
      const {
        question,
        question_category,
        type,
        difficulty,
        correct_answer,
        wrong_answer_1,
        wrong_answer_2,
        wrong_answer_3,
      } = data;

      const query = `
        INSERT INTO quiz_questions
        (question, question_category, type, difficulty, correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        question,
        question_category,
        type,
        difficulty,
        correct_answer,
        wrong_answer_1,
        wrong_answer_2,
        wrong_answer_3,
      ];

      // Execute the INSERT query for each data entry
      await connection.query(query, values);
    }

    connection.release();

    res.status(201).json({ message: "Quiz questions added successfully" });
  } catch (error) {
    console.error("Error adding quiz questions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET route to fetch a single quiz question by ID
app.get("/quiz/:questionId", async (req, res) => {
  try {
    const questionId = req.params.questionId; // Get the question ID from the URL parameter

    const connection = await pool.getConnection();

    // Query to fetch a single quiz question by ID
    const [rows] = await connection.query(
      "SELECT * FROM quiz_questions WHERE id = ?",
      [questionId]
    );

    connection.release();

    // Check if a question with the specified ID exists
    if (rows.length === 0) {
      res.status(404).json({ error: "Question not found" });
    } else {
      res.json(rows[0]); // Return the question data
    }
  } catch (error) {
    console.error("Error fetching quiz question by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET route to fetch all quiz questions
app.get("/quiz", async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Query to fetch all quiz questions
    const [rows] = await connection.query("SELECT * FROM quiz_questions");

    connection.release();

    res.json(rows); // Return the list of questions
  } catch (error) {
    console.error("Error fetching all quiz questions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE route to delete a single quiz question by ID
app.delete("/quiz/:questionId", async (req, res) => {
  try {
    const questionId = req.params.questionId; // Get the question ID from the URL parameter

    const connection = await pool.getConnection();

    // Check if the question with the specified ID exists
    const [existingQuestion] = await connection.query(
      "SELECT * FROM quiz_questions WHERE id = ?",
      [questionId]
    );

    if (existingQuestion.length === 0) {
      connection.release();
      return res.status(404).json({ error: "Question not found" });
    }

    // Delete the question with the specified ID
    await connection.query("DELETE FROM quiz_questions WHERE id = ?", [
      questionId,
    ]);

    connection.release();

    res.json({ message: "Quiz question deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz question by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE route to delete all quiz questions
app.delete("/quiz", async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Execute an SQL query to delete all quiz questions
    await connection.query("DELETE FROM quiz_questions");

    connection.release();

    res.json({ message: "All quiz questions deleted successfully" });
  } catch (error) {
    console.error("Error deleting all quiz questions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});

// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "Aa123456@#",
//   database: "quiz",
// });

// db.connect((err) => {
//   if (err) {
//     console.error("error connecting: " + err.stack);
//     return;
//   }
//   console.log("connected as id " + db.threadId);
// });

// const pool = mysql.createPool({
//   connectionLimit: 10, // Maximum number of connections in the pool
//   host: "localhost",
//   user: "root",
//   password: "Aa123456@#",
//   database: "quiz",
// });

// // To use a connection from the pool
// pool.getConnection((err, connection) => {
//   if (err) throw err;
//   console.log("Connected to MySQL database");

//   // Use the connection for database operations

//   // Release the connection back to the pool when done
//   connection.release();
// });
