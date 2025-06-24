const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadImage, uploadMultipleImages } = require('../controllers/upload/imageUploadController');
const bookingRead = require('../controllers/read/bookingRead');
const bookingUpdate = require('../controllers/update/bookingUpdate');
const Booking = require('../models/bookingModel');

// Import all controllers
// User Controllers
const { createUser } = require('../controllers/insert/userInsert');
const { getAllUsers, getUserById, getCurrentUser, getUserEarnings, getUserEarningsHistory } = require('../controllers/read/userRead');
const { updateUser, updateCurrentUser } = require('../controllers/update/userUpdate');
const { deleteUser } = require('../controllers/delete/userDelete');

// Auth Controller
const { login } = require('../controllers/auth/authController');

// Room Controllers
const { createRoom, addRoomRating } = require('../controllers/insert/roomInsert');
const { getAllRooms, getRoomById } = require('../controllers/read/roomRead');
const { updateRoom } = require('../controllers/update/roomUpdate');
const { deleteRoom } = require('../controllers/delete/roomDelete');

// Vehicle Controllers
const { createVehicle, addVehicleRating } = require('../controllers/insert/vehicleInsert');
const { getAllVehicles, getVehicleById } = require('../controllers/read/vehicleRead');
const { updateVehicle } = require('../controllers/update/vehicleUpdate');
const { deleteVehicle } = require('../controllers/delete/vehicleDelete');

// Guide Controllers
const { createGuide, addGuideRating } = require('../controllers/insert/guideInsert');
const { getAllGuides, getGuideById } = require('../controllers/read/guideRead');
const { updateGuide } = require('../controllers/update/guideUpdate');
const { deleteGuide } = require('../controllers/delete/guideDelete');

// Import admin controllers
const { createAdminRoom } = require('../controllers/insert/adminRoomInsert');
const { createAdminVehicle } = require('../controllers/insert/adminVehicleInsert');
const { getAllAdminRooms, getAdminRoomById } = require('../controllers/read/adminRoomRead');
const { getAllAdminVehicles, getAdminVehicleById } = require('../controllers/read/adminVehicleRead');
const { updateAdminRoom } = require('../controllers/update/adminRoomUpdate');
const { updateAdminVehicle } = require('../controllers/update/adminVehicleUpdate');
const { deleteAdminRoom } = require('../controllers/delete/adminRoomDelete');
const { deleteAdminVehicle } = require('../controllers/delete/adminVehicleDelete');

// Booking Controllers
const { createBooking } = require('../controllers/insert/bookingInsert');

// ==================== User Routes ====================
router.post('/users', createUser);      
router.get('/users', auth, getAllUsers);     
router.get('/users/me', auth, getCurrentUser);
router.get('/users/me/earnings', auth, getUserEarnings);
router.get('/users/me/earnings/history', auth, getUserEarningsHistory);
router.put('/users/me', auth, updateCurrentUser);
router.get('/users/:id', auth, getUserById);          
router.put('/users/:id', auth, updateUser);      
router.delete('/users/:id', auth, deleteUser);       

// ==================== Room Routes ====================
router.post('/rooms', auth, createRoom);              
router.get('/rooms', getAllRooms);                   
router.get('/rooms/:id', getRoomById);               
router.put('/rooms/:id', auth, updateRoom);    
router.delete('/rooms/:id', auth, deleteRoom);

// ==================== Vehicle Routes ====================

router.post('/vehicles', auth, createVehicle);        
router.get('/vehicles', getAllVehicles);              
router.get('/vehicles/:id', getVehicleById);          
router.put('/vehicles/:id', auth, updateVehicle);   
router.delete('/vehicles/:id', auth, deleteVehicle);

// ==================== Booking Routes ====================
router.post('/bookings', auth, createBooking);
router.get('/bookings/all', auth, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .populate('listing', 'title images pricePerNight pricePerDay')
      .populate('owner', 'name email phone')
      .populate('booker', 'name email phone');
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});
router.get('/bookings/user', auth, bookingRead.getUserBookings);
router.get('/bookings/owner', auth, bookingRead.getOwnerBookings);
router.get('/bookings/:id', auth, bookingRead.getBookingById);
router.patch('/bookings/:id/status', auth, bookingUpdate.updateBookingStatus);
router.post('/bookings/:id/cancel', auth, bookingUpdate.cancelBooking);

// ==================== Guide Routes ===================
router.post('/guides', auth, createGuide);            
router.get('/guides', getAllGuides);                  
router.get('/guides/:id', getGuideById);              
router.put('/guides/:id', auth, updateGuide);   
router.delete('/guides/:id', auth, deleteGuide);

// ==================== Admin Routes ====================
// Admin Room Routes
router.post('/admin/rooms', auth, createAdminRoom);
router.get('/admin/rooms', auth, getAllAdminRooms);
router.get('/admin/rooms/:id', auth, getAdminRoomById);
router.put('/admin/rooms/:id', auth, updateAdminRoom);
router.delete('/admin/rooms/:id', auth, deleteAdminRoom);

// Admin Vehicle Routes
router.post('/admin/vehicles', auth, createAdminVehicle);
router.get('/admin/vehicles', auth, getAllAdminVehicles);
router.get('/admin/vehicles/:id', auth, getAdminVehicleById);
router.put('/admin/vehicles/:id', auth, updateAdminVehicle);
router.delete('/admin/vehicles/:id', auth, deleteAdminVehicle);

// ==================== Auth Routes ====================
router.post('/auth/login', login);  

// ==================== Image Upload Routes ====================
router.post('/upload/image', auth, upload.single('image'), uploadImage);
router.post('/upload/images', auth, upload.array('images', 10), uploadMultipleImages);

// ==================== Rating Routes ====================
router.post('/rooms/:id/ratings', auth, addRoomRating);
router.post('/vehicles/:id/ratings', auth, addVehicleRating);
router.post('/guides/:id/ratings', auth, addGuideRating);

module.exports = router;
