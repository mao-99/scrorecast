import express from 'express'
import schemaController from '../controllers/schema.js'

const router = express.Router()

router.get('/', schemaController.getSchema)

export default router
