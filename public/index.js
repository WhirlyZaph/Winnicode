let headlines = [];
let imageData = [];
let currentHeadlineIndex = 0;
let currentImageIndex = 0;
let currentItemId = null; // track which card is active
const dynamicTextElement = document.getElementById('dynamic-text');
const headlineElement = document.getElementById('headline');
const imageSectionElement = document.getElementById('imageContainer');
const newsImageElement = document.getElementById('newsImage');
const imageCategoryElement = document.getElementById('imageCategory');
const imageDescriptionElement = document.getElementById('imageDescription');
const imageAuthorElement = document.getElementById('imageAuthor');
const imageDateElement = document.getElementById('imageDate');
const newsMetaElement = document.getElementById('newsMeta');
const commentFields = document.getElementById('commentFields');
const submitBtn = document.getElementById('submitCommentBtn');
const commentHistory = document.getElementById('commentHistory');

// Load headlines from text file
async function loadHeadlines() {
	try {
		const response = await fetch('headlines.txt');
		const text = await response.text();
		
		// Split by newlines and filter out empty lines
		headlines = text.split('\n')
			.map(line => line.trim())
			.filter(line => line.length > 0);
		
		if (headlines.length === 0) {
			throw new Error('No headlines found in file');
		}
		
		console.log('Loaded headlines:', headlines);
		
	} catch (error) {
		console.error('Error loading headlines:', error);
		// Fallback to default headlines if file loading fails
		headlines = [
			"Menjamurnya Industri Drink to go di Indonesia",
			"Perkembangan Teknologi AI yang Pesat di Tahun 2025",
			"Kenaikan Harga BBM Mempengaruhi Ekonomi Nasional"
		];
	}
}

// Load image data from text file
async function loadImageData() {
	try {
		const response = await fetch('images.txt');
		const text = await response.text();
		
		// Parse the image data (format: imageUrl|description)
		imageData = text.split('\n')
			.map(line => line.trim())
			.filter(line => line.length > 0)
			.map(line => {
				const [url, category, description, author, date] = line.split('|');
				return {
					url: url?.trim() || '',
					category: category?.trim() || '',
					description: description?.trim() || '',
					author: author?.trim() || '',
					date: date?.trim() || ''
				};
			})
			.filter(item => item.url && item.description);
		
		if (imageData.length === 0) {
			throw new Error('No image data found in file');
		}
		
		console.log('Loaded image data:', imageData);
		
	} catch (error) {
		console.error('Error loading image data:', error);
		// Fallback to default image data
		imageData = [
			{
				url: "https://via.placeholder.com/500x300/4CAF50/white?text=Drink+To+Go",
				category: "Industri",
				description: "Industri minuman siap saji mengalami pertumbuhan pesat di berbagai kota besar Indonesia dengan konsep yang praktis dan modern.",
				author: "Ahmad Pratama",
				date: "07 Juni 2025"
			},
			{
				url: "https://via.placeholder.com/500x300/2196F3/white?text=AI+Technology",
				category: "Teknologi",
				description: "Teknologi kecerdasan buatan terus berkembang dengan pesat, menghadirkan inovasi baru dalam berbagai sektor industri.",
				author: "Sari Indrawati",
				date: "06 Juni 2025"
			},
			{
				url: "https://via.placeholder.com/500x300/FF9800/white?text=Fuel+Prices",
				category: "Industri",
				description: "Fluktuasi harga bahan bakar minyak memberikan dampak signifikan terhadap perekonomian nasional dan daya beli masyarakat.",
				author: "Budi Santoso",
				date: "05 Juni 2025"
			}
		];
	}
}

