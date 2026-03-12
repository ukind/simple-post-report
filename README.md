Code structure:

- I split it by its domain responsibilities and methods: there is utils, dataManager, router, postsView and reportsView

Approach: Searching and filter

- The search and filtering is case-insensitive since its not specific it should be sensitive. it search the title and body of content
- if the search input box is empty, it shows all posts
- the filtered result will be put in `filteredPosts`

Approch: Calculating the reports

- for rerum words: it will test first if the body contains "rerum" and it case-insensitive
- if it contains rerum, it will be count via filter since the posts is array
- then display the count in front-end

UI/UX styling:

- I use CSS reset for cross consistentcy accross browser
- I use BEM approach for styling organized
- it have responsive design (but it from AI)
