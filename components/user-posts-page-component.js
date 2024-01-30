import { renderHeaderComponent } from "./header-component.js";
import { posts } from "../index.js";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { initLike, initDislike, getToken } from "../api.js";

export const renderUserPostsPageComponent = ({ appEl }) => {

    const appHtml = posts.map((post, index) => {

        const createdTimeToNow = formatDistanceToNow(new Date(post.createdAt), {locale: ru});

        const numLikes = post.likes.length;
        let firstLiker = null;
        const whoLike = String((post.likes.length - 1));

        const appLikers = () => {
            if (numLikes === 0) {
                return "";
            } else if (numLikes === 1) {
                firstLiker = post.likes[0].name;
                return `Нравится: <span><strong>${firstLiker}</strong></span>`;
            } else if (numLikes > 1) {
                firstLiker = post.likes[0].name;
                return `Нравится: <span><strong>${firstLiker}</strong></span> и ещё <span></span><span><strong>${whoLike}</strong></span>`;
            };
        };

        return `
            <ul class="posts">     
                <li class="post">
                    <div class="post-image-container">
                        <img class="post-image" src="${post.imageUrl}">
                    </div>
                    <div class="post-likes">
                        <button data-post-id="${index}" class="like-button">
                            <img style="${post.isLiked === false ? "display: block" : "display: none"}" src="./assets/images/like-not-active.svg">
                            <img style="${post.isLiked === true ? "display: block" : "display: none"}" src="./assets/images/like-active.svg">
                        </button>
                        <p class="post-likes-text">${appLikers()}</p>
                    </div>
                    <p class="post-text">
                        <span class="user-name">${post.user.name}</span>
                        ${post.description}
                    </p>
                    <p class="post-date">${createdTimeToNow}</p>
                </li>
                <br>
            </ul>`;
    });

    appEl.innerHTML = `
        <div class="page-container">
            <div class="header-container"></div>
            <div class="posts-user-header">
                <img src="${posts[0].user.imageUrl}" class="posts-user-header__user-image">
                <p class="posts-user-header__user-name">${posts[0].user.name}</p>
            </div>
            ${appHtml}
        </div>`;


    renderHeaderComponent({
        element: document.querySelector(".header-container"),
    });

    const likeButtons = document.querySelectorAll(".like-button");

    for (let likeButton of likeButtons) {

        if (getToken() === undefined) {
        return likeButton.disabled = true;
        } else {
        likeButton.disabled = false;
        };

        likeButton.addEventListener("click", () => {
            const index = likeButton.dataset.postId;   

            if (posts[index].isLiked === false) {

                posts[index].likes.length += 1;
                posts[index].isLiked = true;

                initLike({ posts, index }).then(() => {
                    
                    return renderUserPostsPageComponent({ appEl });

                });

            } else {

                posts[index].likes.length -= 1;
                posts[index].isLiked = false;

                initDislike({ posts, index }).then(() => {

                    return renderUserPostsPageComponent({ appEl });

                });
            };

        });
    };
};