window.addEventListener('DOMContentLoaded', async () => {
  const utils = {
    containsRerum: function (text) {
      return text && text.toLowerCase().includes('rerum');
    },

    escapeHtml: function (text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },
  };

  const dataManager = {
    posts: [],
    comments: [],

    init: async function () {
      const postUrl =
        'https://my-json-server.typicode.com/ukind/simple-post-report/posts';
      const commentUrl =
        'https://my-json-server.typicode.com/ukind/simple-post-report/comments';
      const fetcher = [fetch(postUrl), fetch(commentUrl)];

      return Promise.allSettled(fetcher).then(async (promises) => {
        if (promises[0].status === 'fulfilled') {
          this.posts = await promises[0].value.json();
        } else {
          throw new Error(
            `Network response error for posts: ${promises[0].reason}`,
          );
        }

        if (promises[1].status === 'fulfilled') {
          this.comments = await promises[1].value.json();
        } else {
          throw new Error(
            `Network response error for comments: ${promises[1].reason}`,
          );
        }
      });
    },
  };

  const router = {
    elements: null,

    init: function (domElements) {
      this.elements = domElements;
      window.addEventListener('hashchange', () => this.handleHashChange());
    },

    handleHashChange: function () {
      const hash = window.location.hash.slice(1) || 'posts';
      const viewName = this.showView(hash);

