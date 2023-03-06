"use strict";

window.addEventListener("DOMContentLoaded", start);

let allStudents = [];

const Student = {
  firstName: "-default-",
  middleName: undefined,
  nickName: undefined,
  lastName: "-default-",
  gender: "-default-",
  photo: "-default-",
  house: "-default-",
  blood: "-default-",
  prefect: false,
  squad: false,
  expelled: false,
};

function start() {
  console.log("start");
  loadJSON();
}

function loadJSON() {
  fetch("https://petlatkea.dk/2021/hogwarts/students.json")
    .then((response) => response.json())
    .then((jsonData) => {
      // when loaded, prepare objects
      cleanObjects(jsonData);
    });
}

function cleanObjects(objects) {
  allStudents = objects.map(cleanObject);

  prepareObjects(allStudents);
}

function cleanObject(object) {
  object["fullname"] = capitalize(object["fullname"].trim());
  object["gender"] = capitalize(object["gender"].trim());
  object["house"] = capitalize(object["house"].trim());

  function capitalize(string) {
    let capitalized = string[0].toUpperCase();

    for (let i = 1; i < string.length; i++) {
      if (string[i - 1] === " " || string[i - 1] === "-") {
        capitalized += string[i].toUpperCase();
      } else {
        capitalized += string[i].toLowerCase();
      }
    }
    return capitalized;
  }
  return object;
}

function prepareObjects(objects) {
  allStudents = objects.map(prepareObject);
}

function prepareObject(object) {
  const fullname = object["fullname"];
  const firstSpace = fullname.indexOf(" ");
  const lastSpace = fullname.lastIndexOf(" ");

  const student = Object.create(Student);

  student.firstName = fullname.substring(0, firstSpace);
  student.middleName = undefined;
  student.nickName = undefined;
  student.lastName = fullname.substring(lastSpace + 1);
  student.gender = object["gender"];
  student.photo = "";
  student.house = object["house"];
  student.blood = "-default-";
  student.prefect = false;
  student.squad = false;
  student.expelled = false;

  // if student only has first name
  if (fullname.split(" ").length < 2) {
    student.firstName = fullname;
    student.lastName = undefined;
  }

  // if student has a middle name or a nick name
  else if (fullname.split(" ").length > 2) {
    if (fullname.includes(`"`)) {
      student.nickName = fullname.substring(fullname.indexOf(`"`) + 1, fullname.lastIndexOf(`"`));
    } else {
      student.middleName = fullname.substring(firstSpace + 1, lastSpace);
    }
  }

  console.table(student);
}
