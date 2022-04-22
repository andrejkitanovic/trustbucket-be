const mongoose = require('mongoose')

const PORT = process.env.PORT || 8080

module.exports = (app) => {
    mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://localhost/trustbucket',
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )

    const server = app.listen(PORT, () => {
        console.log('Server is on PORT: ', server.address().port)
    })

    return server
}
