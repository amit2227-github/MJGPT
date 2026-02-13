import express from 'express'
import 'dotenv/config'
import cors from 'cors'

const app= express()

//Middleware
app.use(cors())
app.use(express.json())

//Rotues
app.get('/', (req,res)=>res.send('Server is working')) 

const PORT = process.env.PORT || 3000

app.listen(PORT, () =>{
    console.log("well done bro")
})