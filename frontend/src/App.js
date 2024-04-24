import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css';
const API_URL = 'http://127.0.0.1:8000'; // Define the URL of your FastAPI server

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newPerson, setNewPerson] = useState({ id: null, name: '', age: 0, gender: '', bank_name: '', ifsc_code: '', account_number: '' });
  const [selectedPersonId, setSelectedPersonId] = useState(null); // Track the selected person for updating

  useEffect(() => {
    fetchData();
  }, [persons]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/search`);
      setPersons(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const addPerson = async () => {
    try {
      const response = await axios.post(`${API_URL}/addPerson`, newPerson);
      const addedPerson = response.data;
      setPersons([...persons, addedPerson]);
      setNewPerson({ id: null, name: '', age: 0, gender: '', bank_name: '', ifsc_code: '', account_number: '' });
    } catch (error) {
      console.error('Error adding person:', error);
    }
  };

  const deletePerson = async (person) => {
    try {
      console.log('Deleting person:', person);
      await axios.delete(`${API_URL}/delete/${person.id}`);
      setPersons(persons.filter(p => p.id !== person.id));
    } catch (error) {
      console.error('Error deleting person:', error);
    }
  };

  const updatePerson = async () => {
    try {
      await axios.put(`${API_URL}/changePerson/${selectedPersonId}`, newPerson);
      setPersons(persons.map(person => {
        if (person.id === selectedPersonId) {
          return newPerson; // Update person with new data
        }
        return person;
      }));
      setSelectedPersonId(null); // Reset selected person ID
      setNewPerson({ id: null, name: '', age: 0, gender: '', bank_name: '', ifsc_code: '', account_number: '' });
    } catch (error) {
      console.error('Error updating person:', error);
    }
  };


  const handleUpdateClick = (person) => {
    setNewPerson({ ...person }); // Populate the form with the selected person's details
    setSelectedPersonId(person.id);
  };

  return (
    <div>
      <h1>Person Management</h1>
      <div>
        <h2>Add New Person</h2>
        <input
          type="text"
          placeholder="Name"
          value={newPerson.name}
          onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Age"
          value={newPerson.age}
          onChange={(e) => setNewPerson({ ...newPerson, age: parseInt(e.target.value) })}
        />
        <input
          type="text"
          placeholder="Gender"
          value={newPerson.gender}
          onChange={(e) => setNewPerson({ ...newPerson, gender: e.target.value })}
        />
        <input
          type="text"
          placeholder="Bank Name"
          value={newPerson.bank_name}
          onChange={(e) => setNewPerson({ ...newPerson, bank_name: e.target.value })}
        />
        <input
          type="text"
          placeholder="IFSC Code"
          value={newPerson.ifsc_code}
          onChange={(e) => setNewPerson({ ...newPerson, ifsc_code: e.target.value })}
        />
        <input
          type="text"
          placeholder="Account Number"
          value={newPerson.account_number}
          onChange={(e) => setNewPerson({ ...newPerson, account_number: e.target.value })}
        />
        {selectedPersonId ? (
          <button onClick={updatePerson}>Update Person</button>
        ) : (
          <button onClick={addPerson}>Add Person</button>
        )}
      </div>
      <div>
        <h2>Persons</h2>
        <ul>
          {persons.map(person => (
            <li key={person.id}>
              {person.name} - {person.age} - {person.gender} - {person.bank_name} - {person.ifsc_code} - {person.account_number}
              <button onClick={() => deletePerson(person)}>Delete</button>
              <button onClick={() => handleUpdateClick(person)}>Update</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
