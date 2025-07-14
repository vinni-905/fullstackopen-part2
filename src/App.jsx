import React, { useState, useEffect } from 'react'
import personService from './services/persons'
import countriesService from './services/countries'
import weatherService from './services/weather'

// Notification Component
const Notification = ({ message, type }) => {
  if (!message) return null

  const style = {
    color: type === 'error' ? 'red' : 'green',
    background: 'lightgrey',
    fontSize: 20,
    border: `2px solid ${type === 'error' ? 'red' : 'green'}`,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  }

  return <div style={style}>{message}</div>
}

// Footer Component
const Footer = () => (
  <div style={{ color: 'green', fontStyle: 'italic', marginTop: 20, borderTop: '1px solid green', paddingTop: 10 }}>
    <em>Fullstack Open 2025 - Phonebook & Country Info App</em>
  </div>
)

// Phonebook Component
const Phonebook = ({ persons, setPersons, showNotification }) => {
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')

  const addPerson = (event) => {
    event.preventDefault()
    const existing = persons.find((p) => p.name.toLowerCase() === newName.toLowerCase())

    if (existing) {
      if (window.confirm(`${existing.name} is already added. Replace the old number?`)) {
        const updated = { ...existing, number: newNumber }
        personService
          .update(existing.id, updated)
          .then((returned) => {
            setPersons(persons.map((p) => p.id !== existing.id ? p : returned))
            showNotification(`Updated ${returned.name}`, 'success')
            setNewName('')
            setNewNumber('')
          })
          .catch(() => {
            showNotification(`Info of ${existing.name} was already removed from server`, 'error')
            setPersons(persons.filter((p) => p.id !== existing.id))
          })
      }
    } else {
      const newPerson = { name: newName, number: newNumber }
      personService
        .create(newPerson)
        .then((returned) => {
          setPersons(persons.concat(returned))
          showNotification(`Added ${returned.name}`, 'success')
          setNewName('')
          setNewNumber('')
        })
        .catch(() => showNotification('Failed to add person', 'error'))
    }
  }

  const handleDelete = (id) => {
    const person = persons.find((p) => p.id === id)
    if (window.confirm(`Delete ${person.name}?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter((p) => p.id !== id))
          showNotification(`Deleted ${person.name}`, 'success')
        })
        .catch(() => {
          showNotification(`Info of ${person.name} was already removed from server`, 'error')
          setPersons(persons.filter((p) => p.id !== id))
        })
    }
  }

  const personsToShow = Array.isArray(persons)
    ? (filter ? persons.filter((p) => p.name.toLowerCase().includes(filter.toLowerCase())) : persons)
    : []

  return (
    <div>
      <h2>Phonebook</h2>
      <div>
        Filter: <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      </div>
      <h3>Add a new</h3>
      <form onSubmit={addPerson}>
        <div>Name: <input value={newName} onChange={(e) => setNewName(e.target.value)} required /></div>
        <div>Number: <input value={newNumber} onChange={(e) => setNewNumber(e.target.value)} required /></div>
        <button type="submit">Add</button>
      </form>
      <h3>Numbers</h3>
      <ul>
        {personsToShow.map((p) => (
          <li key={p.id}>{p.name} {p.number} <button onClick={() => handleDelete(p.id)}>delete</button></li>
        ))}
      </ul>
    </div>
  )
}

// Country Details + Weather Component
const CountryDetails = ({ country }) => {
  const [weather, setWeather] = useState(null)
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY

  useEffect(() => {
    if (country && country.capital && apiKey) {
      weatherService
        .getWeather(country.capital[0], apiKey)
        .then((data) => setWeather(data))
        .catch(() => setWeather(null))
    }
  }, [country, apiKey])

  if (!country) return null

  return (
    <div>
      <h3>{country.name.common}</h3>
      <p>Capital: {country.capital?.[0]}</p>
      <p>Area: {country.area} km²</p>
      <h4>Languages:</h4>
      <ul>
        {Object.values(country.languages || {}).map((lang) => <li key={lang}>{lang}</li>)}
      </ul>
      <img src={country.flags.png} alt="flag" width="150" />
      {weather ? (
        <div>
          <h4>Weather in {country.capital[0]}</h4>
          <p>Temperature: {weather.temperature} °C</p>
          <img src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt={weather.description} />
          <p>Wind: {weather.wind} m/s</p>
        </div>
      ) : (
        <p>Loading weather...</p>
      )}
    </div>
  )
}

// Country Search & Display Component
const Countries = () => {
  const [countries, setCountries] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    countriesService
      .getAll()
      .then((data) => setCountries(data))
      .catch(() => console.error('Failed to load countries'))
  }, [])

  const filtered = search
    ? countries.filter((c) => c.name.common.toLowerCase().includes(search.toLowerCase()))
    : []

  return (
    <div>
      <h2>Country Info</h2>
      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setSelected(null)
        }}
      />
      {filtered.length > 10 && <p>Too many matches, refine your search</p>}
      {filtered.length > 1 && filtered.length <= 10 && (
        <ul>
          {filtered.map((c) => (
            <li key={c.cca3}>
              {c.name.common} <button onClick={() => setSelected(c)}>show</button>
            </li>
          ))}
        </ul>
      )}
      {filtered.length === 1 && <CountryDetails country={filtered[0]} />}
      {selected && <CountryDetails country={selected} />}
    </div>
  )
}

// Main App Component
const App = () => {
  const [persons, setPersons] = useState([])
  const [notification, setNotification] = useState({ message: null, type: null })

  useEffect(() => {
    personService
      .getAll()
      .then((data) => setPersons(data))
      .catch(() =>
        setNotification({ message: 'Failed to load phonebook', type: 'error' })
      )
  }, [])

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification({ message: null, type: null }), 5000)
  }

  return (
    <div>
      <Notification message={notification.message} type={notification.type} />
      <Phonebook persons={persons} setPersons={setPersons} showNotification={showNotification} />
      <Countries />
      <Footer />
    </div>
  )
}

export default App
