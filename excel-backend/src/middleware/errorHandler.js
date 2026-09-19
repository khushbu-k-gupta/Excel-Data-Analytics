export const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Multer: file too large
  if (err.name === 'MulterError' && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Max 10MB allowed.' });
  }
  // Mongoose validation
  if (err.name === 'ValidationError') {
    const msg = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ message: msg });
  }
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
};