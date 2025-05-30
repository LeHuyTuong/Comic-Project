const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        unique: true,
    },
    author: {
        type: String,
        trim: true,
        default: 'Updating...'
    },
    genres: {
        type: [String],
        default: []
    },
    description: {
        type: String,
        default: 'No description available.'
    },
    coverImage: { // URL to the cover image
        type: String,
        default: 'default_cover.jpg' // Provide a default placeholder
    },
    status: {
        type: String,
        enum: ['ongoing', 'completed', 'hiatus'],
        default: 'ongoing'
    },
    views: {
        type: Number,
        default: 0
    },
    rating: { // Average rating
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    // We can populate chapters from the Chapter model using the story field
    // Or keep a list of chapter IDs here if preferred, but it might lead to larger documents
    // For now, let's rely on querying chapters by story ID.
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Automatically manages createdAt and updatedAt
});

// Middleware to update 'updatedAt' field before saving
StorySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Story', StorySchema);