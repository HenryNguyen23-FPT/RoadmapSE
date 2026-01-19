// Import required built-in and third-party modules
const express = require("express"); // Web framework for NodeJS
const fs = require("fs");           // File System module to work with files
const cors = require("cors");       // Cross-Origin Resource Sharing (allows frontend to talk to backend)

const app = express();
const PORT = 3000;

// Middleware configuration
app.use(cors());            // Enable CORS for all routes
app.use(express.json());    // Enable Express to parse JSON bodies from incoming requests

// Define the POST endpoint for /feedback
app.post("/feedback", (req, res) => {
    const data = req.body; // Extract the data sent from the frontend

    let existing = [];
    
    // Check if the database file (JSON) already exists
    if (fs.existsSync("data/feedback.json")) {
        const raw = fs.readFileSync("data/feedback.json", "utf8"); // Read file content as string
        if (raw) existing = JSON.parse(raw); // Convert string back to JS array if not empty
    }

    // Add new feedback entry with a timestamp
    existing.push({
        ...data,
        time: new Date().toISOString() // Standardized time format
    });

    // Write the updated array back to the file with 2-space indentation for readability
    fs.writeFileSync("data/feedback.json", JSON.stringify(existing, null, 2));

    // Send a success response back to the client
    res.json({ success: true });
});

// Start the server and listen on the specified port
app.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}`)
);