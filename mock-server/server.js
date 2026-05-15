const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const users = require('./data/users.json')
const dashboardData = require('./data/dashboard.json')

const app = express()
const SECRET = 'facturation-dev-secret-2026'
const PORT = 3000

app.use(cors({ origin: 'http://localhost:4200' }))
app.use(express.json())

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  const user = users.find(u => u.email === email && u.password === password)
  if (!user) {
    return res.status(401).json({ message: 'Email ou mot de passe incorrect' })
  }
  const { password: _pw, ...userPayload } = user
  const token = jwt.sign(userPayload, SECRET, { expiresIn: '8h' })
  res.json({ token })
})

app.get('/api/dashboard/summary', (req, res) => {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Non autorisé' })
  }
  try {
    jwt.verify(auth.split(' ')[1], SECRET)
    res.json(dashboardData)
  } catch {
    res.status(401).json({ message: 'Token invalide ou expiré' })
  }
})

app.listen(PORT, () => console.log(`Mock server running on http://localhost:${PORT}`))
