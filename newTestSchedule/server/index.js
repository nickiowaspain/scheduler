const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const session = require('express-session');
const mongoose = require('mongoose');

app.use(session({
    secret: 'randomgarbagekeyanything',
    saveUnintialized: false,
    resave: false
}))

app.use(bodyParser.json());

mongoose.Promise = Promise;
mongoose.connect('mongodb://localhost:27017/angulardb')
.then(() => console.log('Mongoose running'))


const User = require('./models/users')

app.post('/api/quote', async (req, res) => {
    console.log(req.session.user, req.body.val)
    const user = await User.findOne({email: req.session.user})
    if(!user) {
        res.json({
            success: false,
            message: 'Invalid user'
        })
        return
    }

    await User.update({email: req.session.user}, { $set: { quote: req.body.value }})
    res.json({
        success: true
    })
})

app.post('/api/login', async (req, res) => {
    console.log('req.body',req.body)
    const {email, password} = req.body
    console.log(email, password)
    const resp = await User.findOne({email, password})
    console.log(resp)
    if(!resp) {
        console.log('incorrect details')
        res.json({
            success: false,
            message: "Incorrect details"
        })
    } else {
        res.json({
            success: true,
        })
        req.session.user = email
        req.session.save()
        console.log('logging you in')
        
        // make a session and set user to logged in
    }
})

app.get('/api/isloggedin', async (req, res) => {
    res.json({
        status: !!req.session.user
    })
})


app.post('/api/register', async (req, res) => {
    console.log(req.body)

    const {email, password} = req.body;

    const existingUser = await User.findOne({email})

    if (existingUser) {
        res.json({
            success: false,
            message: "Email already in use"
        })
    }

    const user = new User({
        email,
        password
    })

    const result = await user.save()
    console.log("result:", result)
    res.json({
        success: true,
        message: "Welcome!"
    })
})

app.get('/api/data', async (req, res) => {
    const user = await User.findOne({email: req.session.user})

    if(!user) {
        res.json({
            status: false,
            message: 'User was deleted'
        })
        return
    }


    res.send({
        status: true,
        email: req.session.user,
        quote: user.quote
    })
})


app.get('/api/logout', async (req, res) => {
    req.session.destroy();

    res.json({
        success: true
    })
})

app.listen(4201, ()=> console.log('Server listening on 4201...'));