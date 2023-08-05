const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs')
const authenticateToken = require('./authenticateToken');


const app = express();
const port = 3000;

app.use(cors({
  origin: 'http://localhost:5173', //website url
  credentials: true,
}));

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const email = req.user.email; // Make sure req.user.email contains the user's email
    cb(null, email + '_photo.jpg'); // Change the filename format
  },
});

const upload = multer({ storage });

// Handle photo upload with authentication middleware
app.post('/upload', authenticateToken, upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No photo uploaded' });
  }

  const photoPath = req.file.path;
  res.json({ message: 'Photo uploaded successfully', photoPath: "http://localhost:3000/uploads/" + photoPath });
});


app.post('/photo/:email', (req, res) => {
  const email = req.params.email;
  const photoPath = path.join(__dirname, 'uploads', `${email}_photo.jpg`);

  if (fs.existsSync(photoPath)) {
    const photoData = fs.readFileSync(photoPath);
    const photoBase64 = photoData.toString('base64');
    const photoUrl = `data:image/jpeg;base64,${photoBase64}`;
  
    res.json({ photoUrl });
  } else {
    res.status(404).json({ error: 'Photo not found' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



// UPLOAD PHOTO - FRONTEND
// const handlePhotoUpload = async (e) => {
//   e.preventDefault();

//   if (!selectedPhoto) {
//     console.error('No photo selected');
//     return;
//   }

//   const formData = new FormData();
//   formData.append('photo', selectedPhoto);

//   try {
//     const response = await fetch('http://localhost:3000/upload', {
//       method: 'POST',
//       body: formData,
//       headers: {
//         'auth-token': localStorage.getItem('token')
//       }
//     });

//     const data = await response.json();
//     console.log(data);

//     if (response.ok) {
//       console.log('Photo uploaded successfully');
//     } else {
//       console.error('Failed to upload photo');
//     }
//   } catch (error) {
//     console.error('Error:', error);
//   }
// };


// GET PHOTO BY EMAIL - FRONTEND
// const handleGetPhotoByEmail = async () => {
//   try {
//     const response = await fetch('http://localhost:3000/photo/' + email, {
//       method: 'POST',
//       headers: {
//         'auth-token': localStorage.getItem('token')
//       }
//     });

//     const data = await response.json();

//     if (data.photoUrl) {
//       console.log('Photo URL:', data.photoUrl);
//     } else {
//       console.error('Photo not found');
//     }
//   } catch (error) {
//     console.error('Error:', error);
//   }
// };

