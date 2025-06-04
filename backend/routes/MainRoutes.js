const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Import all controllers
// User Controllers
const { createUser } = require('../controllers/insert/userInsert');
const { getAllUsers, getUserById } = require('../controllers/read/userRead');
const { updateUser } = require('../controllers/update/userUpdate');
const { deleteUser } = require('../controllers/delete/userDelete');

// Auth Controller
const { login } = require('../controllers/auth/authController');

// Room Controllers
const { createRoom } = require('../controllers/insert/roomInsert');
const { getAllRooms, getRoomById } = require('../controllers/read/roomRead');
const { updateRoom } = require('../controllers/update/roomUpdate');
const { deleteRoom } = require('../controllers/delete/roomDelete');

// Vehicle Controllers
const { createVehicle } = require('../controllers/insert/vehicleInsert');
const { getAllVehicles, getVehicleById } = require('../controllers/read/vehicleRead');
const { updateVehicle } = require('../controllers/update/vehicleUpdate');
const { deleteVehicle } = require('../controllers/delete/vehicleDelete');

// Guide Controllers
const { createGuide } = require('../controllers/insert/guideInsert');
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

// ==================== User Routes ====================
router.post('/users', createUser);      
router.get('/users', auth, getAllUsers);     
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

module.exports = router;
