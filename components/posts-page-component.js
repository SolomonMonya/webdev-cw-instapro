import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage } from "../index.js";
import { getToken, initLike, initDislike, } from "../api.js";

import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export const renderPostsPageComponent = ({ appEl }) => {
  // TODO: реализовать рендер постов из api
  console.log("Актуальный список постов:", posts);

  /**
   * TODO: чтобы отформатировать дату создания поста в виде "19 минут назад"
   * можно использовать https://date-fns.org/v2.29.3/docs/formatDistanceToNow
   */


  const postsHtml = posts.map((post, index) => {

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

    return `<li class="post" data-post-id=${post.id}>
            <div class="post-header" data-user-id=${post.user.id}>
                <img src="${
                  post.user.imageUrl
                }" class="post-header__user-image">
                <p class="post-header__user-name">${post.user.name}</p>
            </div>
            <div class="post-image-container">
              <img class="post-image" src="${post.imageUrl}">
            </div>
            <div class="post-likes">
              <button data-post-id="${index}" data-like="${
                post.isLiked
              }" class="like-button">
                  <img  src="${
                    post.isLiked
                      ? './assets/images/like-active.svg'
                      : './assets/images/like-not-active.svg'
                  }">
              </button>
              <p class="post-likes-text">
                <strong>${appLikers()}</strong>
              </p>
            </div>
            <p class="post-text">
              <span class="user-name">${post.user.name}</span>
              ${post.description}
            </p>
            <p class="post-date">
                ${formatDistanceToNow(new Date(post.createdAt), {
                  locale: ru,
                  includeSeconds: true,
                })}
              назад</p>
        </li>`;
  })
  .join('');

  const appHtml = `    <div class="page-container">
    <div class="header-container"></div>
    <ul class="posts">
      ${postsHtml}
    </ul>
  </div>`;

  appEl.innerHTML = appHtml;

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

          return renderPostsPageComponent({ appEl });

        });

      } else {
        posts[index].likes.length -= 1;
        posts[index].isLiked = false;
        initDislike({ posts, index }).then(() => {

          return renderPostsPageComponent({ appEl });

        });
      };

    });
  };

  for (let userEl of document.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  };
};