let headlines = [];
let imageData = [];
let currentHeadlineIndex = 0;
let currentImageIndex = 0;
let currentItemId = null; // track which card is active
let commentChart = null;
let currentRole = 'user'; // or 'admin'
let engagementChartInstance = null;
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
const roleSelector = document.getElementById('roleSelector');
const adminPanel = document.getElementById('adminPanel');


async function fetchItemStats(itemId) {
  const stats = { likes: 0, saves: 0, comments: 0 };
  try {
    const itemRes = await fetch(`/api/items/${itemId}`);
    if (itemRes.ok) {
      const item = await itemRes.json();
      stats.likes = item.likes ?? 0;
      stats.saves = item.saves ?? 0;
    }

    const commentRes = await fetch(`/api/comments/${itemId}`);
    if (commentRes.ok) {
      const comments = await commentRes.json();
      stats.comments = comments.length;
    }
  } catch (err) {
    console.warn(`Failed to fetch stats for item ${itemId}`, err);
  }

  return stats;
}


roleSelector.addEventListener('change', () => {
  const selectedRole = roleSelector.value;
  updateRoleView(selectedRole);
});

function updateRoleView(role) {
  currentRole = role;
  if (role === 'admin') {
    adminPanel.style.display = 'block';
    loadEngagementChart();
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'inline-block');
  } else {
    adminPanel.style.display = 'none';
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
  }
  if (currentItemId) {
    loadComments(currentItemId, commentHistory);  // force reload to update comment UI
  }
}


// Initialize on page load
updateRoleView(roleSelector.value);


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


async function loadComments(itemId, container) {
  if (!itemId) {
    console.warn('Missing itemId when loading comments');
    return;
  }

  try {
    const res = await fetch(`/api/comments/${itemId}`);

    if (res.status === 404) {
      console.warn('No comments found for item', itemId);
      container.innerHTML = '<p>Tidak ada komentar.</p>';
      return;
    }

    if (!res.ok) {
      const err = await res.json();
      console.error('Failed to fetch comments:', err);
      container.innerHTML = '<p style="color: red;">Gagal memuat komentar untuk berita ini.</p>';
      return;
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error('Invalid comment response:', data);
      container.innerHTML = '<p style="color: red;">Format komentar tidak valid.</p>';
      return;
    }

    container.innerHTML = ''; // Clear old comments

    data.forEach(c => {
      const time = new Date(c.createdAt).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });

      const commentBox = document.createElement('div');
      commentBox.className = 'comment-box';
      commentBox.innerHTML = `
        <p><strong>${c.name}</strong> (${time}):<br>${c.comment}</p>
      `;

      // Admin-only delete button
      if (currentRole === 'admin') {
        const delBtn = document.createElement('button');
        delBtn.textContent = '🗑️ Delete';
        delBtn.style.marginLeft = '10px';
        delBtn.classList.add('admin-only');

        delBtn.onclick = async () => {
          const confirmDelete = confirm('Are you sure you want to delete this comment?');
          if (!confirmDelete) return;

          const res = await fetch(`/api/comments/${c._id}`, {
            method: 'DELETE'
          });

          if (res.ok) {
            commentBox.remove();
            updateCommentCount(itemId);
            loadEngagementChart(); // update chart too
          } else {
            alert('Failed to delete comment.');
          }
        };

        commentBox.appendChild(delBtn);
      }

      container.appendChild(commentBox);
      container.appendChild(document.createElement('hr'));
    });

    currentItemId = itemId;
  } catch (err) {
    console.error('Unexpected error loading comments:', err);
    container.innerHTML = '<p style="color: red;">Terjadi kesalahan saat memuat komentar.</p>';
  }
}


function updateCommentCount(itemId) {
  const card = document.querySelector(`.news-card[data-id="${itemId}"]`);
  const countSpan = card?.querySelector('.comment-count');
  if (!countSpan) return;

  fetch(`/api/comments/${itemId}`)
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        countSpan.textContent = data.length;
      }
    })
    .catch(err => console.warn('Failed to update comment count bubble:', err));
}


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
    fetchItemStats(itemId).then(stats => {
	  likeCountSpan.textContent = stats.likes;
	  saveCountSpan.textContent = stats.saves;
	  commentCountSpan.textContent = stats.comments;
	});

    // Button actions
    likeBtn.addEventListener('click', async (e) => {
	  e.stopPropagation(); // Prevent card click
      try {
        const res = await fetch(`/api/items/${itemId}/like`, { method: 'POST' });
        const data = await res.json();
        likeCountSpan.textContent = data.likes;
      } catch (err) {
        console.error(`Failed to like ${itemId}`, err);
      }
	  if (currentRole === 'admin') loadEngagementChart();
    });

    saveBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
	  try {
        const res = await fetch(`/api/items/${itemId}/save`, { method: 'POST' });
        const data = await res.json();
        saveCountSpan.textContent = data.saves;
      } catch (err) {
        console.error(`Failed to save ${itemId}`, err);
      }
	  if (currentRole === 'admin') loadEngagementChart();
    });

    commentBtn.addEventListener('click', () => {
	  loadComments(itemId, commentHistory);
      setTimeout(() => {
        commentFields.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    shareBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const url = `${window.location.origin}/news/${itemId}`;
      navigator.clipboard.writeText(url);
      alert('Link copied!');
	  if (currentRole === 'admin') loadEngagementChart();
    });
  });
}


