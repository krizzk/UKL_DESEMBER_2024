import express from 'express'
import cors from 'cors'
import userR from './routers/userR' //buat baru
import barangR from './routers/barangR' 


const PORT: number = 8000
const app = express()
app.use(cors())

app.use(`/user`,userR)//buat baru
app.use(`/barang`,barangR)

app.listen(PORT, () => {
    console.log(`[Server]: Server is running at http://localhost:${PORT}`);
}) 