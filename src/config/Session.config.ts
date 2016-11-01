import * as session from 'express-session'

export let config = session({
    secret: 'KitCat',
    resave: false,
    saveUninitialized: true,
    rolling: false,
    cookie: {
        maxAge: 20000,
        secure: false,
        httpOnly: true,
    }
})
