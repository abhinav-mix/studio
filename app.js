const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer'); // Add multer for file uploads
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// In-memory store for payments (for demonstration purposes)
const payments = {}; // { transactionId: { timestamp: Date, status: 'pending' | 'completed' | 'failed' } }

// In-memory store for UTR to account mapping (for demonstration purposes)
const utrAccounts = {}; // { utr: 'account_name' }

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Endpoint for QR payment confirmation
app.post('/confirm-qr-payment', (req, res) => {
  const { transactionId, amount, account } = req.body;

  if (!transactionId || !amount) {
    return res.status(400).json({ message: 'Missing transactionId or amount', success: false });
  }

  // Store payment with current timestamp and pending status
  payments[transactionId] = {
    timestamp: new Date(),
    status: 'pending',
    amount: amount,
    account: account || 'Unknown', // Store account information
  };

  // Also store UTR to account mapping for later verification
  // In a real implementation, this would come from the bank's API
  utrAccounts[transactionId] = account || 'Unknown';

  console.log('QR Payment Confirmation Received and Stored:');
  console.log('Transaction ID:', transactionId);
  console.log('Amount:', amount);
  console.log('Account:', account || 'Unknown');
  console.log('Stored Payments:', payments);

  res.json({ message: 'Payment initiated successfully!', success: true, transactionId: transactionId });
});

// New endpoint to check payment status and validity
app.get('/check-payment-status', (req, res) => {
  const { transactionId } = req.query;

  if (!transactionId) {
    return res.status(400).json({ message: 'Missing transactionId query parameter', valid: false });
  }

  const payment = payments[transactionId];

  if (!payment) {
    return res.status(404).json({ message: 'Payment not found', valid: false });
  }

  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

  if (payment.timestamp < twoMinutesAgo) {
    return res.json({ message: 'Payment is too old', valid: false, status: payment.status });
  } else {
    return res.json({ message: 'Payment is valid and recent', valid: true, status: payment.status });
  }
});

// New endpoint to verify UTR and check if payment was made to correct account
app.get('/verify-utr', (req, res) => {
  const { utr, account } = req.query;

  if (!utr || !account) {
    return res.status(400).json({ message: 'Missing utr or account query parameter', valid: false });
  }

  // In a real implementation, this would check with the bank's API
  // For demonstration, we'll check our in-memory store
  const paymentAccount = utrAccounts[utr];

  if (!paymentAccount) {
    return res.status(404).json({ message: 'UTR not found', valid: false });
  }

  // Check if the payment was made to the specified account
  if (paymentAccount === account) {
    // Also check if payment is recent (within 2 minutes)
    const payment = payments[utr];
    if (payment) {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      if (payment.timestamp >= twoMinutesAgo) {
        return res.json({ 
          message: 'UTR verified successfully! Payment was made to the correct account.', 
          valid: true 
        });
      } else {
        return res.json({ 
          message: 'Payment is too old (more than 2 minutes)', 
          valid: false 
        });
      }
    }
    return res.json({ 
      message: 'UTR verified successfully! Payment was made to the correct account.', 
      valid: true 
    });
  } else {
    return res.json({ 
      message: `Payment was made to ${paymentAccount}, not to ${account}`, 
      valid: false 
    });
  }
});

// New endpoint to handle payment proof upload and send to WhatsApp
app.post('/upload-payment-proof', upload.single('paymentProof'), (req, res) => {
  try {
    const { utr } = req.body;
    
    if (!utr) {
      return res.status(400).json({ message: 'Missing UTR', success: false });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded', success: false });
    }
    
    // In a real implementation, you would:
    // 1. Store the file information in a database
    // 2. Send a message to your WhatsApp number with the UTR and file link
    // 3. For now, we'll just return success
    
    const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    
    console.log('Payment proof uploaded:');
    console.log('UTR:', utr);
    console.log('File:', fileUrl);
    
    // Here you would implement the WhatsApp sending logic
    // This could be done using a WhatsApp Business API or similar service
    
    res.json({ 
      message: 'Payment proof uploaded successfully!', 
      success: true,
      fileUrl: fileUrl
    });
  } catch (error) {
    console.error('Error uploading payment proof:', error);
    res.status(500).json({ message: 'Error uploading payment proof', success: false });
  }
});

app.listen(PORT, () => {
  console.log(`QR Payment Backend server running on port ${PORT}`);
});
