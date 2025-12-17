# ERi-TV Live Stream Web Application 🇪🇷

A simple, elegant web application for streaming Eritrean Television (ERi-TV) live broadcasts. This application fetches live stream sources from the [iptv-org/iptv](https://github.com/iptv-org/iptv) community project and provides an easy-to-use interface for watching ERi-TV channels.

## Features

- 📺 Live streaming of Eritrean TV channels
- 🎨 Modern, responsive design
- 📱 Mobile-friendly interface
- 🚀 Optimized for Cloudflare Pages deployment
- 🔄 Automatic channel loading from M3U playlist
- ⚡ HLS.js powered video player

## Live Demo

The application is deployed on Cloudflare Pages and accessible at your deployment URL.

## Stream Source

This application uses the M3U playlist from:
- **Source**: [iptv-org/iptv - Eritrea streams](https://github.com/iptv-org/iptv/blob/master/streams/er.m3u)
- **Format**: M3U playlist with HLS streams

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Video Player**: [HLS.js](https://github.com/video-dev/hls.js/)
- **Hosting**: Cloudflare Pages
- **Stream Protocol**: HLS (HTTP Live Streaming)

## Project Structure

```
Eritv-Web/
├── index.html      # Main HTML file
├── styles.css      # Styling and responsive design
├── app.js          # Application logic and stream handling
└── README.md       # This file
```

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/Idris7umed/Eritv-Web.git
   cd Eritv-Web
   ```

2. Open `index.html` in a web browser, or use a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js
   npx serve
   ```

3. Navigate to `http://localhost:8000` in your browser

## Deployment to Cloudflare Pages

### Method 1: GitHub Integration (Recommended)

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **Pages** → **Create a project**
3. Connect your GitHub account and select the `Eritv-Web` repository
4. Configure the build settings:
   - **Build command**: (leave empty - no build needed)
   - **Build output directory**: `/`
   - **Root directory**: `/`
5. Click **Save and Deploy**

### Method 2: Direct Upload

1. Log in to your Cloudflare Dashboard
2. Go to **Pages** → **Create a project** → **Direct Upload**
3. Upload the project files (`index.html`, `styles.css`, `app.js`)
4. Your site will be live immediately

## How It Works

1. **Fetching Playlist**: The app fetches the M3U playlist from the iptv-org GitHub repository
2. **Parsing Streams**: The M3U file is parsed to extract channel names and stream URLs
3. **HLS Playback**: HLS.js is used to play the HLS streams in the browser
4. **Fallback Support**: Native HLS support is used on Safari/iOS devices

## Browser Compatibility

- ✅ Chrome/Edge (Latest)
- ✅ Firefox (Latest)
- ✅ Safari (Latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Credits

- Stream sources: [iptv-org/iptv](https://github.com/iptv-org/iptv)
- Video player: [HLS.js](https://github.com/video-dev/hls.js/)
- Hosted on: [Cloudflare Pages](https://pages.cloudflare.com/)

## License

This project is open source and available for educational purposes. Stream content rights belong to their respective owners.

## Support

For issues or questions, please open an issue on the [GitHub repository](https://github.com/Idris7umed/Eritv-Web/issues).