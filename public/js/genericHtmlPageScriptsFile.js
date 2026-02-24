const output = document.querySelector('#output');
const button = document.querySelector('#get-posts-btn');
const form = document.querySelector('#add-post-form');

async function showPosts() {
    try {
        const res = await fetch('http://localhost:8080/api/posts');

        if(!res.ok) {
            throw new Error('Failed to fetch posts');
        }

        const posts = await res.json();
        output.innerHTML = '';

        posts.forEach(post => {
            const postElement = document.createElement("div");
            postElement.innerText = post.title;
            output.appendChild(postElement);
        });
    } catch (error) {
        console.log("Error fetching posts", error);
    }
}

async function addPost(event) {
    console.log("fired addPost");
    
    event.preventDefault();
    const formData = new FormData(this);
    const title = formData.get('title');

    try {
        const res = await fetch('http://localhost:8080/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({title})
        })

        if(!res.ok) {
            throw new Error('Failed to add new post');
        }

        const newPost = await res.json();

        const postElement = document.createElement('div');
        postElement.textContent = newPost.title;

        output.appendChild(postElement);

        showPosts();
    } catch (error) {
        console.log("Error saving post", error)
    }
}

button.addEventListener('click', showPosts);
form.addEventListener('submit', addPost);