function cycleContent() {
	// Start fade out animations for both headline and image
	headlineElement.classList.remove('fade-in');
	headlineElement.classList.add('fade-out');
	
	imageSectionElement.classList.remove('slide-in');
	imageSectionElement.classList.add('slide-out');
	
	imageDescriptionElement.classList.remove('slide-in');
	imageDescriptionElement.classList.add('slide-out');
	
	newsMetaElement.classList.remove('slide-in');
	newsMetaElement.classList.add('slide-out');
	
	// After animations complete, change content and fade/slide in
	setTimeout(() => {
		// Update headline independently
		if (headlines.length > 0) {
			currentHeadlineIndex = (currentHeadlineIndex + 1) % headlines.length;
			dynamicTextElement.textContent = headlines[currentHeadlineIndex];
		}
		
		// Update image independently
		if (imageData.length > 0) {
			currentImageIndex = (currentImageIndex + 1) % imageData.length;
			const currentImageData = imageData[currentImageIndex];
			newsImageElement.src = currentImageData.url;
			newsImageElement.alt = currentImageData.description;
			imageCategoryElement.textContent = currentImageData.category;
			imageDescriptionElement.textContent = currentImageData.description;
			imageAuthorElement.textContent = currentImageData.author;
			imageDateElement.textContent = currentImageData.date;
		}
		
		// Start fade/slide in animations
		headlineElement.classList.remove('fade-out');
		headlineElement.classList.add('fade-in');
		
		imageSectionElement.classList.remove('slide-out');  
		imageSectionElement.classList.add('slide-in');
		
		imageDescriptionElement.classList.remove('slide-out');
		imageDescriptionElement.classList.add('slide-in');
		
		newsMetaElement.classList.remove('slide-out');
		newsMetaElement.classList.add('slide-in');
	}, 500); // Match the animation duration
}



(async () => {
  try {
    // Fetch likes and saves
    const itemRes = await fetch(`/api/items/${itemId}`);
    if (itemRes.ok) {
      const item = await itemRes.json();
      likeCountSpan.textContent = item.likes ?? 0;
      saveCountSpan.textContent = item.saves ?? 0;
    } else {
      likeCountSpan.textContent = 0;
      saveCountSpan.textContent = 0;
    }

    // Fetch comment count separately
    const commentRes = await fetch(`/api/comments/${itemId}`);
    if (commentRes.ok) {
      const comments = await commentRes.json();
      commentCountSpan.textContent = comments.length;
    } else {
      commentCountSpan.textContent = 0;
    }

  } catch (err) {
    console.error(`Error fetching counts for ${itemId}:`, err);
    likeCountSpan.textContent = 0;
    saveCountSpan.textContent = 0;
    commentCountSpan.textContent = 0;
  }
})();

async function loadComments(itemId) {
  if (!itemId) {
    console.warn('Missing itemId when loading comments');
    return;
  }

  try {
    const res = await fetch(`/api/comments/${itemId}`);
    
    if (!res.ok) {
      const err = await res.json();
      console.error('Failed to fetch comments:', err);
      commentHistory.innerHTML = '<p style="color: red;">Gagal memuat komentar untuk berita ini.</p>';
      return;
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error('Invalid comment response:', data);
      commentHistory.innerHTML = '<p style="color: red;">Format komentar tidak valid.</p>';
      return;
    }

    commentHistory.innerHTML = data.map(c => {
      const time = new Date(c.createdAt).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
      return `<p><strong>${c.name}</strong> (${time}):<br>${c.comment}</p><hr>`;
    }).join('');

    commentFields.style.display = 'block';
    currentItemId = itemId;
    console.log('Showing comment fields for:', itemId);
  } catch (err) {
    console.error('Unexpected error loading comments:', err);
    commentHistory.innerHTML = '<p style="color: red;">Terjadi kesalahan saat memuat komentar.</p>';
  }
}


// When submitting comment
submitBtn.addEventListener('click', async () => {
  const name = document.getElementById('nameInput').value.trim();
  const comment = document.getElementById('commentInput').value.trim();
  if (!name || !comment || !currentItemId) return alert('Please fill out all fields.');

  await fetch('/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, comment, itemId: currentItemId })
  });

  document.getElementById('nameInput').value = '';
  document.getElementById('commentInput').value = '';
  await loadComments(currentItemId);

  // ✅ Update comment count bubble for the current card
  const card = document.querySelector(`.news-card[data-id="${currentItemId}"]`);
  const countSpan = card?.querySelector('.comment-count');
  if (countSpan) {
    try {
      const res = await fetch(`/api/comments/${currentItemId}`);
      const updatedComments = await res.json();
      countSpan.textContent = updatedComments.length;
    } catch (err) {
      console.warn('Failed to update comment count bubble:', err);
    }
  }
});


document.getElementById('searchBox').addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();

  document.querySelectorAll('.news-card').forEach(card => {
    const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
    const category = card.querySelector('.category')?.textContent.toLowerCase() || '';

    card.style.display = (title.includes(term) || category.includes(term)) ? 'block' : 'none';
  });

  document.querySelectorAll('.news-item').forEach(item => {
    const text = item.innerText.toLowerCase();
    item.style.display = text.includes(term) ? 'flex' : 'none';
  });
});


