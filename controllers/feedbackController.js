const Feedback = require('../models/Feedback');

exports.submitFeedback = async (req, res) => {
  try {
    const { feedbackText } = req.body;
    
    // Validation
    if (!feedbackText || feedbackText.trim().length === 0) {
      return res.status(400).json({ message: 'Feedback text is required' });
    }
    
    if (feedbackText.length > 1000) {
      return res.status(400).json({ message: 'Feedback text must be less than 1000 characters' });
    }
    
    const feedback = await Feedback.create({ 
      userId: req.user.id, 
      feedbackText: feedbackText.trim() 
    });
    console.log(` New feedback submitted by user ${req.user.id}: ${feedbackText.substring(0, 50)}...`);
    
    res.status(201).json({ 
      message: 'Feedback submitted successfully', 
      feedback: {
        id: feedback._id,
        feedbackText: feedback.feedbackText,
        createdAt: feedback.createdAt
      }
    });
  } catch (err) {
    console.error('Submit feedback error:', err);
    res.status(500).json({ message: 'Server error while submitting feedback' });
  }
};

exports.getMyFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select('-userId');
    
    res.json({
      count: feedbacks.length,
      feedbacks
    });
  } catch (err) {
    console.error('Get feedback error:', err);
    res.status(500).json({ message: 'Server error while fetching feedback' });
  }
};
