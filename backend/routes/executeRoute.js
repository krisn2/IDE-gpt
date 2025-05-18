const {execute} = require('../controllers/executeController');

const router = require('express').Router();

router.post('/', execute);

module.exports = router;