const express = require('express');
const path = require('path');
const mongoose = require('mongoose'); // 1. Import Mongoose

const app = express();
const PORT = process.env.PORT || 3000;

// 2. Connect to MongoDB Atlas using your Render Environment Variable
const mongoURI = process.env.MONGO_URI;
// 2. Optimized Connection Flow
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error("❌ ERROR: MONGO_URI environment variable is missing completely in Render!");
} else {
    console.log("⏳ ATTEMPTING CONNECTION: Connecting to MongoDB Atlas...");
    
    mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000 // Force an explicit error if it can't connect within 5 seconds
    })
    .then(() => {
        console.log("🚀 Successfully connected to MongoDB Atlas!");
    })
    .catch(err => {
        console.error("❌ DRASITC CONNECTION FAILURE:", err.message);
    });
}
// 3. Define the Blueprint (Schema) for your Feedback
const feedbackSchema = new mongoose.Schema({
    name: String,
    phone: String,
    email: String,
    date: String,
    gender: String,
    rating: String,
    cuisine: String,
    likes: String,
    suggestions: String
});

// Create the Model (This creates a collection called 'feedbacks' automatically)
const Feedback = mongoose.model('Feedback', feedbackSchema);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static assets from your main folder and image directories
app.use(express.static(path.join(__dirname, 'CuisineFinder')));
app.use(express.static(path.join(__dirname, 'CuisineFinder', 'images')));

app.get('/', (req, res) => {
    // Automatically loads your reviews.html form page
    res.sendFile(path.join(__dirname, 'CuisineFinder', 'reviews.html')); 
});

// Route: Handle form submissions and save to MongoDB
app.post('/submit-feedback', async (req, res) => {
    try {
        const { customerName, phone, email, submissionDate, gender, rating, cuisine, likes, suggestions } = req.body;

        // Map multi-select checkbox arrays cleanly to a string text format
        const likesText = Array.isArray(likes) ? likes.join(', ') : (likes || 'None');

        // Create a new document instance using our Mongoose Model
        const newReview = new Feedback({
            name: customerName,
            phone: phone,
            email: email,
            date: submissionDate,
            gender: gender,
            rating: rating,
            cuisine: cuisine,
            likes: likesText,
            suggestions: suggestions ? suggestions.trim() : ""
        });

        // 4. Save the document directly into MongoDB Atlas
        await newReview.save();
        console.log("📝 New feedback saved to MongoDB!");

        // Seamlessly redirects the user back to your home page layout
        res.redirect('/home.html');

    } catch (error) {
        console.error("Error saving to database:", error);
        res.status(500).send('An unexpected database error occurred while saving.');
    }
});

app.listen(PORT, () => {
    console.log(`CuisineFinder Server running at: http://localhost:${PORT}`);
});