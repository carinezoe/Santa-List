const url = 'http://localhost:3000/kids';
const url2 = 'http://localhost:3000/toys';
const output = document.getElementById('output');
const output2 = document.getElementById('output2');
const localOutput = document.getElementById('localOutput');
const list = [];
let currentEditingChild = null;
// HTTP VERB (GET, POST, DELETE, PUT)

// Fetch data kids
function fetchDataKids () {
    output.innerHTML = '';
    fetch(url)
    .then(res => res.json())
    .then(data => {
        data.forEach(kids => {
            output.innerHTML += `<div id="child-${kids.id}" class="child-container">
                                    <div class="wishes">
                                        <span>${kids.name}</span>
                                    </div>
                                    <div class="space">
                                        <button class="add" onclick="addGifts('${kids.id}')">Add gifts</button>
                                        <button onclick="deleteChild('${kids.id}')">Delete</button>
                                        <button class="done" id="done-${kids.id}" onclick="cancelGiftSelection('${kids.id}')" style="display: none">Done</button>
                                    </div>
                                    <div id="gifts-${kids.id}" class="gifts-list"></div>
                                 </div>`;
        });
    })
    .catch(e => console.log(e));
}

// Fetch data toys
function fetchDataToys () {
    output2.innerHTML = '';
    fetch(url2)
    .then(res => res.json())
    .then(data => {
        data.forEach(toys => {
            output2.innerHTML += `<div id=toy-${toys.id} class="toy-container">
                                    <span>${toys.name}</span>
                                    <div class="buttons">
                                        <button class="t" id="${toys.id}" onclick="addToys ('${toys.name}')" style="visibility: hidden">Add gift</button>
                                        <button class="delete" onclick="deleteToy ('${toys.id}')">Delete</button>
                                    </div>
                                   </div>`;
        })
    })
    .catch(e => console.log(e))
}

// Add kids
document.getElementById('addChild').addEventListener('click', () => {
    const newChild = {name: document.getElementById('name').value};
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newChild)
    })
    .then(res => res.json())
    .then(() => {
        fetchDataKids();
        document.getElementById('name').value = '';
    })
    .catch(e => console.error('Error adding post:', e));
});

// Delete kids
function deleteChild(id) {
    fetch(`${url}/${id}`, {
        method: 'DELETE'
    })
    .then(() => fetchDataKids())
    .catch(e => console.error('Error deleting post:', e));
}

// Add toys
document.getElementById('addToy').addEventListener('click', () => {
    const newToy = {name: document.getElementById('toy').value};
    
    fetch(url2, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newToy)
    })
    .then(res => res.json())
    .then(() => {
        fetchDataToys();
        document.getElementById('toy').value = '';
    })
    .catch(e => console.error('Error adding post:', e));
});

// Delete toys
function deleteToy(id) {
    fetch(`${url2}/${id}`, {
        method: 'DELETE'
    })
    .then(() => fetchDataToys())
    .catch(e => console.error('Error deleting post:', e));
}

// Load saved whishes from localStorage
function loadSavedWishes() {
    try {
        const savedWishes = JSON.parse(localStorage.getItem('savedWishes') || '[]');
        localOutput.innerHTML = '';
        
        if (savedWishes.length === 0) {
            const noWishesMessage = document.createElement('div');
            noWishesMessage.className = 'no-wishes-message';
            noWishesMessage.textContent = 'No saved wishes yet!';
            localOutput.appendChild(noWishesMessage);
            return;
        }

        savedWishes.forEach(wish => {
            const wishDiv = document.createElement('div');
            wishDiv.className = 'wish-item';
            wishDiv.innerHTML = `
                <span>${wish.childName}</span>
                <div class="list">
                    <div class="toy-list">
                        ${wish.toys.map(toy => `
                            <div class="toy-item">
                                <span>${toy.toyName}</span>
                            </div>
                        `).join('')}
                    </div>
                    <button onclick="removeFromSaved('${wish.childId}')">Remove</button>
                </div>
            `;
                //.map() transforms each toy into an HTML string
                //.join('') combines all the generated HTML strings into one continuous string
            localOutput.appendChild(wishDiv);
        });
    } catch (error) {
        console.error('Error loading saved wishes:', error);
        localStorage.setItem('savedWishes', '[]');
    }
}

