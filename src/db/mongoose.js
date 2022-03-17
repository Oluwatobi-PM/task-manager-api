const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser:true,
    UseCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})


