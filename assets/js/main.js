const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

function addBook() {
  const judulBuku = document.getElementById("judul-buku");
  const penulisBuku = document.getElementById("penulis-buku");
  const tahunBuku = document.getElementById("tahun-buku");
  const isCompleted = document.getElementById("selesai-dibaca");

  const generatedID = generateId();
  const bookObject = generateBooksObject(
    generatedID,
    judulBuku.value,
    penulisBuku.value,
    tahunBuku.value,
    isCompleted.checked
  );

  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBooksObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

const form1 = document.getElementById("form");

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("form");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();

    Toastify({
      text: "Buku baru sudah ditambahkan!",
      duration: 3000,
    }).showToast();

    form1.reset();
  });

  const searchForm = document.getElementById("cari-buku");
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBook();
  });

  const resetForm = document.getElementById("cariB");
  resetForm.addEventListener("click", function () {
    document.getElementById("search-input").value = "";
    searchBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function makeBook(bookObject) {
  const textTitle = document.createElement("h5");
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement("h6");
  textAuthor.innerText = bookObject.author;

  const textYear = document.createElement("h6");
  textYear.innerText = bookObject.year;

  const textBooksWrapper = document.createElement("div");
  textBooksWrapper.classList.add("inner");
  textBooksWrapper.append(textTitle, textAuthor, textYear);

  const container = document.createElement("div");
  container.classList.add(
    "list-item",
    "shadow",
    "p-4",
    "mb-3",
    "rounded-4",
    "d-flex",
    "gap-5",
    "justify-content-between",
    "align-items-center"
  );
  container.append(textBooksWrapper);
  container.setAttribute("id", `book-${bookObject.id}`);

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("item");

  if (bookObject.isCompleted) {
    const undoButton = document.createElement("div");
    undoButton.classList.add("btn", "btn-success", "p-2", "m-1");
    undoButton.innerText = "Belum Selesai";

    undoButton.addEventListener("click", function () {
      undoTaskFromCompleted(bookObject.id);
    });

    const editButton = document.createElement("div");
    editButton.classList.add("btn", "btn-secondary", "p-2", "m-1");
    editButton.innerText = "Edit Buku";
    editButton.addEventListener("click", function () {
      editBook(bookObject.id);
    });

    const deleteButton = document.createElement("div");
    deleteButton.classList.add("btn", "btn-danger", "p-2", "m-1");
    deleteButton.innerText = "Hapus Buku";

    deleteButton.addEventListener("click", function () {
      removeTaskFromCompleted(bookObject.id);
    });

    buttonContainer.append(undoButton, editButton, deleteButton);
    container.append(buttonContainer);
  } else {
    const selesaiButton = document.createElement("div");
    selesaiButton.classList.add("btn", "btn-success", "p-2", "m-1");
    selesaiButton.innerText = "Sudah Selesai";

    selesaiButton.addEventListener("click", function () {
      addBookToFinished(bookObject.id);
    });

    const editButton = document.createElement("div");
    editButton.classList.add("btn", "btn-secondary", "p-2", "m-1");
    editButton.innerText = "Edit Buku";
    editButton.addEventListener("click", function () {
      editBook(bookObject.id);
    });

    const deleteButton = document.createElement("div");
    deleteButton.classList.add("btn", "btn-danger", "p-2", "m-1");
    deleteButton.innerText = "Hapus Buku";

    deleteButton.addEventListener("click", function () {
      removeTaskFromCompleted(bookObject.id);
    });
    buttonContainer.append(selesaiButton, editButton, deleteButton);
    container.append(buttonContainer);
  }
  return container;
}

function addBookToFinished(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  Toastify({
    text: `${bookTarget.title} selesai dibaca`,
    style: {
      background: "linear-gradient(to right, #00b09b, #96c93d)",
    },
    duration: 3000,
  }).showToast();

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function editBook(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  document.getElementById("judul-buku").value = bookTarget.title;
  document.getElementById("penulis-buku").value = bookTarget.author;
  document.getElementById("tahun-buku").value = bookTarget.year;
  document.getElementById("selesai-dibaca").checked = bookTarget.isCompleted;

  const bookCard = document.getElementById(`book-${bookId}`);
  bookCard.classList.add("d-none");

  const submitBook = document.getElementById("submitBook");
  submitBook.innerText = "Edit Buku";

  Toastify({
    text: `Buku ${bookTarget.title} sedang di edit`,
    style: {
      background: "linear-gradient(to right, #ffa585, #fbd07c)",
    },
    duration: 3000,
  }).showToast();

  editButton = document.getElementsByClassName("btn-secondary");
  for (editButton of editButton) {
    editButton.classList.add("disabled");
  }
  submitBook.addEventListener("click", function (event) {
    event.preventDefault();

    bookTarget.title = document.getElementById("judul-buku").value;
    bookTarget.author = document.getElementById("penulis-buku").value;
    bookTarget.year = document.getElementById("tahun-buku").value;
    bookTarget.isCompleted = document.getElementById("selesai-dibaca").checked;

    bookCard.classList.remove("d-none");

    submitBook.innerText = "Masukan buku kedalam rak";

    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
    location.reload();
  });
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompleteBookList = document.getElementById("belumDibaca");
  uncompleteBookList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) {
      uncompleteBookList.append(bookElement);
    }
  }
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompleteBookList = document.getElementById("belumDibaca");
  uncompleteBookList.innerHTML = "";

  const completeBookList = document.getElementById("sudahDibaca");
  completeBookList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) uncompleteBookList.append(bookElement);
    else completeBookList.append(bookElement);
  }
});

function removeTaskFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);
  const bookTargetDelete = findBook(bookId);

  if (bookTarget === -1) return;

  Toastify({
    text: `Buku ${bookTargetDelete.title} dihapus!`,
    style: {
      background: "linear-gradient(to right, #ff758c, #ff7eb3)",
    },
    duration: 5000,
  }).showToast();

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoTaskFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  Toastify({
    text: `${bookTarget.title} belum selesai dibaca`,
    style: {
      background: "linear-gradient(to right, #00b09b, #96c93d)",
    },
    duration: 3000,
  }).showToast();

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function searchBook() {
  const searchInput = document
    .getElementById("search-input")
    .value.toLowerCase();
  const bookItems = document.getElementsByClassName("list-item");
  for (let i = 0; i < bookItems.length; i++) {
    const itemTitle = bookItems[i].querySelector("h5");
    if (itemTitle.textContent.toLowerCase().includes(searchInput)) {
      bookItems[i].classList.remove("d-none");
    } else {
      bookItems[i].classList.add("d-none");
    }
  }
}
