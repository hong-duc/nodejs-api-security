import * as session from 'express-session'

export let config = session({
    secret: 'KitCat',
    resave: false,
    saveUninitialized: true,
    rolling: false,
    cookie: {
        maxAge: 30000,
        secure: false,
        httpOnly: true,
    }
})
