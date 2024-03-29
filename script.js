"use strict";

window.addEventListener("DOMContentLoaded", start);

let allStudents = [];

let bloodStatus = {};

const settings = {
  filterType: "*",
  sortType: "",
  hacked: false,
};

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
  setButton();
}

function loadJSON() {
  fetch("https://petlatkea.dk/2021/hogwarts/families.json")
    .then((response) => response.json())
    .then((jsonData) => {
      // when loaded, set bloodStatus
      bloodStatus = jsonData;
    });

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
  student.blood = checkBlood(student.lastName);
  student.prefect = false;
  student.squad = false;
  student.enrolled = true;
  student.expelled = false;

  // if student only has first name
  if (fullname.split(" ").length < 2) {
    student.firstName = fullname;
    student.lastName = undefined;
    student.photo = `undefined.png`;
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

  // if it's padma or parvati patil (for img)
  else if (student.lastName == "Patil") {
    student.photo = `${student.lastName.toLowerCase()}_${student.firstName}.png`;
  }

  // check blood status
  function checkBlood(familyName) {
    if (bloodStatus["half"].includes(familyName)) {
      return "Half Blood";
    } else if (bloodStatus["pure"].includes(familyName)) {
      return "Pure Blood";
    } else {
      return "Muggle Born";
    }
  }

  return student;
}

function setButton() {
  // filter button
  document.querySelectorAll("[data-action='filter']").forEach(function (button) {
    button.addEventListener("click", selectFilter);
  });

  // sort button
  document.querySelectorAll('select[data-action="sort"]').forEach(function (button) {
    button.addEventListener("change", selectSort);
  });

  //search button
  document.querySelector("#search").addEventListener("input", searchList);

  //hack button
  document.querySelector("#logo").addEventListener("click", hackTheSystem);
}

function searchList() {
  const searchTerm = document.querySelector("#search").value.toLowerCase();
  const searchedList = allStudents.filter(isSearched);

  function isSearched(student) {
    if (student.lastName == undefined) {
      const fullName = `${student.firstName}`.toLowerCase();

      return fullName.includes(searchTerm);
    } else {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();

      return fullName.includes(searchTerm);
    }
  }

  displayList(searchedList);
}

function selectFilter(event) {
  const filter = event.target.dataset.filter;

  // remove old selected class
  document.querySelector(`[data-filter='${settings.filterType}']`).classList.remove("selected");

  // add class of selected
  event.target.classList.add("selected");

  setFilter(filter);
}

function setFilter(filter) {
  settings.filterType = filter;

  loadList();
}

function filterList() {
  let filteredList = allStudents;

  if (settings.filterType !== "*") {
    filteredList = allStudents.filter(filterBy);

    // filter by boolean(true) or string(house type)

    function filterBy(student) {
      if (typeof student[settings.filterType] === "boolean") {
        if (student[settings.filterType] === true) {
          return true;
        } else {
          return false;
        }
      } else {
        if (student.house === settings.filterType) {
          return true;
        } else {
          return false;
        }
      }
    }
  }

  return filteredList;
}

function selectSort(event) {
  const sort = event.target.value;

  setSort(sort);
}

function setSort(sort) {
  settings.sortType = sort;

  loadList();
}

function sortList(list) {
  const sortedList = list.sort(sortBy);

  // sort by boolean(prefect, inq squad) or string(first name, last name, house)

  function sortBy(student1, student2) {
    if (typeof student1[settings.sortType] === "boolean") {
      if (student1[settings.sortType] === true) {
        return -1;
      } else {
        return 1;
      }
    } else {
      if (student1[settings.sortType] < student2[settings.sortType]) {
        return -1;
      } else {
        return 1;
      }
    }
  }

  return sortedList;
}

function loadList() {
  const filteredList = filterList();
  const sortedList = sortList(filteredList);

  displayList(sortedList);
}

function displayList(list) {
  // clear the list
  document.querySelector("#list tbody").innerHTML = "";

  // build a new list
  list.forEach(displayStudent);
}

function displayStudent(student) {
  const studentNumbers = {
    total: allStudents.length,
    totalGryffindor: allStudents.filter(isGryffindor).length,
    totalSlytherin: allStudents.filter(isSlytherin).length,
    totalRavenclaw: allStudents.filter(isRavenclaw).length,
    totalHufflepuff: allStudents.filter(isHufflepuff).length,
    totalEnrolled: allStudents.filter(isEnrolled).length,
    totalExpelled: allStudents.filter(isExpelled).length,
  };

  function isGryffindor(student) {
    return student.house === "Gryffindor";
  }

  function isSlytherin(student) {
    return student.house === "Slytherin";
  }

  function isRavenclaw(student) {
    return student.house === "Ravenclaw";
  }

  function isHufflepuff(student) {
    return student.house === "Hufflepuff";
  }

  function isEnrolled(student) {
    return student.enrolled === true;
  }

  function isExpelled(student) {
    return student.expelled === true;
  }

  // display student number
  document.querySelector(
    `[data-filter='*']`
  ).textContent = `All Students (${studentNumbers.total})`;
  document.querySelector(
    `[data-filter='Gryffindor']`
  ).textContent = `Gryffindor (${studentNumbers.totalGryffindor})`;
  document.querySelector(
    `[data-filter='Slytherin']`
  ).textContent = `Slytherin (${studentNumbers.totalSlytherin})`;
  document.querySelector(
    `[data-filter='Ravenclaw']`
  ).textContent = `Ravenclaw (${studentNumbers.totalRavenclaw})`;
  document.querySelector(
    `[data-filter='Hufflepuff']`
  ).textContent = `Hufflepuff (${studentNumbers.totalHufflepuff})`;
  document.querySelector(
    `[data-filter='enrolled']`
  ).textContent = `Enrolled Students (${studentNumbers.totalEnrolled})`;
  document.querySelector(
    `[data-filter='expelled']`
  ).textContent = `Expelled Students (${studentNumbers.totalExpelled})`;

  // create clone
  const clone = document.querySelector("template#student").content.cloneNode(true);

  // set clone data

  //clone.querySelector("[data-field=photo]").innerHTML = `<img src="img/${student.photo}">`;
  clone.querySelector("[data-field=house]").textContent = student.house;
  if (student.house === "Gryffindor") {
    clone.querySelector("[data-field=house]").style.color = "#a6332e";
  }

  if (student.house === "Slytherin") {
    clone.querySelector("[data-field=house]").style.color = "#2a623d";
  }

  if (student.house === "Ravenclaw") {
    clone.querySelector("[data-field=house]").style.color = "#3c4e91";
  }

  if (student.house === "Hufflepuff") {
    clone.querySelector("[data-field=house]").style.color = "#efbc2f";
  }

  clone.querySelector("[data-field=firstName]").textContent = student.firstName;
  clone.querySelector("[data-field=middleName]").textContent = ``;
  clone.querySelector("[data-field=nickName]").textContent = ``;
  clone.querySelector("[data-field=lastName]").textContent = student.lastName;
  clone.querySelector("[data-field=gender]").textContent = ``;
  clone.querySelector("[data-field=blood]").textContent = ``;

  // set expel/enroll status
  if (student.expelled == false) {
    clone.querySelector("[data-field=enrolled]").textContent = ``;
    clone.querySelector("[data-field=expelled]").textContent = ``;

    //expel button
    clone.querySelector("[data-field=status] button").textContent = `EXPEL`;
  } else {
    clone.querySelector("[data-field=enrolled]").textContent = ``;
    clone.querySelector("[data-field=expelled]").textContent = ``;

    // re-enroll button
    clone.querySelector("[data-field=status] button").textContent = `RE-ENROLL`;
    clone.querySelector("[data-field=status] button").style.backgroundColor = `#4CAF50`;
  }

  // change status (expel)
  clone.querySelector("[data-field=status] button").addEventListener("click", changeStatus);

  function changeStatus() {
    if (student.expelled == false) {
      student.enrolled = false;
      student.expelled = true;
      student.prefect = false;
    } else {
      student.enrolled = true;
      student.expelled = false;
    }

    loadList();
  }

  // set prefect status
  if (student.prefect == false) {
    clone.querySelector("[data-field=prefect]").textContent = ``;

    //select prefect button
    clone.querySelector("[data-field=setprefect] button").textContent = `SELECT PREFECT`;
    clone.querySelector("[data-field=setprefect] button").style.backgroundColor = `#4CAF50`;
  } else {
    clone.querySelector("[data-field=prefect]").textContent = `⭐`;

    // remove prefect button button
    clone.querySelector("[data-field=setprefect] button").textContent = `REMOVE PREFECT`;
    clone.querySelector("[data-field=setprefect] button").style.backgroundColor = "#f44336";
  }

  // change prefect status (set/remove)
  clone.querySelector("[data-field=setprefect] button").addEventListener("click", setPrefect);

  function setPrefect() {
    if (student.prefect == true) {
      student.prefect = false;
    } else {
      student.prefect = checkPrefect(student);

      if (student.prefect === false) {
        document.querySelector("#modal").classList.remove("hidden");
        document.querySelector("#modal h2").textContent =
          "You have already selected two prefects for this house!";
        document.querySelector("#modal p").textContent =
          "Please remove a selection before adding another.";

        closeModal();
      }
    }

    // check prefect availability
    function checkPrefect(student) {
      const housePrefects = allStudents.filter(isPrefect).filter(isHousePrefect);

      function isPrefect(aStudent) {
        return aStudent.prefect === true;
      }

      function isHousePrefect(aPrefect) {
        return aPrefect.house == student.house;
      }

      // 1. should be an enrolled student
      if (student.expelled === true) {
        return false;
      } else {
        // 2. max 2 students can be prefects in each house
        if (housePrefects.length < 2) {
          return true;
        } else {
          return false;
        }
      }
    }

    loadList();
  }

  // set inquisitorial squad status
  if (student.squad == false) {
    clone.querySelector("[data-field=squad]").textContent = ``;

    //select squad button
    clone.querySelector("[data-field=setsquad] button").textContent = `SELECT SQUAD`;
    clone.querySelector("[data-field=setsquad] button").style.backgroundColor = `#4CAF50`;
  } else {
    clone.querySelector("[data-field=squad]").textContent = `🪄`;

    // remove squad button
    clone.querySelector("[data-field=setsquad] button").textContent = `REMOVE SQUAD`;
    clone.querySelector("[data-field=setsquad] button").style.backgroundColor = "#f44336";
  }

  // change inquisitorial squad status (set/remove)
  clone.querySelector("[data-field=setsquad] button").addEventListener("click", setSquad);

  function setSquad() {
    if (student.squad == true) {
      student.squad = false;
    } else {
      student.squad = checkSquad(student);

      if (student.squad == false) {
        document.querySelector("#modal").classList.remove("hidden");
        document.querySelector("#modal h2").textContent =
          "Inquisitorial Squad is limited to Pure Blood or Slytherin students!";
        document.querySelector("#modal p").textContent = "Please select a valid student.";

        closeModal();
      }
    }

    // check sqaud availability
    function checkSquad(student) {
      if (student.house === "Slytherin") {
        return true;
      } else if (student.blood === "Pure Blood") {
        return true;
      } else {
        return false;
      }
    }

    loadList();
  }

  // close pop-up modal
  /*   function closeModal() {
    document.querySelector("#close").addEventListener("click", function addHidden() {
      document.querySelector("#modal").classList.add("hidden");
    });
  } */

  // HACKTHESYSTEM ON

  if (settings.hacked == true) {
    //can't expel me
    if (student.firstName === "Yejin") {
      clone.querySelector("[data-field=status] button").addEventListener("click", cantExpel);

      function cantExpel() {
        student.enrolled = true;
        student.expelled = false;

        document.querySelector("#modal").classList.remove("hidden");
        document.querySelector("#modal h2").textContent = "You Can't Expel This Student!";
        document.querySelector("#modal p").textContent = "Please don't ever dare.";

        closeModal();
        loadList();
      }
    }

    //can't select inquisitorial squad
    clone.querySelector("[data-field=setsquad] button").addEventListener("click", cantSquad);

    function cantSquad() {
      student.squad = true;
      loadList();

      setTimeout(function removeSquad() {
        document.querySelector("#modal").classList.remove("hidden");
        document.querySelector("#modal h2").textContent = "Uh oh! Something went wrong...";
        document.querySelector("#modal p").textContent = "Please try again.";
        closeModal();

        student.squad = false;
        loadList();
      }, 1000);
    }
  }

  // update clicked student
  clone.querySelector("[data-field=firstName]").addEventListener("click", updatePopup);
  clone.querySelector("[data-field=lastName]").addEventListener("click", updatePopup);

  function updatePopup() {
    displayPopup(student);
  }
  function displayPopup(clicked) {
    document.querySelector("#studentmodal").classList.remove("hidden");
    document.querySelector("#closestudent").addEventListener("click", closeStudent);

    //set data modal
    document.querySelector("#studentphoto").src = `img/${clicked.photo}`;
    document.querySelector("[data-modal=firstName]").textContent = clicked.firstName;
    document.querySelector("[data-modal=house]").textContent = clicked.house;

    //house color
    if (student.house === "Gryffindor") {
      document.querySelector("#info").style.borderColor = "#a6332e";
    }

    if (student.house === "Slytherin") {
      document.querySelector("#info").style.borderColor = "#2a623d";
    }

    if (student.house === "Ravenclaw") {
      document.querySelector("#info").style.borderColor = "#3c4e91";
    }

    if (student.house === "Hufflepuff") {
      document.querySelector("#info").style.borderColor = "#efbc2f";
    }

    if (clicked.middleName !== undefined) {
      document.querySelector("[data-modal=middleName]").textContent = clicked.middleName;
    } else {
      document.querySelector("[data-modal=middleName]").textContent = `-`;
    }

    if (clicked.nickName !== undefined) {
      document.querySelector("[data-modal=nickName]").textContent = clicked.nickName;
    } else {
      document.querySelector("[data-modal=nickName]").textContent = `-`;
    }

    if (clicked.lastName !== undefined) {
      document.querySelector("[data-modal=lastName]").textContent = clicked.lastName;
    } else {
      document.querySelector("[data-modal=lastName]").textContent = `-`;
    }

    //expel status and button
    if (clicked.expelled === false) {
      document.querySelector("[data-modal=status] span").textContent = `Enrolled`;
      document.querySelector("[data-modal=status] button").textContent = `EXPEL`;
      document.querySelector("[data-modal=status] button").style.backgroundColor = `#f44336`;
    } else {
      document.querySelector("[data-modal=status] span").textContent = `Expelled`;
      document.querySelector("[data-modal=status] button").textContent = `RE-ENROLL`;
      document.querySelector("[data-modal=status] button").style.backgroundColor = `#4CAF50`;
    }
    // expel button
    document.querySelector("[data-modal=status] button").addEventListener("click", expelStudent);

    function expelStudent() {
      {
        if (clicked.expelled === false) {
          clicked.expelled = true;
          clicked.enrolled = false;
        } else {
          clicked.expelled = false;
          clicked.enrolled = true;
        }
        document
          .querySelector("[data-modal=status] button")
          .removeEventListener("click", expelStudent);
        console.log(clicked);
        loadList();
        displayPopup(clicked);
      }
    }

    // prefect status and button
    if (clicked.prefect === false) {
      document.querySelector("[data-modal=prefect] span").textContent = `Not a Prefect`;
      document.querySelector("[data-modal=prefect] button").textContent = `SELECT`;
      document.querySelector("[data-modal=prefect] button").style.backgroundColor = `#4CAF50`;
    } else {
      document.querySelector("[data-modal=prefect] span").textContent = `${clicked.house} Prefect`;
      document.querySelector("[data-modal=prefect] button").textContent = `REMOVE`;
      document.querySelector("[data-modal=prefect] button").style.backgroundColor = `#f44336`;
    }

    // prefect button

    document.querySelector("[data-modal=prefect] button").addEventListener("click", prefectStudent);

    function prefectStudent() {
      if (clicked.prefect == true) {
        clicked.prefect = false;
      } else {
        clicked.prefect = canPrefect(clicked);
      }

      function canPrefect(student) {
        const housePrefects = allStudents.filter(isPrefect).filter(isHousePrefect);

        function isPrefect(aStudent) {
          return aStudent.prefect === true;
        }

        function isHousePrefect(aPrefect) {
          return aPrefect.house == student.house;
        }

        // 2. max 2 students can be prefects in each house
        if (housePrefects.length < 2) {
          return true;
        } else {
          showAlert();
          return false;
        }
      }

      loadList();
      document
        .querySelector("[data-modal=prefect] button")
        .removeEventListener("click", prefectStudent);
      displayPopup(clicked);

      console.log(clicked);
    }

    // squad status and button
    if (clicked.squad === false) {
      document.querySelector("[data-modal=squad] span").textContent = `Not a Squad`;
      document.querySelector("[data-modal=squad] button").textContent = `SELECT`;
      document.querySelector("[data-modal=squad] button").style.backgroundColor = `#4CAF50`;
    } else {
      document.querySelector("[data-modal=squad] span").textContent = `Member of Squad`;
      document.querySelector("[data-modal=squad] button").textContent = `REMOVE`;
      document.querySelector("[data-modal=squad] button").style.backgroundColor = `#f44336`;
    }

    document.querySelector("[data-modal=squad] button").addEventListener("click", squadStudent);

    function squadStudent() {
      {
        if (clicked.squad === true) {
          clicked.squad = false;
        } else {
          if (clicked.blood === "Pure Blood") {
            clicked.squad = true;
          } else if (clicked.house === "Slytherin") {
            clicked.squad = true;
          } else {
            clicked.squad = false;
            showAlert2();
          }
        }

        document
          .querySelector("[data-modal=squad] button")
          .removeEventListener("click", squadStudent);
        console.log(clicked);
        loadList();
        displayPopup(clicked);
      }
    }
  }

  function closeStudent() {
    document.querySelector("#studentmodal").classList.add("hidden");
    document.querySelector("#closestudent").removeEventListener("click", closeStudent);
  }

  document.querySelector("#list tbody").appendChild(clone);
}

function showAlert() {
  document.querySelector("#modal").classList.remove("hidden");
  document.querySelector("#modal h2").textContent =
    "You have already selected two prefects for this house!";
  document.querySelector("#modal p").textContent =
    "Please remove a selection before adding another.";

  closeModal();
}

function showAlert2() {
  document.querySelector("#modal").classList.remove("hidden");
  document.querySelector("#modal h2").textContent =
    "Inquisitorial Squad is limited to Pure Blood or Slytherin students!";
  document.querySelector("#modal p").textContent = "Please select a valid student.";

  closeModal();
}

function closeModal() {
  document.querySelector("#close").addEventListener("click", function addHidden() {
    document.querySelector("#modal").classList.add("hidden");
  });
}

function hackTheSystem() {
  settings.hacked = true;

  allStudents.push(injectMe());
  allStudents.forEach(messBlood);

  // inject me in allStudents
  function injectMe() {
    const me = Object.create(Student);

    me.firstName = "Yejin";
    me.middleName = "Dumbledore";
    me.nickName = "Fangirl";
    me.lastName = "Youn";
    me.gender = "Girl";
    me.photo = "me.png";
    me.house = "Hufflepuff";
    me.blood = "Muggle Born";
    me.prefect = false;
    me.squad = false;
    me.enrolled = true;
    me.expelled = false;

    return me;
  }

  // mess blood status
  function messBlood(student) {
    if (student.blood === "Muggle Born" || student.blood === "Half Blood") {
      student.blood = "Pure Blood";
    } else {
      const random = Math.floor(Math.random() * 2);
      if (random == 0) {
        student.blood = "Half Blood";
      } else if (random == 1) {
        student.blood = "Muggle Born";
      }
    }
  }

  loadList();
}
