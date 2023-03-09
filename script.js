"use strict";

window.addEventListener("DOMContentLoaded", start);

let allStudents = [];

const Student = {
  firstName: "-default-",
  middleName: undefined,
  nickName: undefined,
  lastName: "-default-",
  gender: "-default-",
  photo: "-default-.png",
  house: "-default-",
  blood: "-default-",
  prefect: false,
  squad: false,
  enrolled: true,
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
  const students = objects.map(cleanObject);

  prepareObjects(students);
}

function cleanObject(object) {
  object["fullname"] = capitalize(object["fullname"].trim());
  object["gender"] = capitalize(object["gender"].trim());
  object["house"] = capitalize(object["house"].trim());

  function capitalize(string) {
    let capitalized = string[0].toUpperCase();

    for (let i = 1; i < string.length; i++) {
      if (string[i - 1] === " " || string[i - 1] === "-" || string[i - 1] === `"`) {
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

  //filterList("Ravenclaw");
  //console.table(allStudents);
  //sortList("prefect");

  displayList(allStudents);
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
  student.photo = `${student.lastName.toLowerCase()}_${fullname[0].toLowerCase()}.png`;
  student.house = object["house"];
  student.blood = "-default-";
  student.prefect = false;
  student.squad = false;
  student.enrolled = true;
  student.expelled = false;

  // if student only has first name
  if (fullname.split(" ").length < 2) {
    student.firstName = fullname;
    student.lastName = undefined;
    student.photo = undefined;
  }

  // if student has a middle name or a nick name
  else if (fullname.split(" ").length > 2) {
    if (fullname.includes(`"`)) {
      student.nickName = fullname.substring(fullname.indexOf(`"`) + 1, fullname.lastIndexOf(`"`));
    } else {
      student.middleName = fullname.substring(firstSpace + 1, lastSpace);
    }
  }

  // if student has hyphen in last name (for img)
  else if (student.lastName.includes("-")) {
    student.photo = `${fullname
      .substring(fullname.indexOf("-") + 1)
      .toLowerCase()}_${fullname[0].toLowerCase()}.png`;
  }

  return student;
}

// function setButton(){}

//function setFilter() {}

function filterList(type) {
  const filteredList = allStudents.filter(filterBy);

  // filter by boolean(true) or string(house type)

  function filterBy(student) {
    if (typeof student[type] === "boolean") {
      if (student[type] === true) {
        return true;
      } else {
        return false;
      }
    } else {
      if (student.house === type) {
        return true;
      } else {
        return false;
      }
    }
  }

  displayList(filteredList);
}

//function setSort() {}

function sortList(type) {
  const sortedList = allStudents.sort(sortBy);

  // sort by boolean(prefect, inq squad) or string(first name, last name, house)

  function sortBy(student1, student2) {
    if (typeof student1[type] === "boolean") {
      if (student1[type] === true) {
        return -1;
      } else {
        return 1;
      }
    } else {
      if (student1[type] < student2[type]) {
        return -1;
      } else {
        return 1;
      }
    }
  }

  displayList(sortedList);
}

function displayList(list) {
  // clear the list
  document.querySelector("#list tbody").innerHTML = "";

  // build a new list
  list.forEach(displayStudent);
}

function displayStudent(student) {
  // create clone
  const clone = document.querySelector("template#student").content.cloneNode(true);

  // set clone data

  clone.querySelector("[data-field=photo]").textContent = "photo here";
  clone.querySelector("[data-field=house]").textContent = student.house;
  clone.querySelector("[data-field=firstName]").textContent = student.firstName;
  clone.querySelector("[data-field=middleName]").textContent = student.middleName;
  clone.querySelector("[data-field=nickName]").textContent = student.nickName;
  clone.querySelector("[data-field=lastName]").textContent = student.lastName;
  clone.querySelector("[data-field=gender]").textContent = student.gender;
  clone.querySelector("[data-field=blood]").textContent = student.blood;
  clone.querySelector("[data-field=prefect]").textContent = `${student.prefect}`;
  clone.querySelector("[data-field=squad]").textContent = `${student.squad}`;
  clone.querySelector("[data-field=enrolled]").textContent = `${student.enrolled}`;
  clone.querySelector("[data-field=expelled]").textContent = `${student.expelled}`;

  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}
