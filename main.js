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

      if (viewName === 'posts') {
        postsView.renderPosts();
      } else if (viewName === 'reports') {
        reportsView.renderReports();
      }
    },

    showView: function (viewName) {
      this.elements.postsView.classList.add('view--hidden');
      this.elements.reportsView.classList.add('view--hidden');

      if (viewName === 'posts') {
        this.elements.postsView.classList.remove('view--hidden');
      } else if (viewName === 'reports') {
        this.elements.reportsView.classList.remove('view--hidden');
      }

      this.updateActiveNavLink(viewName);
      return viewName;
    },

    updateActiveNavLink: function (viewName) {
      this.elements.navLinks.forEach((link) => {
        link.classList.remove('nav__link--active');
        if (link.dataset.view === viewName) {
          link.classList.add('nav__link--active');
        }
      });
    },
  };

  const postsView = {
    elements: null,
    dataManager: null,
    appState: null,

    init: function (domElements, dataMgr, appSt) {
      this.elements = domElements;
      this.dataManager = dataMgr;
      this.appState = appSt;
      this.setupEventListeners();
    },

    setupEventListeners: function () {
      this.elements.searchButton.addEventListener('click', () =>
        this.searchPosts(),
      );

      this.elements.closeModalButton.addEventListener('click', () =>
        this.hideComments(),
      );

      this.elements.commentsModal.addEventListener('click', (e) => {
        if (
          e.target ===
          this.elements.commentsModal.querySelector('.comments-modal__overlay')
        ) {
          this.hideComments();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (
          e.key === 'Escape' &&
          !this.elements.commentsModal.classList.contains(
            'comments-modal--hidden',
          )
        ) {
          this.hideComments();
        }
      });
    },

    renderPosts: function (posts) {
      const postsToRender = posts || this.appState.filteredPosts;
      this.elements.postsTableBody.innerHTML = '';

      if (postsToRender.length === 0) {
        const row = document.createElement('tr');
        row.className = 'posts-table__row';
        row.innerHTML = `
          <td colspan="5" class="posts-table__cell" style="text-align: center; color: #6c757d;">
            No posts found. Try a different search term.
          </td>
        `;
        this.elements.postsTableBody.appendChild(row);
        return;
      }

      postsToRender.forEach((post) => {
        const row = document.createElement('tr');
        const hasRerum = utils.containsRerum(post.body);
        row.className = `posts-table__row${hasRerum ? ' posts-table__row--highlighted' : ''}`;

        row.innerHTML = `
          <td class="posts-table__cell">${utils.escapeHtml(String(post.id))}</td>
          <td class="posts-table__cell">${utils.escapeHtml(post.title)}</td>
          <td class="posts-table__cell">${utils.escapeHtml(post.body)}</td>
          <td class="posts-table__cell">${utils.escapeHtml(String(post.userId))}</td>
          <td class="posts-table__cell posts-table__cell--actions">
            <button class="posts-table__action-btn" data-post-id="${post.id}">
              View Comments
            </button>
          </td>
        `;

        this.elements.postsTableBody.appendChild(row);
      });

      document
        .querySelectorAll('.posts-table__action-btn')
        .forEach((button) => {
          button.addEventListener('click', (e) => {
            const postId = parseInt(e.target.dataset.postId);
            this.showComments(postId);
          });
        });
    },

    searchPosts: function () {
      const query = this.elements.searchInput.value.trim().toLowerCase();

      if (!query) {
        this.appState.filteredPosts = [...this.dataManager.posts];
      } else {
        this.appState.filteredPosts = this.dataManager.posts.filter((post) => {
          const titleMatch = post.title.toLowerCase().includes(query);
          const bodyMatch = post.body.toLowerCase().includes(query);
          return titleMatch || bodyMatch;
        });
      }

      this.renderPosts(this.appState.filteredPosts);
    },

    showComments: function (postId) {
      const postComments = this.dataManager.comments.filter(
        (comment) => comment.postId === postId,
      );

      this.elements.commentsContent.innerHTML = '';

      if (postComments.length === 0) {
        this.elements.commentsContent.innerHTML = `
          <p class="comments-modal__empty">No comments found for this post.</p>
        `;
      } else {
        postComments.forEach((comment) => {
          const commentDiv = document.createElement('div');
          commentDiv.className = 'comments-modal__comment';
          commentDiv.innerHTML = `
            <div class="comments-modal__comment-name">${utils.escapeHtml(comment.name)}</div>
            <div class="comments-modal__comment-email">${utils.escapeHtml(comment.email)}</div>
            <div class="comments-modal__comment-body">${utils.escapeHtml(comment.body)}</div>
          `;
          this.elements.commentsContent.appendChild(commentDiv);
        });
      }

      this.elements.commentsModal.classList.remove('comments-modal--hidden');
    },

    hideComments: function () {
      this.elements.commentsModal.classList.add('comments-modal--hidden');
    },
  };

  const reportsView = {
    elements: null,
    dataManager: null,

    init: function (domElements, dataMgr) {
      this.elements = domElements;
      this.dataManager = dataMgr;
    },

    renderReports: function () {
      this.renderRerumCount();
      this.renderPostsPerUser();
    },

    renderRerumCount: function () {
      const rerumCount = this.dataManager.posts.filter((post) =>
        utils.containsRerum(post.body),
      ).length;

      this.elements.rerumCount.textContent = rerumCount;
    },

    renderPostsPerUser: function () {
      const postsPerUser = {};

      this.dataManager.posts.forEach((post) => {
        const userId = post.userId;
        if (!postsPerUser[userId]) {
          postsPerUser[userId] = 0;
        }
        postsPerUser[userId]++;
      });

      const userEntries = Object.entries(postsPerUser);

      this.elements.postsPerUserBody.innerHTML = '';

      userEntries.forEach(([userId, count]) => {
        const row = document.createElement('tr');
        row.className = 'reports-table__row';
        row.innerHTML = `
          <td class="reports-table__cell">${utils.escapeHtml(userId)}</td>
          <td class="reports-table__cell">${utils.escapeHtml(String(count))}</td>
        `;
        this.elements.postsPerUserBody.appendChild(row);
      });
    },
  };

  const app = {
    state: {
      currentView: 'posts',
      searchQuery: '',
      filteredPosts: [],
    },

    elements: {
      postsView: document.getElementById('posts-view'),
      reportsView: document.getElementById('reports-view'),
      postsTableBody: document.getElementById('posts-table-body'),
      postsPerUserBody: document.getElementById('posts-per-user-body'),
      rerumCount: document.getElementById('rerum-count'),
      searchInput: document.getElementById('search-input'),
      searchButton: document.getElementById('search-button'),
      commentsModal: document.getElementById('comments-modal'),
      commentsContent: document.getElementById('comments-content'),
      closeModalButton: document.getElementById('close-modal'),
      navLinks: document.querySelectorAll('.nav__link'),
    },

    init: async function () {
      await dataManager.init();
      this.state.filteredPosts = [...dataManager.posts];
      router.init(this.elements);
      postsView.init(this.elements, dataManager, this.state);
      reportsView.init(this.elements, dataManager);
      this.start();
    },

    start: function () {
      const initialHash = window.location.hash.slice(1) || 'posts';
      this.state.currentView = router.showView(initialHash);

      if (this.state.currentView === 'posts') {
        postsView.renderPosts();
      } else if (this.state.currentView === 'reports') {
        reportsView.renderReports();
      }
    },
  };

  await app.init();
});
