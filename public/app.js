const saved = window.location.pathname === '/saved';

function loadStories() {
    const callback = saved ? displaySavedStoryList : displayUnsavedStoryList;
    $.get(`/stories?saved=${saved}`, callback)
}

function displayUnsavedStoryList(storyList) {
    console.log(storyList);
    $(".root").empty();

    // generate the HTML for all of the stories that we scraped
    for (let i = 0; i < storyList.length; i++) {
        const story = storyList[i]

        $(".root").append(`      
        <div class="shadow card rounded story">
            <h3 class="title">${story.title}</h3>
            <p class="summary">${story.summary}</p>
            <div><a href="${story.link}">Link to full story</a></div>
            <div class="story-btns">
                <button id="save-${story._id}">Save</button> 
            </div>
        </div>`);

        $(`#save-${story._id}`).on('click', (e) => {
            saveStory(story);
        });
    }
}

function displaySavedStoryList(storyList) {
    console.log(storyList);
    $(".root").empty();

    // generate the HTML for all of the stories that we scraped
    for (let i = 0; i < storyList.length; i++) {
        const story = storyList[i]

        $(".root").append(`      
        <div class="shadow card rounded story">
            <h3 class="title">${story.title}</h3>
            <p class="summary">${story.summary}</p>
            <p><a href="${story.link}">${story.link}</a></p>
            <div class="story-btns">
                <button class="btn btn-warning m-1" id="delete-${story._id}">Delete Story</button>
                <button class="btn btn-light m-1" id="add-note-${story._id}">Story Notes</button>
            </div>
            <div id="note-${story._id}"></div>
        </div>`);

        $(`#delete-${story._id}`).on("click", (e) => {
            deleteStory(story);
        });

        $(`#add-note-${story._id}`).on("click", (e) => {
            showStoryNote(story);
        });
    }
}

function saveStory(story) {
    $.ajax({
        method: "PUT",
        url: "/story/" + story._id
    }).then(function (data) {
        loadStories();
        console.log("this was saved" + story);
    })
}

function deleteStory(story) {
    $.ajax({
        method: "DELETE",
        url: "/story/" + story._id
    }).then(function (data) {
        loadStories();
        console.log("this was saved" + story);
    })
}

function showStoryNote(story) {
    $.ajax({
        method: "GET",
        url: "/story/" + story._id
    }).then(function (data) {
        displayNote(data);
    })
}

$('.scrape-btn').on('click', function (e) {
    spinny();
    $.ajax({
        method: "GET",
        url: "/scrape"
    }).then(function (data) {
        loadStories();
    })
});

$('.clear-btn').on('click', function (e) {
    $.ajax({
        method: "DELETE",
        url: "/stories"
    }).then(function (data) {
        loadStories();
    })
});

function spinny() {
    $('.root').append(`<div class="loader"></div>`)
}

function displayNote(data) {
    let note = '';
    if (data.note && data.note.text) {
        note = data.note.text;
    }

    const noteDiv = `
    <div class="note">
        <textarea rows="4" cols="50" id="note-text-${data._id}" name="comment" form="usrform">${note}</textarea>
        <div class="story-btns">
            <button class="btn btn-warning m-1" id="delete-note-${data._id}">Delete Note</button>
            <button class="btn btn-dark m-1" id="save-note-${data._id}">Save Note</button>
        </div>
    </div>`

    console.log(data)

    $(`#note-${data._id}`).append(noteDiv)

    $(`#save-note-${data._id}`).on('click', function (e) {
        const text = $(`#note-text-${data._id}`).val();
        console.log('saving note: ', text);
        $.ajax({
            method: "POST",
            url: "/story/" + data._id,
            data: {
                text,
            }
        }).then(function (data) {
            console.log('response: ', data);
            loadStories();
        })
    });

    if (data.note) {
        $(`#delete-note-${data._id}`).on('click', function (e) {
            $.ajax({
                method: "DELETE",
                url: "/note/" + data.note._id
            }).then(function (data) {
                loadStories();
            })
        });
    }
}

loadStories();