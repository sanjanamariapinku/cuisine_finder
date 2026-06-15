const express = require('express');
const path = require('path');
const mongoose = require('mongoose'); 

const app = express();
const PORT = process.env.PORT || 3000;


const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error("❌ ERROR: MONGO_URI environment variable is missing completely in Render!");
} else {
    console.log("⏳ ATTEMPTING CONNECTION: Connecting to MongoDB Atlas...");
    
    mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000 
    })
    .then(() => {
        console.log("🚀 Successfully connected to MongoDB Atlas!");
    })
    .catch(err => {
        console.error("❌ DRASTIC CONNECTION FAILURE:", err.message);
    });
} 


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

const Feedback = mongoose.model('Feedback', feedbackSchema);


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'CuisineFinder')));
app.use(express.static(path.join(__dirname, 'CuisineFinder', 'images')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'CuisineFinder', 'reviews.html')); 
});

app.post('/submit-feedback', async (req, res) => {
    try {
        const { customerName, phone, email, submissionDate, gender, rating, cuisine, likes, suggestions } = req.body;
        
        const likesText = Array.isArray(likes) ? likes.join(', ') : (likes || 'None');
        
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
        
        await newReview.save();
        console.log("📝 New feedback saved to MongoDB!");
        res.redirect('/home.html');

    } catch (error) {
        console.error("Error saving to database:", error);
        res.status(500).send('An unexpected database error occurred while saving.');
    }
});

app.listen(PORT, () => {
    console.log(`CuisineFinder Server running at: http://localhost:${PORT}`);
});