const express = require('express')
const app = express();
const http = require('http').Server(app)
const path = require('path')
require('dotenv').config();

const io = require('socket.io')(http)

const uri = process.env.MONGODB_URI
const port = process.env.port || 5000

const Pin = require('./Pin')

const mongoose = require('mongoose')


mongoose.connect(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
})

http.listen(port, () => {
    console.log('listening on port: ' + port)
})

io.on('connection', (socket) => {
    console.log("User has connected.")
    Pin.find().sort({createdAt: -1}).limit(30).exec((err, pins) => {
        if (err) return console.log(err)

        socket.emit('init', pins)
    })

    socket.on("iosConnect", function(data) {
        console.log("iOS Data: ", data)

        socket.emit('iOS Client Port', {msg: 'ioS CLIENT'})
    })

    socket.on('pin', (pn) => {
        const pin = new Pin({
            content: pn.content,
            title: pn.title,
            creator: pn.createdAt,
        })

        pin.save((err) => {
            if (err) return console.error(err)
        })

        socket.broadcast.emit('push', pn)
    })
})

