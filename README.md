# 🎥 YouTube Video Analyzer

The **YouTube Video Analyzer** is a web application that allows users to analyze YouTube videos by fetching metadata, displaying video statistics, visualizing sentiment from descriptions and comments, and providing exportable reports in JSON, CSV, and PDF formats.

---

## 🚀 Features

- 🔍 Analyze YouTube video by URL or ID
- 📊 Display video statistics: title, views, likes, channel, etc.
- 🧠 Sentiment analysis for video description and comments
- 📝 Show transcript (mock)
- 💬 Comment search and display with author names
- 🌐 Word cloud from comments
- 📉 Sentiment chart visualization (positive, neutral, negative)
- 💾 Download analysis data as **JSON**, **CSV**, or **PDF**
- 🌙 Dark mode toggle
- 🖱 Drag and drop video URL support

---

## 🧰 Technologies Used

- HTML, CSS, JavaScript (Vanilla)
- [Chart.js](https://www.chartjs.org/) for sentiment charts
- [wordcloud2.js](https://github.com/timdream/wordcloud2.js) for comment word cloud
- [jsPDF](https://github.com/parallax/jsPDF) for PDF generation
- YouTube Data API v3

---

## 📦 Setup Instructions

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/youtube-video-analyzer.git
   cd youtube-video-analyzer
2.Add your YouTube API key to script.js:

const API_KEY = "YOUR_API_KEY"; // Replace with your actual YouTube API key
