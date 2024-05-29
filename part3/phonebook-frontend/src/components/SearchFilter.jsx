const SearchFilter = ({ setSearchTerm }) => (
  <div>
    filter shown with
    <input onChange={(e) => setSearchTerm(e.target.value)} />
  </div>
);

export default SearchFilter;
