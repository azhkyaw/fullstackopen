import { useState, useEffect } from "react";
import { useState, useEffect } from "react";
import SearchFilter from "./components/SearchFilter";
import PersonForm from "./components/PersonForm";
import Persons from "./components/Persons";
import Notification from "./components/Notification";
import personService from "./services/personService";

const App = () => {
  const [persons, setPersons] = useState([]);
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    personService.getAll().then((initialPersons) => setPersons(initialPersons));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (persons.find((person) => person.name === newName)) {
      if (
        window.confirm(
          `${newName} is already added to phonebook, replace the old number with a new one?`
        )
      ) {
        updatePerson();
      }
    } else {
      createPerson();
    }

    setNewNumber("");
    setNewName("");
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const createPerson = () => {
    const newPerson = {
      name: newName,
      number: newNumber,
    };

    personService.create(newPerson).then((returnedPerson) => {
      setPersons(persons.concat(returnedPerson));
      setNotification({
        type: "success",
        message: `Added ${returnedPerson.name}`,
      });
    });
  };

  const updatePerson = () => {
    const updatedPerson = persons.find((person) => person.name === newName);
    updatedPerson.number = newNumber;

    personService
      .update(updatedPerson.id, updatedPerson)
      .then((returnedPerson) => {
        setPersons(
          persons.map((person) =>
            person.id === updatedPerson.id ? returnedPerson : person
          )
        );
        setNotification({
          type: "success",
          message: `Updated ${returnedPerson.name}`,
        });
      })
      .catch((error) => {
        setNotification({
          type: "error",
          message: `Information of ${updatedPerson.name} has already been removed from server`,
        });
      });
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      personService
        .deletePerson(id)
        .then(() => {
          setPersons(persons.filter((person) => person.id !== id));
        })
        .catch((error) => {
          setNotification({
            type: "error",
            message: `Information of ${name} has already been removed from server`,
          });
          setTimeout(() => {
            setNotification(null);
          }, 3000);
        });
    }
  };

  const personsToShow =
    searchTerm === ""
      ? persons
      : persons.filter((person) =>
          person.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

  return (
    <div>
      <h2>Phonebook</h2>

      <Notification notification={notification} />

      <SearchFilter setSearchTerm={setSearchTerm} />

      <h2>Add a new</h2>
      <PersonForm
        newName={newName}
        newNumber={newNumber}
        handleSubmit={handleSubmit}
        setNewName={setNewName}
        setNewNumber={setNewNumber}
      />

      <h2>Numbers</h2>
      <Persons persons={personsToShow} handleDelete={handleDelete} />
      <Persons persons={personsToShow} handleDelete={handleDelete} />
    </div>
  );
};

export default App;
