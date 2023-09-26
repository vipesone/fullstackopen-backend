const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())

// Create custom token for morgan.
morgan.token('request-body', function (request, response) {
  if (request.method == 'POST' && request.body) {
    return JSON.stringify(request.body)
  }
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :request-body'))

let persons = [
  {
    "name": "Arto Hellas",
    "number": "040-123456",
    "id": 1
  },
  {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": 2
  },
  {
    "name": "Dan Abramov",
    "number": "12-43-234345",
    "id": 3
  },
  {
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
    "id": 4
  }
]

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)

  const person = persons.find((person) => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)

  persons = persons.filter((person) => person.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  // Make sure user has given name and number input.
  if (!request.body.name) {
    return response.status(400).json({
      error: 'Person should have a name'
    }).end()
  } else if (!request.body.number) {
    return response.status(400).json({
      error: 'Person should have a phone number'
    }).end()
  }

  const existingPerson = persons.find((person) => person.name == request.body.name)

  // Make sure name is kept unique in the phonebook.
  if (existingPerson) {
    return response.status(400).json({
      error: 'Person is already in the phonebook'
    }).end()
  }

  persons.push({
    name: request.body.name,
    number: request.body.number,
    id: Math.floor(Math.random() * 10000)
  });

  return response.status(200).json({
    name: request.body.name,
    number: request.body.number,
    message: 'Person added successfully'
  }).end()
})

app.get('/info', (request, response) => {
  response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date().toString()}</p>
  `)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
