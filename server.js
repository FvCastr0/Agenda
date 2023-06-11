require('dotenv').config()
const express = require('express');
const app = express();
const { mongoose } = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const csrf = require('csurf')

mongoose.connect(process.env.CONNECTIONSTRING, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.emit('pronto');
        console.log('Conectado a base de dados');
    })
    .catch((err) => { console.log('Erro: ', err.message) });

const routes = require('./routes')
const path = require('path')
const { middlewareGlobal, checkCsrfError, csrfMiddleware } = require('./src/middlewares/middleware')
app.use(helmet())

app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.resolve(__dirname, 'public')))

const sessionOptions = session({
    secret: 'não conta pra ninguem',
    store: MongoStore.create({ mongoUrl: process.env.CONNECTIONSTRING }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
});
app.use(sessionOptions);
app.use(flash());
app.set('views', path.resolve(__dirname, 'src', 'views'))
app.set('view engine', 'ejs')

app.use(csrf())
app.use(csrfMiddleware)
app.use(checkCsrfError)
app.use(middlewareGlobal)
app.use(routes)

app.on('pronto', () => {
    app.listen(8180, () => {
        console.log('servidor executando na porta http://localhost:8180');
    })
})