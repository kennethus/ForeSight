const express = require('express')
const {
    createFeatures,
    getFeatureByUser,
    updateFeature
} = require('../controllers/featureController')
const { authenticate } = require('../middlewares/authMiddleware')
const router = express.Router()

router.post('/', authenticate, createFeatures)
router.get('/', authenticate, getFeatureByUser)
router.patch('/:id', authenticate, updateFeature)

module.exports = router