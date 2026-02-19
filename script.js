const menu = document.querySelector("#menu");
const nav = document.querySelector(".links");

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const resultsContainer = document.getElementById("card-container");

const increaseBtn = document.getElementById("increase-text");
const decreaseBtn = document.getElementById("decrease-text");

let textlv = 1;
const maxlv = 3;
const minlv = 1;

const tabBtn = document.querySelectorAll(".tab-btn");
tabBtn.forEach(btn => {
    btn.addEventListener("click", () =>{
        document.querySelector(".tab-btn.active")?.classList.remove("active");
        document.querySelector(".tab-content.active")?.classList.remove("active");
        btn.classList.add("active");
        const targettab = document.getElementById(btn.dataset.tab + "-container");
        targettab.classList.add("active");
    });
});

let currentPage = 1;
let booksData = [];

menu.onclick = () =>{
    menu.classList.toggle('bx-x');
    nav.classList.toggle('active');
}

async function getrandomBooks(){
    try{
        const randomsubject = subject[Math.floor(Math.random() * subject.length)];
        const response = await fetch(`https://openlibrary.org/subjects/${randomsubject}.json?limit=20`);
        if(!response.ok) throw new Error("Failed to fetch recommendation");
        const data = await response.json();
        booksData = data.works.sort(() => .5 -Math.random());
        currentPage = 1;
        displayBooks();
        displaypage();
        document.getElementById("pageno").style.display = "none";
    }catch(error){
        resultsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

async function getbooks(query){
    const apiUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`;
    try{
        const response = await fetch(apiUrl);
        if(!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        booksData = data.docs;
        currentPage = 1;
        displayBooks();
        displaypage();
    } catch(error){
        resultsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}


function displayBooks(){
    resultsContainer.innerHTML = "";
    const start = (currentPage - 1) * 3;
    const end = start + 3;
    const bookstoshow = booksData.slice(start, end);
    resultsContainer.innerHTML = "";
    if(bookstoshow.length === 0){
        resultsContainer.innerHTML = "<p>No books found</p>";
        return;
    }
    const readingList = JSON.parse(localStorage.getItem("readingList")) || [];
    const readList = JSON.parse(localStorage.getItem("readList")) || [];

    bookstoshow.forEach(book => {
        const bookcard = document.createElement("div");
        bookcard.classList.add("card");

        const image = document.createElement("img");
        if(book.cover_i){
            image.src = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
        } else if (book.cover_id) {
            image.src = `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`;
        }
        else{
            image.src = "./book-placeholder.png"
        }
        const title = document.createElement("h3");
        title.textContent = book.title;
        const hr = document.createElement("hr");
        const description = document.createElement("p");
        description.textContent = `Author: ${book.author_name ? book.author_name[0] : "Unknown"} 
        | First published: ${book.first_publish_year || "N/A"}`;;
        
        const btn = document.createElement("button");
        btn.classList.add("add-btn");

        const inreading = readingList.some(bk => bk.key === book.key);
        const inread = readList.some(bk => bk.key === book.key);

        if(inread){
            btn.textContent = "In Read List";
            btn.disabled = true;
        } else if(inreading){
            btn.textContent = "In Reading list";
            btn.disabled = true;
        }else{
            btn.textContent = "Add Book";
            btn.addEventListener("click", () =>{
                addToReadingList(book);
            });
        }


        bookcard.append(image);
        bookcard.append(title);
        bookcard.append(hr);
        bookcard.append(description);
        bookcard.append(btn);
        resultsContainer.appendChild(bookcard);
    });

}
searchBtn.addEventListener("click", () =>{
    const query = searchInput.value.trim();
    if(!query){
      //  resultsContainer.innerHTML = "<p>Please enter a seach</p>";
        getrandomBooks();
        document.getElementById("pageno").style.display = "none";
        return;
    }
    getbooks(query);
    document.getElementById("pageno").style.display = "block";
});

function displaypage(){
    const totalpage = Math.ceil(booksData.length / 3);
    const pageresult = document.getElementById("pageno");
    pageresult.innerHTML = "";

    const prevbtn = document.createElement("button");
    prevbtn.textContent = "Previous";
    prevbtn.addEventListener("click", () =>{
        if(currentPage > 1){
            currentPage--;
            displayBooks();
            displaypage();
        }
    });

    pageresult.appendChild(prevbtn);

    for(let i = 1; i <= totalpage; i++){
        const pagebtn = document.createElement("button");
        pagebtn.textContent = i;
        pagebtn.disabled = i === currentPage;
        pagebtn.addEventListener("click", () =>{
            currentPage = i;
            displayBooks();
            displaypage();
        });
        pageresult.appendChild(pagebtn);
    }

    const nextbtn = document.createElement("button");
    nextbtn.textContent = "Next";
    nextbtn.disabled = currentPage === totalpage;
    nextbtn.addEventListener("click", () =>{
        if(currentPage < totalpage){
            currentPage++;
            displayBooks();
            displaypage();
        }
    });
    pageresult.appendChild(nextbtn);


}
const subject = [
    "fantasy",
    "romance",
    "science",
    "history",
    "mystery",
    "horror"
];


window.addEventListener("load", () => {
    getrandomBooks();
});
document.addEventListener("DOMContentLoaded", () =>{
    displayReadingList();
    displayreadList();
});

function addToReadingList(book){
    let readingList = JSON.parse(localStorage.getItem("readingList")) || [];

    const alreadyExists = readingList.some(item => item.key === book.key);
    if(alreadyExists){
        alert("book already added!");
        return;
    }
    readingList.push(book);
    localStorage.setItem("readingList", JSON.stringify(readingList));
    displayReadingList();
}

function displayReadingList(){
    const container = document.getElementById("reading-container");
    container.innerHTML = "";

    let readingList = JSON.parse(localStorage.getItem("readingList")) || [];

    if(readingList.length === 0){
        container.innerHTML = "<p> No books in reading list</p>";
        return;
    }

    readingList.forEach(book =>{
        const card = document.createElement("div");
        card.classList.add("card");

        const image = document.createElement("img");
        if(book.cover_i){
            image.src = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
        } else if (book.cover_id){
            image.src = `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`;
        } else{
            image.src =  image.src = "./book-placeholder.png";
        }
        const hr = document.createElement("hr");
        const title = document.createElement("h3");
        title.textContent = book.title;

        const description = document.createElement("p");

        description.textContent =  `Author: ${book.author_name ? book.author_name[0] : "Unknown"}
        | First published: ${book.first_publish_year || "N/A"}`;

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "remove";
        removeBtn.addEventListener("click", () => {
            removeFromReadingList(book.key);
        });
        const markreadbtn = document.createElement("button");
        markreadbtn.textContent = "Read";
        markreadbtn.classList.add("read-btn");
        markreadbtn.addEventListener("click", () => {
            movetoread(book.key);
        });

        card.append(image, hr, title, description, removeBtn, markreadbtn);
        container.appendChild(card);
    });

}
function removeFromReadingList(bookKey){
    let readingList = JSON.parse(localStorage.getItem("readingList")) || [];

    readingList = readingList.filter(book => book.key !== bookKey);

    localStorage.setItem("readingList", JSON.stringify(readingList));

    displayReadingList();
}

function movetoread(bookkey){
    let readingList = JSON.parse(localStorage.getItem("readingList")) || [];
    let readList = JSON.parse(localStorage.getItem("readList")) || [];

    const book = readingList.find(bk => bk.key === bookkey);
    if(!book) return;

    readingList = readingList.filter(bk => bk.key !== bookkey);

    const alreadyExits = readList.some(bk => bk.key === bookkey);
    if(!alreadyExits){
        readList.push(book);
    }

    localStorage.setItem("readingList", JSON.stringify(readingList));
    localStorage.setItem("readList", JSON.stringify(readList));
    displayreadList();
    displayReadingList();
}

function displayreadList(){
    const container = document.getElementById("read-container");
    container.innerHTML = "";
    let readList = JSON.parse(localStorage.getItem("readList")) || [];
    let review = JSON.parse(localStorage.getItem("review")) || {}
    if(readList.length === 0){
        container.innerHTML = "<p>No books in read list<\p>";
        return;
    }

    readList.forEach(book =>{
        const card = document.createElement("div");
        card.classList.add("card", "read-card");

        const imageContainer = document.createElement("div")
        imageContainer.classList.add("image-container");

        const image = document.createElement("img");
        image.classList.add("read-img")
        if(book.cover_i){
            image.src = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
        } else if (book.cover_id){
            image.src = `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`;
        } else{
            image.src =  image.src = "./book-placeholder.png";
        }
        imageContainer.append(image)
        const infoDiv = document.createElement("div");
        infoDiv.classList.add("info-div");

        const title = document.createElement("h3");
        title.textContent = book.title;

        const description = document.createElement("h3");
        description.textContent = `Author: ${book.author_name ? book.author_name[0] : "Unknown"}
        | First published: ${book.first_publish_year || "N/A"}`;

        const reviewArea = document.createElement("textarea");
        reviewArea.placeholder = "write your review here...";
        reviewArea.rows = 5;
        reviewArea.value = review[book.key] || "";

        const reviewBtn = document.createElement("button");
        reviewBtn.textContent = "Submit Review";
        reviewBtn.addEventListener("click", () =>{
            review[book.key] = reviewArea.value;
            localStorage.setItem("review", JSON.stringify(review));
        });


        infoDiv.append(title, description, reviewArea, reviewBtn);
        card.append(image, infoDiv);
        container.appendChild(card);
    });
}

function saveReview(bookkey, text){
    if(!text) return;

    let review = JSON.parse(localStorage.getItem("review")) || {};
    review[bookkey] = text;
    localStorage.setItem("review", JSON.stringify(review));
}

function updatetextsize() {
    const allTextElements = document.querySelectorAll("h1, h2, h3, h4, h5, h6, p, span, a, label, button, textarea, div");

    allTextElements.forEach(el => {

        if(el.innerText.trim() !== "") {

            if(!el.dataset.originalFontSize){
                el.dataset.originalFontSize = window.getComputedStyle(el).fontSize;
            }
            const baseSize = parseFloat(el.dataset.originalFontSize);
            const scale = 1 + (textlv - 1) * 0.25; 
            el.style.fontSize = baseSize * scale + "px";
        }
    });

    // Disable buttons at limits
    increaseBtn.disabled = textlv === maxlv;
    decreaseBtn.disabled = textlv === minlv;
}





increaseBtn.addEventListener("click", () => {
    if(textlv < maxlv){
        textlv++;
        updatetextsize();
    }
});


decreaseBtn.addEventListener("click", () => {
    if(textlv > minlv){
        textlv--;
        updatetextsize();
    }
});
updatetextsize();