// Add toys to kids
function addGifts(childId) {
    // Reset previous selection
    cancelGiftSelection(currentEditingChild);
    
    // Set new editing state
    currentEditingChild = childId;
    
    // Update UI
    const childContainer = document.getElementById(`child-${childId}`);
    childContainer.classList.add('editing');
        // Adds the class editing
        //This allows dynamic styling or JavaScript targeting of elements in different states

    // Show Done button
    const doneButton = document.getElementById(`done-${childId}`);
    if (doneButton) {
        doneButton.style.display = 'block';
    }
    
    // Show Add Gift buttons
    const toyElements = document.querySelectorAll('[id^="toy-"]');
    toyElements.forEach(toyElement => {
        const addGiftButton = toyElement.querySelector('.t');
        if (addGiftButton) {
            addGiftButton.style.visibility = 'visible';
            addGiftButton.setAttribute('onclick', 
                `addToys('${toyElement.querySelector('span').textContent}', '${childId}')`);
                    //setAttribute() adds an attribute to an HTML element
                    //here setting an onclick event that calls the addToys() function
                    //The function is called with two arguments: 
                    //The toy name (extracted from the <span> element's text content), the childId
        }
    });
}

// Close editing mode
function cancelGiftSelection(childId) {
    if (!childId) return;
    
    // Reset UI
    const childContainer = document.getElementById(`child-${childId}`);
    if (childContainer) {
        childContainer.classList.remove('editing');
    }
    
    // Hide Done button
    const doneButton = document.getElementById(`done-${childId}`);
    if (doneButton) {
        doneButton.style.display = 'none';
    }
    
    // Hide Add Gift buttons
    const toyElements = document.querySelectorAll('[id^="toy-"]');
    toyElements.forEach(toyElement => {
        const addGiftButton = toyElement.querySelector('.t');
        if (addGiftButton) {
            addGiftButton.style.visibility = 'hidden';
        }
    });
    
    currentEditingChild = null;
}

// Adds toy to child
function addToys(toyName, childId) {
    // Add to list
    list.push({ childId, toyName });
    
    // Update UI
    const giftsList = document.getElementById(`gifts-${childId}`);
    if (giftsList) {
        const giftElement = document.createElement('div');
        giftElement.className = 'selected-gift';
        giftElement.innerHTML = `
            <span>${toyName}</span>
            <button onclick="removeGift('${toyName}', '${childId}')">Remove</button>
        `;
        giftsList.appendChild(giftElement);
    }
    
    saveToLocal(childId);
    loadSavedWishes();
}

// Remove toy from child
function removeGift(toyName, childId) {
    // Remove from list
    const index = list.findIndex(item => 
        item.toyName === toyName && item.childId === childId);
    if (index > -1) {
        list.splice(index, 1);
    }
        //if (index > -1) ensures the index was actually found before removing
        //splice(index, 1) removes 1 element at the specified index
    
    // Update UI
    const giftsList = document.getElementById(`gifts-${childId}`);
    if (giftsList) {
        const gifts = giftsList.getElementsByClassName('selected-gift');
            //let gift of gifts is a JavaScript for...of loop that iterates through each element in the gifts array or collection:
                //Automatically goes through every item in gifts
                //gift becomes a direct reference to each individual item in each iteration
                //Simpler and more readable than traditional for loops with index counters
                //Equivalent to for (let i = 0; i < gifts.length; i++) { let gift = gifts[i]; ... }
        for (let gift of gifts) {
            if (gift.querySelector('span').textContent === toyName) {
                gift.remove();
                break;
            }
                //break stops searching after finding and removing the first match
        }
    }
    
    saveToLocal(childId);
    loadSavedWishes();
}

// Saves child + toys to local storage
function saveToLocal(childId) {
    // Get the child's name
    fetch(`${url}/${childId}`)
        .then(res => res.json())
        .then(child => {
            const savedWishes = JSON.parse(localStorage.getItem('savedWishes') || '[]');
            
            // Find if this child already has wishes saved
            const existingWishIndex = savedWishes.findIndex(w => w.childId === childId);
            
            const wishData = {
                childId: childId,
                childName: child.name,
                toys: list.filter(item => item.childId === childId)
                    //This is a JavaScript .filter() method to create a new array containing only toys that match a specific childId
            };

            if (existingWishIndex >= 0) {
                savedWishes[existingWishIndex] = wishData;
            } else {
                savedWishes.push(wishData);
            }

            localStorage.setItem('savedWishes', JSON.stringify(savedWishes));
            loadSavedWishes();
        });
}

// Removes child + toys from local storage
function removeFromSaved(childId) {
    let savedWishes = JSON.parse(localStorage.getItem('savedWishes') || '[]');
    savedWishes = savedWishes.filter(wish => wish.childId !== childId);
    localStorage.setItem('savedWishes', JSON.stringify(savedWishes));
    loadSavedWishes();
}

fetchDataKids ();
fetchDataToys ();
loadSavedWishes ();