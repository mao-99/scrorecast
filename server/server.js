import express from 'express'
import cors from 'cors'
import leaguesRouter from './routes/leagues.js'
import teamsRouter from './routes/teams.js'
import schemaRouter from './routes/schema.js'
import seasonRouter from './routes/seasons.js'

const app = express()

app.use(cors())
app.use(express.json()) // Add JSON body parser
app.use('/api/leagues', leaguesRouter)
app.use('/api/teams', teamsRouter)
app.use('/api/schema', schemaRouter)
app.use('/api/seasons', seasonRouter)

app.get('/', (req, res) => {
    console.log("Hello world");
    res.status(200).send('<h1>Hello, welcome to scorecast API🚀</h1>')
})

const PORT = 3001 || process.env.PORT

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})