document.addEventListener('DOMContentLoaded', () => {
    const newsContainer = document.getElementById('news-container');
    const loadMoreButton = document.getElementById('load-more');
    let currentPage = 1;
    const articlesPerPage = 5;

    async function fetchRSSFeed(url) {
        const response = await fetch(url);
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'application/xml');
        const items = xml.querySelectorAll('item');
        const articles = [];

        items.forEach(item => {
            const title = item.querySelector('title').textContent;
            const link = item.querySelector('link').textContent;
            const description = item.querySelector('description').textContent;
            const enclosure = item.querySelector('enclosure');
            const image = enclosure ? enclosure.getAttribute('url') : null;

            articles.push({
                title,
                link,
                description,
                image
            });
        });

        return articles;
    }

    function createNewsItem(article, index) {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';
        newsItem.setAttribute('data-index', index);

        const newsImage = article.image ? `<img src="${article.image}" alt="${article.title}">` : '';
        newsItem.innerHTML = `
            ${newsImage}
            <h2>${article.title}</h2>
        `;

        newsItem.addEventListener('click', () => {
            localStorage.setItem('newsArticle', JSON.stringify(article));
            window.location.href = 'news.html';
        });

        return newsItem;
    }

    async function displayNews(page) {
        // Add your RSS feed URLs here
        const rssUrls = [
            'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
            'https://www.hindustantimes.com/rss/topnews/rssfeed.xml',
            'https://indianexpress.com/section/india/feed/',
            'https://feeds.feedburner.com/ndtvnews-top-stories'
        ];

        let articles = [];
        for (const url of rssUrls) {
            const rssArticles = await fetchRSSFeed(url);
            articles = articles.concat(rssArticles);
        }

        const start = (page - 1) * articlesPerPage;
        const end = start + articlesPerPage;
        const paginatedArticles = articles.slice(start, end);

        paginatedArticles.forEach((article, index) => {
            const newsItem = createNewsItem(article, start + index);
            newsContainer.appendChild(newsItem);
        });

        if (articles.length <= end) {
            loadMoreButton.style.display = 'none';
        } else {
            loadMoreButton.style.display = 'inline-block';
        }
    }

    loadMoreButton.addEventListener('click', () => {
        currentPage++;
        displayNews(currentPage);
    });

    displayNews(currentPage);
});