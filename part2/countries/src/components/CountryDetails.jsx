const CountryDetails = ({ country }) => (
  <div>
    <h1>{country.name.common}</h1>
    <div>capital {country.capital[0]}</div>
    <div>area {country.area}</div>

    <h3>Languages</h3>
    <ul>
      {Object.keys(country.languages).map((key) => (
        <li key={key}>{country.languages[key]}</li>
      ))}
    </ul>

    <img
      style={{ width: 150 }}
      src={country.flags.svg}
      alt={country.flags.alt}
    />
  </div>
);
export default CountryDetails;
