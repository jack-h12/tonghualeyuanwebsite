// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Generate more stars dynamically
function createStars() {
    const starsContainer = document.getElementById('stars');
    const twinklingContainer = document.getElementById('twinkling');
    
    // Create additional stars for more density
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.position = 'absolute';
        star.style.width = Math.random() * 3 + 'px';
        star.style.height = star.style.width;
        star.style.backgroundColor = 'white';
        star.style.borderRadius = '50%';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.opacity = Math.random();
        star.style.boxShadow = `0 0 ${Math.random() * 3 + 2}px white`;
        starsContainer.appendChild(star);
        
        // Twinkling effect
        if (Math.random() > 0.7) {
            const twinkle = star.cloneNode(true);
            twinkle.style.animation = `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`;
            twinklingContainer.appendChild(twinkle);
        }
    }
}

// Add twinkle animation
const style = document.createElement('style');
style.textContent = `
    @keyframes twinkle {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
    }
`;
document.head.appendChild(style);

// Initialize stars
createStars();

// Contact form handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        // Simple validation
        if (name && email && message) {
            // In a real application, you would send this to a server
            alert(`谢谢您，${name}！我们已经收到您的消息，会尽快回复您！🌙✨`);
            contactForm.reset();
        }
    });
}

// Add scroll effect to navbar
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.background = 'rgba(10, 14, 39, 0.98)';
    } else {
        navbar.style.background = 'rgba(10, 14, 39, 0.9)';
    }
    
    lastScroll = currentScroll;
});

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        hero.style.opacity = 1 - scrolled / 500;
    }
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections and cards
document.querySelectorAll('section, .video-card, .feature').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// YouTube Channel Configuration
const YOUTUBE_CHANNEL_HANDLE = '@ChineseFairyTales-l3c';
const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@ChineseFairyTales-l3c';

// Fetch YouTube videos from channel
async function fetchYouTubeVideos() {
    const videoGrid = document.getElementById('videoGrid');
    if (!videoGrid) return;

    // Try RSS feed first (more reliable)
    try {
        await fetchVideosFromRSS();
    } catch (error) {
        console.error('RSS feed failed, trying HTML parsing:', error);
        // Fallback to HTML parsing
        try {
            const channelPageUrl = `https://www.youtube.com/${YOUTUBE_CHANNEL_HANDLE}/videos`;
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(channelPageUrl)}`;
            
            const response = await fetch(proxyUrl);
            const data = await response.json();
            const html = data.contents;
            
            // Parse video data from the HTML
            const videoData = parseYouTubeVideos(html);
            
            if (videoData.length > 0) {
                displayVideos(videoData);
            } else {
                showErrorMessage();
            }
        } catch (e) {
            console.error('All methods failed:', e);
            showErrorMessage();
        }
    }
}

// Parse videos from YouTube channel page HTML
function parseYouTubeVideos(html) {
    const videos = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // YouTube stores video data in script tags with ytInitialData
    const scriptTags = doc.querySelectorAll('script');
    let ytInitialData = null;
    
    for (let script of scriptTags) {
        const text = script.textContent;
        if (text.includes('var ytInitialData')) {
            try {
                const match = text.match(/var ytInitialData = ({.+?});/s);
                if (match) {
                    ytInitialData = JSON.parse(match[1]);
                    break;
                }
            } catch (e) {
                console.error('Error parsing ytInitialData:', e);
            }
        }
    }
    
    if (ytInitialData) {
        try {
            const contents = ytInitialData?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[1]?.tabRenderer?.content?.richGridRenderer?.contents;
            
            if (contents) {
                contents.forEach((item, index) => {
                    if (index >= 6) return; // Limit to 6 videos
                    const video = item?.richItemRenderer?.content?.videoRenderer;
                    if (video) {
                        const videoId = video.videoId;
                        const title = video.title?.runs?.[0]?.text || 'Untitled';
                        const thumbnail = video.thumbnail?.thumbnails?.[video.thumbnail.thumbnails.length - 1]?.url || '';
                        const lengthText = video.lengthText?.simpleText || '';
                        
                        videos.push({
                            id: videoId,
                            title: title,
                            thumbnail: thumbnail,
                            duration: lengthText,
                            url: `https://www.youtube.com/watch?v=${videoId}`
                        });
                    }
                });
            }
        } catch (e) {
            console.error('Error extracting video data:', e);
        }
    }
    
    return videos;
}

