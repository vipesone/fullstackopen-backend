require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

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

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(result => {
    response.json(result)
  })
  .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id).then(result => {
    response.status(204).end()
  }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const person = {
    name: request.body.name,
    number: request.body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  // Make sure user has given name and number input.
  if (!request.body.name) {
    return response.status(400).json({
      message: 'Person should have a name'
    }).end()
  } else if (!request.body.number) {
    return response.status(400).json({
      message: 'Person should have a phone number'
    }).end()
  }

  const person = new Person({
    name: request.body.name,
    number: request.body.number
  });

  person.save().then(savedPerson => {
    response.status(200).json(savedPerson)
  })
  .catch(next)
})

app.get('/info', (request, response, next) => {
  Person.find({}).then(result => {
    response.send(`
      <p>Phonebook has info for ${result.length} people</p>
      <p>${new Date().toString()}</p>
    `)
  })
  .catch(error => next(error))

})

// Error handling.
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformed id' })
  }

  next(error)
}
app.use(errorHandler)

// Start server.
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
