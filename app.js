const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

require('./helpers/logger')(app)
require('./helpers/storage')(app, express)

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
require('./helpers/headers')(app)
require('./routes')(app)
require('./helpers/error')(app)

require('./utils/mailListener')
require('./helpers/connection')(app)
