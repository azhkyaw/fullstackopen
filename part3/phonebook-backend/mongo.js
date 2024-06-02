const mongoose = require("mongoose");

let mode;
if (process.argv.length === 3) {
  mode = "display";
} else if (process.argv.length === 5) {
  mode = "create";
} else {
  console.log(
    "please pass database password, name and phone number as arguments"
  );
  process.exit();
}

const dbPassword = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://fullstackopenuser:${dbPassword}@part3.jq9eyng.mongodb.net/personApp?retryWrites=true&w=majority&appName=part3`;

mongoose.set("strictQuery", false);

mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

const person = new Person({
  name,
  number,
});

if (mode === "create") {
  person.save().then((result) => {
    console.log(`added ${result.name} number ${result.number} to phonebook`);
    mongoose.connection.close();
  });
} else {
  Person.find({}).then((result) => {
    result.forEach((person) => {
      console.log(person.name, person.number);
    });
    mongoose.connection.close();
  });
}
