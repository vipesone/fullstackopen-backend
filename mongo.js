const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://moldilocks:${password}@cluster0.6k4ggj1.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length == 3) {
  Person.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
} else if (process.argv.length == 4) {
  console.log('Phone number is missing')
  process.exit(1)
} else {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
  })

  person.save().then(result => {
    console.log('Person saved!')
    mongoose.connection.close()
  })
}