async function startCycling() {
	commentFields.style.display = 'none';
	commentHistory.style.display = 'none';
	
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


// Focused View Elements
const focusedOverlay = document.getElementById('focusedOverlay');
const closeFocusedView = document.getElementById('closeFocusedView');
const focusedImage = document.getElementById('focusedImage');
const focusedTitle = document.getElementById('focusedTitle');
const focusedDescription = document.getElementById('focusedDescription');
const focusedCommentFields = document.getElementById('focusedCommentFields');
const focusedCommentHistory = document.getElementById('focusedCommentHistory');
const focusedCategory = document.getElementById('focusedCategory'); // optional, unimplemented
const focusedAuthor = document.getElementById('focusedAuthor');     // ^
const focusedDate = document.getElementById('focusedDate');         // ^

document.querySelectorAll('.news-card').forEach(card => {
  card.addEventListener('click', () => {
    const imgSrc = card.querySelector('img').src;
	document.getElementById('focusedImage').src = imgSrc;
	document.getElementById('focusedLeftBlur').src = imgSrc;
    const title = card.querySelector('h3').innerText;
    const desc = card.querySelector('p').innerText;
    const itemId = card.dataset.id;

    currentItemId = itemId;

    // Populate modal
    focusedImage.src = imgSrc;
    focusedTitle.innerText = title;
    focusedDescription.innerText = desc;

    // Clone and prepare comment input + history
    const clonedFields = commentFields.cloneNode(true);
    const clonedHistory = document.createElement('div');
    clonedFields.id = 'focusedCommentFields';
    clonedHistory.id = 'focusedCommentHistory';
    clonedFields.style.display = 'block';
	
	// ✅ Inject real reCAPTCHA widget container
	const captchaContainer = document.createElement('div');
	captchaContainer.className = 'g-recaptcha';
	captchaContainer.setAttribute('data-sitekey', '6Le8nJMrAAAAAAxYkiTwwyf21mLZwrQG3Pz6_lyY');

	// Remove any previous dummy checkbox if present
	const dummyCheckbox = clonedFields.querySelector('#humanCheck')?.parentNode;
	if (dummyCheckbox) dummyCheckbox.remove();

	// Insert CAPTCHA after comment input field
	const commentInput = clonedFields.querySelector('#commentInput');
	commentInput.parentNode.insertBefore(captchaContainer, commentInput.nextSibling);

	// Wait for the CAPTCHA script to be ready and render it
	setTimeout(() => {
	  if (window.grecaptcha && grecaptcha.render) {
		grecaptcha.render(captchaContainer);
	  } else {
		console.warn('reCAPTCHA not loaded yet.');
	  }
	}, 300);

    // Replace inside modal
    const rightPanel = document.querySelector('.focused-right');
    const oldFields = document.getElementById('focusedCommentFields');
    const oldHistory = document.getElementById('focusedCommentHistory');
    if (oldFields) oldFields.remove();
    if (oldHistory) oldHistory.remove();
    rightPanel.appendChild(clonedFields);
    rightPanel.appendChild(clonedHistory);

    // Load comments into modal
    loadComments(itemId, clonedHistory);

    // Attach submit logic to new button
    const submitBtn = clonedFields.querySelector('#submitCommentBtn');
    const nameInput = clonedFields.querySelector('#nameInput');
    const captchaCheckbox = clonedFields.querySelector('#captchaCheckbox');

    submitBtn.addEventListener('click', async () => {
	  const name = clonedFields.querySelector('#nameInput')?.value.trim();
	  const comment = clonedFields.querySelector('#commentInput')?.value.trim();
	  const captchaResponse = grecaptcha.getResponse();
	  if (!captchaResponse) {
	    return alert('Harap centang "Saya bukan robot".');
	  }

	  if (!name || !comment || !currentItemId) {
		return alert('Harap isi semua kolom.');
	  }

	  await fetch('/api/comments', {
	    method: 'POST',
	    headers: { 'Content-Type': 'application/json' },
	    body: JSON.stringify({
		  name,
		  comment,
		  itemId: currentItemId,
		  captcha: grecaptcha.getResponse()  // ✅ Add this line
	    })
	  });

	  clonedFields.querySelector('#nameInput').value = '';
	  clonedFields.querySelector('#commentInput').value = '';

	  await loadComments(currentItemId, clonedHistory);
	  updateCommentCount(currentItemId);
	  grecaptcha.reset();
	  if (currentRole === 'admin') loadEngagementChart();
	});

    // Show modal
    focusedOverlay.style.display = 'flex';
  });
});

// Close modal
document.getElementById('closeFocusedView').addEventListener('click', () => {
  document.getElementById('focusedOverlay').style.display = 'none';
});


function loadEngagementChart() {
  fetch('/api/items/summary')
    .then(res => res.json())
    .then(data => {
      const labels = data.map(d => d.name);
      const likes = data.map(d => d.likes || 0);
      const saves = data.map(d => d.saves || 0);
      const comments = data.map(d => d.comments || 0);

      const ctx = document.getElementById('engagementChart').getContext('2d');

      // 💣 Destroy existing chart before creating new one
      if (engagementChartInstance) {
        engagementChartInstance.destroy();
      }

      engagementChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Likes',
              backgroundColor: '#4CAF50',
              data: likes,
            },
            {
              label: 'Saves',
              backgroundColor: '#2196F3',
              data: saves,
            },
            {
              label: 'Comments',
              backgroundColor: '#FF9800',
              data: comments,
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Engagement Summary'
            }
          }
        }
      });
    })
    .catch(err => {
      console.error('Failed to load engagement chart:', err);
    });
}


// Attach events
document.getElementById('scrollRightBtn')?.addEventListener('mouseenter', () => startScroll('right'));
document.getElementById('scrollLeftBtn')?.addEventListener('mouseenter', () => startScroll('left'));
document.getElementById('scrollRightBtn')?.addEventListener('mouseleave', stopScroll);
document.getElementById('scrollLeftBtn')?.addEventListener('mouseleave', stopScroll);


// Start everything when page loads
window.addEventListener('load', startCycling);