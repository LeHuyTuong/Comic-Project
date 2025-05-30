const mongoose = require('mongoose');

const ChapterSchema = new mongoose.Schema({
    story: { // Reference to the parent story
        type: mongoose.Schema.ObjectId,
        ref: 'Story',
        required: true
    },
    title: { // E.g., "Chapter 1: The Beginning"
        type: String,
        required: [true, 'Please add a chapter title'],
        trim: true
    },
    chapterNumber: { // Numerical order of the chapter
        type: Number,
        required: [true, 'Please add a chapter number']
    },
    pages: { // Array of URLs to chapter images
        type: [String],
        default: []
    },
    // content can be images (pages) or text, depending on your needs
    // If text: content: { type: String }
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Middleware to update 'updatedAt' field before saving
ChapterSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Ensure chapterNumber is unique within the same story
ChapterSchema.index({ story: 1, chapterNumber: 1 }, { unique: true });

module.exports = mongoose.model('Chapter', ChapterSchema);