// left and right scroll support for secondary-news
let scrollInterval = null;
const scrollContainer = document.querySelector('.news-section');

function startScroll(dir) {
  stopScroll(); // clear any existing scrolls
  const amount = dir === 'right' ? 8 : -8;

  scrollInterval = setInterval(() => {
    scrollContainer.scrollLeft += amount;
  }, 10); // fast, smooth
}

function stopScroll() {
  clearInterval(scrollInterval);
  scrollInterval = null;
}

function setupCardButtons() {
  document.querySelectorAll('.news-card').forEach(card => {
    const itemId = card.dataset.id;

    const likeBtn = card.querySelector('.like-btn');
    const saveBtn = card.querySelector('.save-btn');
    const commentBtn = card.querySelector('.comment-btn');
    const shareBtn = card.querySelector('.share-btn');

    const likeCountSpan = likeBtn.querySelector('.like-count');
    const saveCountSpan = saveBtn.querySelector('.save-count');
    const commentCountSpan = commentBtn.querySelector('.comment-count');

    // Fetch and show like/save/comment counts
    (async () => {
      try {
        const itemRes = await fetch(`/api/items/${itemId}`);
        if (itemRes.ok) {
          const item = await itemRes.json();
          likeCountSpan.textContent = item.likes ?? 0;
          saveCountSpan.textContent = item.saves ?? 0;
        }

        const commentRes = await fetch(`/api/comments/${itemId}`);
        if (commentRes.ok) {
          const comments = await commentRes.json();
          commentCountSpan.textContent = comments.length;
        }
      } catch (err) {
        console.warn(`Failed to fetch data for card ${itemId}`, err);
      }
    })();

    // Button actions
    likeBtn.addEventListener('click', async () => {
      try {
        const res = await fetch(`/api/items/${itemId}/like`, { method: 'POST' });
        const data = await res.json();
        likeCountSpan.textContent = data.likes;
      } catch (err) {
        console.error(`Failed to like ${itemId}`, err);
      }
    });

    saveBtn.addEventListener('click', async () => {
      try {
        const res = await fetch(`/api/items/${itemId}/save`, { method: 'POST' });
        const data = await res.json();
        saveCountSpan.textContent = data.saves;
      } catch (err) {
        console.error(`Failed to save ${itemId}`, err);
      }
    });

    commentBtn.addEventListener('click', () => {
      loadComments(itemId);
      setTimeout(() => {
        commentFields.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    shareBtn.addEventListener('click', () => {
      const url = `${window.location.origin}/news/${itemId}`;
      navigator.clipboard.writeText(url);
      alert('Link copied!');
    });
  });
}


async function startCycling() {
	// Load both data sources
	await Promise.all([loadHeadlines(), loadImageData()]);
	
	// Set initial content
	if (headlines.length > 0) {
		dynamicTextElement.textContent = headlines[0];
	}
	if (imageData.length > 0) {
		newsImageElement.src = imageData[0].url;
		newsImageElement.alt = imageData[0].description;
		imageCategoryElement.textContent = imageData[0].category;
		imageDescriptionElement.textContent = imageData[0].description;
		imageAuthorElement.textContent = imageData[0].author;
		imageDateElement.textContent = imageData[0].date;
	}
	
	setTimeout(() => {
		// Initial animations
		headlineElement.classList.add('fade-in');
		imageSectionElement.classList.add('slide-in');
		imageDescriptionElement.classList.add('slide-in');
		newsMetaElement.classList.add('slide-in');
		
		// Start cycling every 4 seconds (if we have any content)
		if (headlines.length > 0 || imageData.length > 0) {
			setInterval(cycleContent, 4000);
		}
	}, 1000);
	
	setupCardButtons();
}

// Attach events
document.getElementById('scrollRightBtn')?.addEventListener('mouseenter', () => startScroll('right'));
document.getElementById('scrollLeftBtn')?.addEventListener('mouseenter', () => startScroll('left'));
document.getElementById('scrollRightBtn')?.addEventListener('mouseleave', stopScroll);
document.getElementById('scrollLeftBtn')?.addEventListener('mouseleave', stopScroll);


// Start everything when page loads
window.addEventListener('load', startCycling);