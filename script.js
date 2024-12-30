const API_KEY = 'AIzaSyAotb7tDK4R8laDuTVk_l2Z_G4_K3kx_4A';  // Replace with your YouTube Data API key

// Function to fetch YouTube videos and update the Google Sheet
function fetchYouTubeVideos() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const channels = [
        { id: 'UCq-Fj5jknLsUf-MWSy4_brA', name: 'Asianet News' },  // Replace with actual channel IDs and names
        // Add more channels here
    ];

    channels.forEach(channel => {
        const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${channel.id}&part=snippet,id&order=date&maxResults=10`;
        const response = UrlFetchApp.fetch(url);
        const data = JSON.parse(response.getContentText());

        const videos = data.items;
        const currentData = sheet.getDataRange().getValues();
        const existingIds = currentData.map(row => row[2]);  // Assuming the third column is Video ID

        videos.forEach(video => {
            const videoId = video.id.videoId;
            const title = video.snippet.title;
            const publishedAt = video.snippet.publishedAt;

            if (!existingIds.includes(videoId)) {
                sheet.appendRow([channel.id, channel.name, videoId, title, publishedAt]);
            }
        });
    });
}

// Function to create a JSON file from Google Sheet data and push it to GitHub
function createJsonFile() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();
    const json = data.slice(1).map(row => ({
        channelId: row[0],
        channelName: row[1],
        videoId: row[2],
        title: row[3],
        publishedAt: row[4]
    }));

    const jsonString = JSON.stringify(json);
    pushToGitHub(jsonString);
}

// Function to push JSON data to GitHub
function pushToGitHub(jsonString) {
    const token = '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'; // Replace with your GitHub token
    const repo = 'santhoshriha/news'; // Replace with your GitHub repo
    const path = 'YouTube_Videos.json'; // Replace with the path to your JSON file in the repo
    const message = 'Update JSON data from Google Sheet';
    const url = `https://api.github.com/repos/${repo}/contents/${path}`;

    const headers = {
        Authorization: 'token ' + token,
        'Content-Type': 'application/json'
    };

    try {
        // Get the current content of the file to obtain the sha
        const response = UrlFetchApp.fetch(url, { headers: headers, muteHttpExceptions: true });
        const responseCode = response.getResponseCode();
        let currentSha = null;

        if (responseCode === 200) {
            const currentContent = JSON.parse(response.getContentText());
            currentSha = currentContent.sha;
        } else if (responseCode !== 404) {
            console.error('Error fetching file:', response.getContentText());
            throw new Error('Failed to fetch file from GitHub. Response code: ' + responseCode);
        }

        const payload = {
            message: message,
            content: Utilities.base64Encode(jsonString),
            sha: currentSha
        };

        const options = {
            method: 'PUT',
            headers: headers,
            payload: JSON.stringify(payload),
            muteHttpExceptions: true
        };

        const putResponse = UrlFetchApp.fetch(url, options);
        if (putResponse.getResponseCode() !== 200) {
            console.error('Error updating file:', putResponse.getContentText());
            throw new Error('Failed to update file on GitHub. Response code: ' + putResponse.getResponseCode());
        }

        console.log('File updated successfully.');
    } catch (error) {
        console.error('Error in pushToGitHub:', error);
    }
}

// Scheduled function to fetch videos and update JSON file on GitHub
function scheduledUpdate() {
    fetchYouTubeVideos();
    createJsonFile();
}

// Function to create a time-driven trigger
function createTrigger() {
    ScriptApp.newTrigger('scheduledUpdate')
             .timeBased()
             .everyMinutes(5) // Set the interval to your needs
             .create();
}
