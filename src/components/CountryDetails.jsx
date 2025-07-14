import Weather from '.weather'

const CountryDetails = ({ country }) => {
  if (!country) return null

  const languages = Object.values(country.languages)

  return (
    <div>
      <h2>{country.name.common}</h2>
      <p><strong>Capital:</strong> {country.capital[0]}</p>
      <p><strong>Area:</strong> {country.area}</p>

      <h3>Languages:</h3>
      <ul>
        {languages.map(lang => (
          <li key={lang}>{lang}</li>
        ))}
      </ul>

      <img src={country.flags.png} alt={`Flag of ${country.name.common}`} width="150" />

      {/* ✅ Weather component for capital */}
      <Weather capital={country.capital[0]} />
    </div>
  )
}

export default CountryDetails
