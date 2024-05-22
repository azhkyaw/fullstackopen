const CountryList = ({ countries, onClick }) =>
  countries.map((c) => (
    <div key={c.name.common}>
      {c.name.common}
      <button onClick={() => onClick(c)}>show</button>
    </div>
  ));

export default CountryList;
