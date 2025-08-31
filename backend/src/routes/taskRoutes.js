const express = require('express');
const router = express.Router();
const taskctrl = require('../controllers/taskController');

// CRUD + Search/Filter
router.get('/tasks', taskctrl.getTasks);
router.get('/tasks/:id', taskctrl.getTaskById);
router.post('/tasks', taskctrl.createTask);
router.patch('/tasks/:id', taskctrl.updateTask);
router.delete('/tasks/:id', taskctrl.deleteTask);

module.exports = router;
