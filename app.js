const M3U_URL = 'https://raw.githubusercontent.com/iptv-org/iptv/master/streams/er.m3u';
const PROXY_URL = 'https://api.allorigins.win/raw?url=';

let channels = [];
let hls = null;

function parseM3U(content) {
    const lines = content.split('\n');
    const channels = [];
    let currentChannel = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('#EXTINF:')) {
            const match = line.match(/#EXTINF:-?\d+\s*(.*)?,(.+)/);
            if (match) {
                currentChannel = {
                    info: match[1] || '',
                    name: match[2] ? match[2].trim() : 'Unknown Channel'
                };
            }
        } else if (line && !line.startsWith('#') && currentChannel) {
            currentChannel.url = line;
            channels.push(currentChannel);
            currentChannel = null;
        }
    }

    return channels;
}

async function loadChannels() {
    try {
        const response = await fetch(PROXY_URL + encodeURIComponent(M3U_URL));
        const content = await response.text();
        channels = parseM3U(content);
        
        if (channels.length > 0) {
            displayChannels();
            loadStream(channels[0].url, 0);
        } else {
            showError('No channels found in the playlist.');
        }
    } catch (error) {
        console.error('Error loading channels:', error);
        loadDefaultChannel();
    }
}

function loadDefaultChannel() {
    channels = [{
        name: 'ERi-TV 1 (576p)',
        url: 'https://jmc-live.ercdn.net/eritreatv/eritreatv.m3u8',
        info: 'tvg-id="ERiTV1.er@SD"'
    }];
    displayChannels();
    loadStream(channels[0].url, 0);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

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
                     data-index="${index}">
                    <div class="channel-name">${escapeHtml(channel.name)}</div>
                </div>
            `).join('')}
        </div>
    `;
    
    channelsDiv.innerHTML = html;
    
    const channelItems = channelsDiv.querySelectorAll('.channel-item');
    channelItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            loadStream(channels[index].url, index);
        });
    });
}

function loadStream(url, channelIndex) {
    const video = document.getElementById('video');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    
    loading.style.display = 'block';
    error.style.display = 'none';
    
    // Pause current video immediately for faster switching
    video.pause();
    
    document.querySelectorAll('.channel-item').forEach((item, index) => {
        if (index === channelIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    if (hls) {
        hls.destroy();
        hls = null;
    }

    if (Hls.isSupported()) {
        hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 30,
            maxBufferLength: 20,
            maxMaxBufferLength: 30,
            maxBufferSize: 30 * 1000 * 1000,
            maxBufferHole: 0.5,
            highBufferWatchdogPeriod: 1,
            nudgeOffset: 0.1,
            nudgeMaxRetry: 5,
            maxFragLookUpTolerance: 0.2,
            liveSyncDurationCount: 2,
            liveMaxLatencyDurationCount: 5,
            liveDurationInfinity: false,
            manifestLoadingTimeOut: 10000,
            manifestLoadingMaxRetry: 3,
            manifestLoadingRetryDelay: 500,
            startLevel: -1,
            abrEwmaDefaultEstimate: 500000
        });

        hls.loadSource(url);
        hls.attachMedia(video);

        // Start playing as soon as manifest is parsed
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            video.play().catch(e => {
                console.log('Autoplay prevented:', e);
                showError('Click the play button to start the stream');
            });
        });
        
        // Hide loading indicator when first fragment is loaded for faster perceived performance
        let firstFragmentLoaded = false;
        hls.on(Hls.Events.FRAG_LOADED, function(event, data) {
            if (!firstFragmentLoaded) {
                loading.style.display = 'none';
                firstFragmentLoaded = true;
            }
        });

        hls.on(Hls.Events.ERROR, function(event, data) {
            console.error('HLS error:', data);
            if (data.fatal) {
                loading.style.display = 'none';
                switch(data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        showError('Network error. Please check your connection or try again later.');
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
        video.src = url;
        video.addEventListener('loadedmetadata', function() {
            loading.style.display = 'none';
            video.play().catch(e => {
                console.log('Autoplay prevented:', e);
                showError('Click the play button to start the stream');
            });
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

function showError(message) {
    const error = document.getElementById('error');
    error.textContent = message;
    error.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', function() {
    loadChannels();
});

document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || 
        (e.ctrlKey && e.shiftKey && e.key === 'J') || (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
    }
});
