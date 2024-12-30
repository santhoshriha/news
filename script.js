document.addEventListener('DOMContentLoaded', () => {
    const channelsContainer = document.getElementById('channels-container');
    const bigThumbnailContainer = document.getElementById('big-thumbnail-container');
    const bigThumbnail = document.getElementById('big-thumbnail');
    const playButton = document.getElementById('play-button');
    const closeButton = document.getElementById('close-button');

    async function fetchVideos() {
        const url = 'https://raw.githubusercontent.com/santhoshriha/news/main/YouTube_Videos.json';
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const videos = await response.json();
            console.log('Fetched videos:', videos);  // Log the fetched videos for debugging
            displayVideos(videos);
        } catch (error) {
            console.error('Error fetching videos:', error);
        }
    }

    function displayVideos(videos) {
        channelsContainer.innerHTML = ''; // Clear existing content

        if (videos.length === 0) {
            channelsContainer.innerHTML = '<p>No videos found.</p>';
            return;
        }

        const channels = {};

        videos.forEach(video => {
            if (!channels[video.channelId]) {
                channels[video.channelId] = {
                    name: video.channelName,
                    videos: []
                };
            }
            channels[video.channelId].videos.push(video);
        });

        for (const channelId in channels) {
            const channel = channels[channelId];
            channel.videos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)); // Sort videos by date

            const channelDiv = document.createElement('div');
            channelDiv.className = 'channel-container';

            const channelHeader = document.createElement('div');
            channelHeader.className = 'channel-header';

            const channelName = document.createElement('div');
            channelName.className = 'channel-name';
            channelName.textContent = channel.name;

            channelHeader.appendChild(channelName);
            channelDiv.appendChild(channelHeader);

            const videoContainer = document.createElement('div');
            videoContainer.className = 'video-container';

            channel.videos.forEach(video => {
                const videoDiv = document.createElement('div');
                videoDiv.className = 'video';

                const thumbnail = document.createElement('img');
                thumbnail.src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
                thumbnail.alt = 'Video Thumbnail';
                thumbnail.className = 'thumbnail';

                const details = document.createElement('div');
                details.className = 'details';

                const title = document.createElement('div');
                title.className = 'title';
                title.textContent = video.title;

                const publishedAt = document.createElement('div');
                publishedAt.className = 'publishedAt';
                publishedAt.textContent = new Date(video.publishedAt).toLocaleString();

                details.appendChild(title);
                details.appendChild(publishedAt);

                videoDiv.appendChild(thumbnail);
                videoDiv.appendChild(details);
                videoContainer.appendChild(videoDiv);

                videoDiv.addEventListener('click', () => {
                    bigThumbnail.src = thumbnail.src;
                    bigThumbnailContainer.style.display = 'flex';
                    playButton.onclick = () => {
                        window.location.href = `https://www.youtube.com/watch?v=${video.videoId}`;
                    };
                });
            });

            channelDiv.appendChild(videoContainer);
            channelsContainer.appendChild(channelDiv);
        }

        closeButton.addEventListener('click', () => {
            bigThumbnailContainer.style.display = 'none';
        });
    }

    // Fetch and display videos on page load
    fetchVideos();
});
