const API_KEY = "AIzaSyBocojCJEATjPwb7Jv53GHCjBs5zq4TjZg"; // Replace with your YouTube Data API key

// Theme toggle
const darkToggle = document.getElementById("darkToggle");
darkToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark");
});

// Drag-and-drop support
const dropZone = document.getElementById("dropZone");
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});
dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  const data = e.dataTransfer.getData("text");
  document.getElementById("videoInput").value = data;
  analyzeVideo();
});

// Include jsPDF from CDN in index.html
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

// Save as CSV
function downloadCSV(comments) {
  const headers = ["Author", "Comment"];
  const rows = comments.map(c => [c.author, `"${c.text.replace(/"/g, '""')}"`]);
  const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "comments.csv";
  a.click();
}

// Save as JSON
function downloadJSON(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "video_analysis.json";
  a.click();
}

// Save as PDF
function downloadPDF(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;

  doc.setFontSize(16);
  doc.text("YouTube Video Analysis", 10, y);
  y += 10;

  doc.setFontSize(12);
  doc.text(`Title: ${data.title}`, 10, y); y += 7;
  doc.text(`Channel: ${data.channel}`, 10, y); y += 7;
  doc.text(`Views: ${data.views}`, 10, y); y += 7;
  doc.text(`Likes: ${data.likes}`, 10, y); y += 7;
  doc.text(`Engagement: ${data.engagement}%`, 10, y); y += 7;
  doc.text(`Description Sentiment: ${data.descriptionSentiment}`, 10, y); y += 10;
  doc.text(`Comment Sentiment Summary:`, 10, y); y += 7;
  doc.text(`Positive: ${data.sentimentCounts.positive}`, 10, y); y += 7;
  doc.text(`Neutral: ${data.sentimentCounts.neutral}`, 10, y); y += 7;
  doc.text(`Negative: ${data.sentimentCounts.negative}`, 10, y); y += 10;

  doc.text("Top Comments:", 10, y);
  data.comments.slice(0, 5).forEach((c, i) => {
    y += 7;
    doc.text(`${i + 1}. ${c.author}: ${c.text.slice(0, 60)}...`, 10, y);
    if (y > 270) { doc.addPage(); y = 10; }
  });

  doc.save("video_analysis.pdf");
}

// Export all
document.getElementById("downloadBtn").addEventListener("click", () => {
  if (!window.analysisData) {
    alert("Analyze a video first.");
    return;
  }
  downloadJSON(window.analysisData);
  downloadCSV(window.analysisData.comments);
  downloadPDF(window.analysisData);
});


