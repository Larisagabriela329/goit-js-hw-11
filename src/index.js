import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';


const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');

const API_KEY = '47390625-19a19a63281485c70e805310c'; 
const BASE_URL = 'https://pixabay.com/api/';
const IMAGES_PER_PAGE = 40;

let currentPage = 1;
let currentQuery = '';
let totalHits = 0;
let lightbox;

// Initializează SimpleLightbox
function initLightbox() {
  lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
  });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = event.target.searchQuery.value.trim();

  if (!query) {
    Notiflix.Notify.warning('Please enter a search term!');
    return;
  }

  currentQuery = query;
  currentPage = 1;
  totalHits = 0;
  gallery.innerHTML = '';

  await fetchImages();
  initLightbox();
});

// Infinite scroll
window.addEventListener('scroll', async () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    if (gallery.children.length < totalHits) {
      currentPage += 1;
      await fetchImages();
      lightbox.refresh(); // Actualizează galeria lightbox
    }
  }
});

async function fetchImages() {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: currentQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: currentPage,
        per_page: IMAGES_PER_PAGE,
      },
    });

    const images = response.data.hits;
    totalHits = response.data.totalHits;

    if (currentPage === 1) {
      if (images.length === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    }

    renderGallery(images);

    // Scroll fluid
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  } catch (error) {
    Notiflix.Notify.failure('Something went wrong. Please try again later.');
    console.error(error);
  }
}

function renderGallery(images) {
  const markup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
      <a href="${largeImageURL}">
        <div class="photo-card">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" />
          <div class="info">
            <p class="info-item"><b>Likes:</b> ${likes}</p>
            <p class="info-item"><b>Views:</b> ${views}</p>
            <p class="info-item"><b>Comments:</b> ${comments}</p>
            <p class="info-item"><b>Downloads:</b> ${downloads}</p>
          </div>
        </div>
      </a>
    `
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
}