// Fetch from RSS feed (primary method)
async function fetchVideosFromRSS() {
    try {
        // Try to get channel ID first
        const channelUrl = `https://www.youtube.com/${YOUTUBE_CHANNEL_HANDLE}`;
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(channelUrl)}`;
        
        const response = await fetch(proxyUrl);
        const data = await response.json();
        const html = data.contents;
        
        // Extract channel ID from the page (multiple possible patterns)
        let channelId = null;
        const patterns = [
            /"channelId":"([^"]+)"/,
            /"externalId":"([^"]+)"/,
            /<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/([^"]+)"/,
            /channel_id=([^"&]+)/
        ];
        
        for (const pattern of patterns) {
            const match = html.match(pattern);
            if (match && match[1] && match[1].length > 10) {
                channelId = match[1];
                break;
            }
        }
        
        if (channelId) {
            const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
            const rssProxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
            
            const rssResponse = await fetch(rssProxyUrl);
            const rssData = await rssResponse.json();
            const rssContent = rssData.contents;
            
            // Parse RSS XML
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(rssContent, 'text/xml');
            const entries = xmlDoc.querySelectorAll('entry');
            
            const videos = [];
            entries.forEach((entry, index) => {
                if (index >= 6) return; // Limit to 6 videos
                
                // Try different selectors for video ID
                const videoIdElement = entry.querySelector('yt\\:videoId') || 
                                     entry.querySelector('videoId') ||
                                     entry.querySelector('[name="yt:videoId"]');
                const videoId = videoIdElement?.textContent || '';
                
                const titleElement = entry.querySelector('title');
                const title = titleElement?.textContent || 'Untitled';
                
                const mediaElement = entry.querySelector('media\\:thumbnail') || 
                                   entry.querySelector('thumbnail');
                const thumbnail = mediaElement?.getAttribute('url') || '';
                
                if (videoId) {
                    videos.push({
                        id: videoId,
                        title: title,
                        thumbnail: thumbnail,
                        duration: '',
                        url: `https://www.youtube.com/watch?v=${videoId}`
                    });
                }
            });
            
            if (videos.length > 0) {
                displayVideos(videos);
                return;
            }
        }
        
        throw new Error('Could not extract channel ID or parse RSS feed');
    } catch (error) {
        console.error('Error fetching from RSS:', error);
        throw error; // Re-throw to allow fallback
    }
}

// Display videos in the grid
function displayVideos(videos) {
    const videoGrid = document.getElementById('videoGrid');
    if (!videoGrid) return;
    
    videoGrid.innerHTML = '';
    
    videos.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.addEventListener('click', () => {
            window.open(video.url, '_blank');
        });
        
        card.innerHTML = `
            <div class="video-thumbnail">
                <img src="${video.thumbnail}" alt="${video.title}" style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;">
                <div class="play-button">▶</div>
                <div class="video-overlay"></div>
            </div>
            <div class="video-info">
                <h3>${video.title}</h3>
                ${video.duration ? `<p class="video-duration">${video.duration}</p>` : ''}
            </div>
        `;
        
        videoGrid.appendChild(card);
    });
}

// Show error message if videos can't be loaded
function showErrorMessage() {
    const videoGrid = document.getElementById('videoGrid');
    if (!videoGrid) return;
    
    videoGrid.innerHTML = `
        <div class="loading-placeholder">
            <p>无法加载视频。请访问我们的 <a href="${YOUTUBE_CHANNEL_URL}" target="_blank" style="color: var(--primary-color);">YouTube 频道</a> 观看故事。</p>
        </div>
    `;
}

// Initialize video fetching when page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchYouTubeVideos();
});

// Add click handlers to video cards (dynamically added)
document.addEventListener('click', (e) => {
    const videoCard = e.target.closest('.video-card');
    if (videoCard && !videoCard.querySelector('a')) {
        const videoLink = videoCard.dataset.videoUrl;
        if (videoLink) {
            window.open(videoLink, '_blank');
        }
    }
});

// Add a subtle glow effect on hover for interactive elements
document.querySelectorAll('.btn, .video-card, .feature').forEach(el => {
    el.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease';
    });
});

// Easter egg: Click on moon logo to change star colors
const moon = document.querySelector('.moon');
if (moon) {
    let colorIndex = 0;
    const colors = ['#ffd700', '#ff6b9d', '#8b5cf6', '#6366f1', '#00d4ff'];
    
    moon.addEventListener('click', () => {
        colorIndex = (colorIndex + 1) % colors.length;
        moon.style.filter = `drop-shadow(0 0 20px ${colors[colorIndex]})`;
    });
}

