// IPTV M3U Playlist URL
const M3U_URL = 'https://raw.githubusercontent.com/iptv-org/iptv/master/streams/er.m3u';

// Proxy URL to avoid CORS issues
const PROXY_URL = 'https://api.allorigins.win/raw?url=';

let channels = [];
let hls = null;

// Parse M3U playlist
function parseM3U(content) {
    const lines = content.split('\n');
    const channels = [];
    let currentChannel = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('#EXTINF:')) {
            // Extract channel info
            const match = line.match(/#EXTINF:-?\d+\s*(.*)?,(.+)/);
            if (match) {
                currentChannel = {
                    info: match[1] || '',
                    name: match[2] ? match[2].trim() : 'Unknown Channel'
                };
            }
        } else if (line && !line.startsWith('#') && currentChannel) {
            // This is the stream URL
            currentChannel.url = line;
            channels.push(currentChannel);
            currentChannel = null;
        }
    }

    return channels;
}

// Load channels from M3U playlist
async function loadChannels() {
    try {
        const response = await fetch(PROXY_URL + encodeURIComponent(M3U_URL));
        const content = await response.text();
        channels = parseM3U(content);
        
        if (channels.length > 0) {
            displayChannels();
            // Automatically load the first channel
            loadStream(channels[0].url, 0);
        } else {
            showError('No channels found in the playlist.');
        }
    } catch (error) {
        console.error('Error loading channels:', error);
        // Fallback: Load default channel directly
        loadDefaultChannel();
    }
}

// Load default channel if fetch fails
function loadDefaultChannel() {
    channels = [{
        name: 'ERi-TV 1 (576p)',
        url: 'https://jmc-live.ercdn.net/eritreatv/eritreatv.m3u8',
        info: 'tvg-id="ERiTV1.er@SD"'
    }];
    displayChannels();
    loadStream(channels[0].url, 0);
}

// Display channels
function displayChannels() {
    const channelsDiv = document.getElementById('channels');
    
    if (channels.length === 0) {
        return;
    }

    const html = `
        <h2>Available Channels</h2>
        <div class="channel-list">
            ${channels.map((channel, index) => `
                <div class="channel-item ${index === 0 ? 'active' : ''}" 
                     data-index="${index}"
                     onclick="loadStream('${channel.url}', ${index})">
                    <div class="channel-name">${channel.name}</div>
                </div>
            `).join('')}
        </div>
    `;
    
    channelsDiv.innerHTML = html;
}

// Load stream
function loadStream(url, channelIndex) {
    const video = document.getElementById('video');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    
    // Show loading
    loading.style.display = 'block';
    error.style.display = 'none';
    
    // Update active channel
    document.querySelectorAll('.channel-item').forEach((item, index) => {
        if (index === channelIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Destroy previous HLS instance
    if (hls) {
        hls.destroy();
    }

    // Check if HLS is supported
    if (Hls.isSupported()) {
        hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });

        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            loading.style.display = 'none';
            video.play().catch(e => {
                console.log('Autoplay prevented:', e);
                // Unmute and try again
                video.muted = false;
            });
        });

        hls.on(Hls.Events.ERROR, function(event, data) {
            console.error('HLS error:', data);
            if (data.fatal) {
                loading.style.display = 'none';
                switch(data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        showError('Network error. Please check your connection or try again later.');
                        // Try to recover
                        hls.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        showError('Media error. Attempting to recover...');
                        hls.recoverMediaError();
                        break;
                    default:
                        showError('Fatal error loading stream. Please try another channel.');
                        break;
                }
            }
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = url;
        video.addEventListener('loadedmetadata', function() {
            loading.style.display = 'none';
            video.play();
        });
        video.addEventListener('error', function() {
            loading.style.display = 'none';
            showError('Error loading stream. Please try again.');
        });
    } else {
        loading.style.display = 'none';
        showError('Your browser does not support HLS streaming.');
    }
}

// Show error message
function showError(message) {
    const error = document.getElementById('error');
    error.textContent = message;
    error.style.display = 'block';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadChannels();
});
