import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import leaguesRouter from './routes/leagues.js'
import teamsRouter from './routes/teams.js'
import schemaRouter from './routes/schema.js'
import seasonRouter from './routes/seasons.js'

const app = express()

// Rate limiting — max 100 requests per 15 minutes per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
})

app.use(limiter)

// CORS — restrict to your frontend origin in production
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost', 'http://localhost:5173']

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
}))

app.use(express.json()) // Add JSON body parser
app.use('/api/leagues', leaguesRouter)
app.use('/api/teams', teamsRouter)
app.use('/api/schema', schemaRouter)
app.use('/api/seasons', seasonRouter)

app.get('/', (req, res) => {
    console.log("Hello world");
    res.status(200).send('<h1>Hello, welcome to scorecast API🚀</h1>')
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})