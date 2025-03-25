class BlogManager {
    constructor(config) {
        this.postsPerPage = config.postsPerPage || 5;
        this.currentPage = 1;
        this.postsContainer = document.querySelector(config.postsContainer);
        this.paginationContainer = document.querySelector(config.paginationContainer);
        this.totalPosts = 0;
        this.posts = [];
    }

    async init() {
        try {
            // Use relative path for posts.json
            const response = await fetch('./posts/posts.json');
            const data = await response.json();
            this.posts = data.posts;
            this.totalPosts = this.posts.length;
            this.render();
        } catch (err) {
            console.error('Failed to load posts:', err);
        }
    }

    async loadPost(postId) {
        try {
            // Use relative path for post HTML files
            const response = await fetch(`./index-blog/posts/${postId}.html`);
            const text = await response.text();
            
            // Create a temporary container to parse HTML
            const temp = document.createElement('div');
            temp.innerHTML = text;
            
            // Extract only paragraph content
            const paragraphs = temp.getElementsByTagName('p');
            return Array.from(paragraphs).map(p => p.outerHTML).join('\n');
        } catch (err) {
            console.error(`Failed to load post ${postId}:`, err);
            return null;
        }
    }

    async render() {
        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        const currentPosts = this.posts.slice(startIndex, endIndex);

        // Clear current posts
        this.postsContainer.innerHTML = '';

        // Load and render each post
        for (const post of currentPosts) {
            const postContent = await this.loadPost(post.id);
            const postElement = this.createPostElement(post, postContent);
            this.postsContainer.appendChild(postElement);
        }

        this.renderPagination();
    }

    createPostElement(post, content) {
        const wrapper = document.createElement('div');
        wrapper.className = 'b-content-item b-wrapper';
        wrapper.style.cssText = 'margin-bottom: 20px; background: #fff; box-shadow: 0 0 0 1px rgba(0,0,0,.1), 0 1px 8px -2px rgba(0,0,0,.1); padding: 15px;';
        
        wrapper.innerHTML = `
            <h2 class="b-content-item__title">
                <a href="./index-blog/posts/${post.id}.html" class="b-link">${post.title}</a>
            </h2>
            <div class="b-content-item__content">
                ${content}
                <div style="color: #999; font-size: 13px; margin-top: 10px;">
                    Выложено <time>${post.date}</time> • ${post.readTime} мин. чтения
                </div>
            </div>
        `;
        return wrapper;
    }

    renderPagination() {
        const totalPages = Math.ceil(this.totalPosts / this.postsPerPage);
        
        this.paginationContainer.innerHTML = `
            <button class="button button_size_m button_theme_action" 
                    ${this.currentPage === 1 ? 'disabled' : ''} 
                    onclick="blog.prevPage()">
                <span class="button__text">Назад</span>
            </button>
            <span style="margin: 0 10px;">${this.currentPage} страница из ${totalPages}</span>
            <button class="button button_size_m button_theme_action" 
                    ${this.currentPage === totalPages ? 'disabled' : ''} 
                    onclick="blog.nextPage()">
                <span class="button__text">Вперёд</span>
            </button>
        `;
    }

    nextPage() {
        const totalPages = Math.ceil(this.totalPosts / this.postsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.render();
        }
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.render();
        }
    }
}