function getVideoId(url) {
  const regex = /(?:v=|\/)([0-9A-Za-z_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : url;
}

async function analyzeVideo() {
  const input = document.getElementById("videoInput").value.trim();
  const videoId = getVideoId(input);

  const resultDiv = document.getElementById("result");
  const thumbnailDiv = document.getElementById("thumbnail");
  const errorDiv = document.getElementById("error");
  const commentsDiv = document.getElementById("comments");
  const transcriptDiv = document.getElementById("transcript");
  const videoSentimentDiv = document.getElementById("videoSentiment");
  const engagementDiv = document.getElementById("engagement");
  const commentSentimentDiv = document.getElementById("commentSentiment");

  const sentimentTitle = document.getElementById("videoSentimentTitle");
  const transcriptTitle = document.getElementById("transcriptTitle");
  const commentSentimentTitle = document.getElementById("commentSentimentTitle");
  const searchInput = document.getElementById("searchInput");

  const chartCanvas = document.getElementById("sentimentChart");
  const wordCloudCanvas = document.getElementById("wordCloudCanvas");
  const wordCloudTitle = document.getElementById("wordCloudTitle");
  const sentimentChartTitle = document.getElementById("sentimentChartTitle");

  

  // Reset view
  resultDiv.style.display = "none";
  thumbnailDiv.style.display = "none";
  commentsDiv.style.display = "none";
  transcriptDiv.style.display = "none";
  engagementDiv.style.display = "none";
  videoSentimentDiv.style.display = "none";
  commentSentimentDiv.style.display = "none";
  sentimentTitle.style.display = "none";
  transcriptTitle.style.display = "none";
  commentSentimentTitle.style.display = "none";
  searchInput.style.display = "none";
  chartCanvas.style.display = "none";
  wordCloudCanvas.style.display = "none";
  sentimentChartTitle.style.display = "none";
  wordCloudTitle.style.display = "none";
  errorDiv.textContent = "";

  if (!videoId || videoId.length !== 11) {
    errorDiv.textContent = "Invalid YouTube video URL or ID.";
    return;
  }

  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      errorDiv.textContent = "Video not found or is private.";
      return;
    }

    const video = data.items[0];
    const snippet = video.snippet;
    const stats = video.statistics;

    resultDiv.innerHTML = `
      <h2>${snippet.title}</h2>
      <p><strong>Channel:</strong> ${snippet.channelTitle}</p>
      <p><strong>Description:</strong><br>${snippet.description}</p>
      <p><strong>Views:</strong> ${Number(stats.viewCount).toLocaleString()}</p>
      <p><strong>Likes:</strong> ${Number(stats.likeCount || 0).toLocaleString()}</p>
      <a class="watch-button" href="https://www.youtube.com/watch?v=${videoId}" target="_blank">Watch Video</a>
    `;
    resultDiv.style.display = "block";
    thumbnailDiv.innerHTML = `<img src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg" alt="Thumbnail">`;
    thumbnailDiv.style.display = "block";
    

    // Engagement
    const likeRatio = ((stats.likeCount || 0) / (stats.viewCount || 1) * 100).toFixed(2);
    engagementDiv.innerHTML = `<p><strong>Engagement (Likes/View):</strong> ${likeRatio}%</p>`;
    engagementDiv.style.display = "block";

    // Transcript placeholder
    transcriptDiv.innerHTML = `<p>This is a mock transcript for video ID: ${videoId}...</p>`;
    transcriptDiv.style.display = "block";
    transcriptTitle.style.display = "block";

    // Description sentiment
    const sentiment = analyzeSentiment(snippet.description);
    videoSentimentDiv.innerHTML = `<p><strong>Description Sentiment:</strong> ${sentiment}</p>`;
    videoSentimentDiv.style.display = "block";
    sentimentTitle.style.display = "block";

    // Fetch comments
    const commentResponse = await fetch(`https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&key=${API_KEY}`);
    const commentData = await commentResponse.json();

    const comments = commentData.items.map(item => {
      const snippet = item.snippet.topLevelComment.snippet;
      return {
        author: snippet.authorDisplayName,
        text: snippet.textDisplay
      };
    });

    commentsDiv.innerHTML = comments
      .map(c => `<p><strong>${c.author}:</strong> ${c.text}</p>`)
      .join("");
    commentsDiv.style.display = "block";
    searchInput.style.display = "block";

    // Filter comments by search
    searchInput.oninput = function () {
      const value = this.value.toLowerCase();
      commentsDiv.innerHTML = comments
        .filter(c => c.text.toLowerCase().includes(value))
        .map(c => `<p><strong>${c.author}:</strong> ${c.text}</p>`)
        .join("");
    };

    // Comment sentiment
    const scores = comments.map(c => analyzeSentiment(c.text));
    const pos = scores.filter(s => s === "Positive").length;
    const neg = scores.filter(s => s === "Negative").length;
    const neu = scores.length - pos - neg;

    commentSentimentDiv.innerHTML = `<p>Positive: ${pos} | Negative: ${neg} | Neutral: ${neu}</p>`;
    commentSentimentDiv.style.display = "block";
    commentSentimentTitle.style.display = "block";

    // Bar chart
    chartCanvas.style.display = "block";
    sentimentChartTitle.style.display = "block";

    if (window.sentimentChartInstance) {
      window.sentimentChartInstance.destroy();
    }

    window.sentimentChartInstance = new Chart(chartCanvas, {
      type: "bar",
      data: {
        labels: ["Positive", "Neutral", "Negative"],
        datasets: [{
          label: "Comment Sentiment Count",
          data: [pos, neu, neg],
          backgroundColor: ["#4CAF50", "#FFC107", "#F44336"]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
      }
    });

// Word cloud
wordCloudCanvas.style.display = "block";
wordCloudTitle.style.display = "block";

// Combine all comment texts into a single string
const commentText = comments.map(c => c.text).join(" ");
const wordFreq = {};
commentText.split(/\W+/).forEach(word => {
  const lower = word.toLowerCase();
  if (lower.length > 3) {
    wordFreq[lower] = (wordFreq[lower] || 0) + 1;
  }
});

window.analysisData = {
  title: snippet.title,
  channel: snippet.channelTitle,
  views: stats.viewCount,
  likes: stats.likeCount || 0,
  engagement: likeRatio,
  descriptionSentiment: sentiment,
  sentimentCounts: { positive: pos, neutral: neu, negative: neg },
  comments: comments.map((text, i) => ({
    author: commentData.items[i].snippet.topLevelComment.snippet.authorDisplayName,
    text
  }))
};


// Build word list
const entries = Object.entries(wordFreq)
  .sort((a, b) => b[1] - a[1]) // sort by frequency
  .slice(0, 100); // limit to top 100

// Clear previous canvas
wordCloudCanvas.width = wordCloudCanvas.clientWidth;
wordCloudCanvas.height = wordCloudCanvas.clientHeight;

// Render word cloud
WordCloud(wordCloudCanvas, {
  list: entries,
  gridSize: 8,
  weightFactor: 4,
  fontFamily: "Impact",
  color: "random-dark",
  backgroundColor: "transparent",
});
    // Store data for download
    latestAnalysisData = {
      videoTitle: snippet.title,
      channel: snippet.channelTitle,
      description: snippet.description,
      views: stats.viewCount,
      likes: stats.likeCount,
      engagementRatio: likeRatio,
      sentiment,
      comments
    };

  } catch (error) {
    console.error(error);
    errorDiv.textContent = "An error occurred while fetching data.";
  }
}

function analyzeSentiment(text) {
  const positiveWords = ["good", "great", "awesome", "amazing", "love", "cool"];
  const negativeWords = ["bad", "terrible", "worst", "hate", "boring"];

  let score = 0;
  text.toLowerCase().split(/\W+/).forEach(word => {
    if (positiveWords.includes(word)) score++;
    if (negativeWords.includes(word)) score--;
  });

  return score > 0 ? "Positive" : score < 0 ? "Negative" : "Neutral";
}

// Download functions
function downloadJSON(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "analysis.json";
  a.click();
  URL.revokeObjectURL(url);
}

function downloadCSV(data, filename = 'analysis.csv') {
  let csv = "Key,Value\n";
  for (let key in data) {
    if (Array.isArray(data[key])) {
      csv += `${key},"${JSON.stringify(data[key])}"\n`;
    } else {
      csv += `${key},"${data[key]}"\n`;
    }
  }

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

async function downloadPDF(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;

  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      doc.text(`${key}:`, 10, y);
      y += 10;
      value.forEach((item, index) => {
        const text = typeof item === 'string' ? item : `${item.author}: ${item.text}`;
        doc.text(`- ${text}`, 15, y);
        y += 10;
        if (y > 270) {
          doc.addPage();
          y = 10;
        }
      });
    } else {
      doc.text(`${key}: ${value}`, 10, y);
      y += 10;
    }
  }

  doc.save("analysis.pdf");
}

// Button click handlers
document.getElementById("download-json").addEventListener("click", () => {
  downloadJSON(latestAnalysisData);
});

document.getElementById("download-csv").addEventListener("click", () => {
  downloadCSV(latestAnalysisData);
});

document.getElementById("download-pdf").addEventListener("click", () => {
  downloadPDF(latestAnalysisData);
});