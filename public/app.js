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
        <div class="shadow row rounded storyUn">
            <h3 class="title">${story.title}</h3>
            <p class="summary">${story.summary}</p>
            <div><a href="${story.link}">${story.link}</a></div>
            <button class="save-${story._id}">Save</button> </<button>
        </div>`);

        $(`.save-${story._id}`).on('click', (e) => {
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
        <div class="shadow row rounded story">
            <h3 class="title">${story.title}</h3>
            <p class="summary">${story.summary}</p>
            <p><a href="${story.link}">${story.link}</a></p>
            <button class="delete-${story._id}">Delete Story</button>
            <button class="add-note-${story._id}">Story Notes</button>
            <div class="note-${story._id}"></div>
        </div>`);

        $(`.delete-${story._id}`).on("click", (e) => {
            deleteStory(story);
        });

        $(`.add-note-${story._id}`).on("click", (e) => {
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

    const noteDiv =
        `<textarea rows="4" cols="50" class="note-text-${data._id}" name="comment" form="usrform">${note}</textarea>
    <button class="delete-note-${data._id}">Delete Note</button>
    <button class="save-note-${data._id}">Save Note</button>`

    console.log(data)

    $(`.note-${data._id}`).append(noteDiv)

    $(`.save-note-${data._id}`).on('click', function (e) {
        const text = $(`.note-text-${data._id}`).val();
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
        $(`.delete-note-${data._id}`).on('click', function (e) {
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