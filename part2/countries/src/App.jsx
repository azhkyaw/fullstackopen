import { useEffect, useState } from "react";
import countryService from "./services/countryService";
import weatherService from "./services/weatherService";
import CountryList from "./components/CountryList";
import CountryDetails from "./components/CountryDetails";
import CapitalWeather from "./components/CapitalWeather";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [countryList, setCountryList] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [capitalWeather, setCapitalWeather] = useState(null);

  useEffect(() => {
    countryService.getAll().then((countries) => {
      setCountryList(countries);
    });
  }, []);

  useEffect(() => {
    if (!selectedCountry) {
      return;
    }

    weatherService
      .getCurrentWeather(
        selectedCountry.capitalInfo.latlng[0],
        selectedCountry.capitalInfo.latlng[1]
      )
      .then((weather) => {
        setCapitalWeather(weather);
      });
  }, [selectedCountry]);

  const handleSearchTermChange = (e) => {
    {
      const searchTerm = e.target.value;
      setSearchTerm(searchTerm);

      const matchedCountries = countryList.filter((country) =>
        country.name.common.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setCapitalWeather(null);

      matchedCountries.length === 1
        ? setSelectedCountry({ ...matchedCountries[0] })
        : setSelectedCountry(null);
    }
  };

  const matchedCountries = countryList.filter((country) =>
    country.name.common.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div>
        find countries
        <input value={searchTerm} onChange={handleSearchTermChange}></input>
      </div>
      {searchTerm && (
        <div>
          {matchedCountries.length > 10 ? (
            <div>Too many matches, specify another filter</div>
          ) : (
            !selectedCountry && (
              <CountryList
                countries={matchedCountries}
                onClick={setSelectedCountry}
              />
            )
          )}
          {selectedCountry && <CountryDetails country={selectedCountry} />}
          {capitalWeather && (
            <CapitalWeather
              capital={selectedCountry.capital}
              weather={capitalWeather}
            />
          )}
        </div>
      )}
    </>
  );
}

export default App;
