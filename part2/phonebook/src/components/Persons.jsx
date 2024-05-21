const Persons = ({ persons, handleDelete }) =>
  persons.map((person) => (
    <div key={person.id}>
      {person.name} {person.number}
      <button onClick={() => handleDelete(person.id, person.name)}>
        Delete
      </button>
    </div>
  ));

export default Persons;
