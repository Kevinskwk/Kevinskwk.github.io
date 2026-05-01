document.addEventListener('DOMContentLoaded', function () {
  loadNews();
  loadPublications();
  setupBackToTop();
});

function loadNews() {
  var news = typeof newsData !== 'undefined' ? newsData : [];
  var newsContainer = document.getElementById('news');

  if (!newsContainer) return;

  var heading = newsContainer.querySelector('.heading');
  newsContainer.innerHTML = '';
  if (heading) newsContainer.appendChild(heading);

  if (news.length === 0) {
    appendEmptyState(newsContainer, 'News will be updated soon.');
    return;
  }

  var visibleNews = news.filter(function (item) { return !item.isMore; });
  var hiddenNews = news.filter(function (item) { return item.isMore; });

  visibleNews.forEach(function (item) {
    newsContainer.appendChild(createNewsItem(item));
  });

  if (hiddenNews.length > 0) {
    var details = document.createElement('details');
    var summary = document.createElement('summary');

    details.className = 'news-more';
    summary.textContent = 'Show more';
    details.appendChild(summary);

    hiddenNews.forEach(function (item) {
      details.appendChild(createNewsItem(item));
    });

    newsContainer.appendChild(details);
  }
}

function createNewsItem(item) {
  var div = document.createElement('div');
  var date = document.createElement('span');
  var dateText = document.createElement('span');
  var content = document.createElement('span');

  div.className = 'news-item';
  date.className = 'news-date';
  date.addEventListener('mousemove', updateBadgeLight);
  date.addEventListener('mouseleave', resetBadgeLight);
  dateText.className = 'news-date-text';
  dateText.textContent = item.date;
  content.className = 'news-content';
  content.innerHTML = item.content;

  date.appendChild(dateText);
  div.appendChild(date);
  div.appendChild(content);
  return div;
}

function updateBadgeLight(event) {
  var rect = event.currentTarget.getBoundingClientRect();
  var x = ((event.clientX - rect.left) / rect.width) * 100;
  var y = ((event.clientY - rect.top) / rect.height) * 100;

  event.currentTarget.style.setProperty('--light-x', x + '%');
  event.currentTarget.style.setProperty('--light-y', y + '%');
}

function resetBadgeLight(event) {
  event.currentTarget.style.setProperty('--light-x', '50%');
  event.currentTarget.style.setProperty('--light-y', '35%');
}

function loadPublications() {
  var publications = typeof publicationsData !== 'undefined' ? publicationsData : [];
  var pubContainer = document.querySelector('.publications');

  if (!pubContainer) return;

  pubContainer.innerHTML = '';

  if (publications.length === 0) {
    appendEmptyState(pubContainer, 'Selected publications will be added soon.');
    return;
  }

  publications.forEach(function (pub) {
    var pubDiv = document.createElement('article');
    var mediaDiv = document.createElement('div');
    var contentDiv = document.createElement('div');

    pubDiv.className = 'publication';
    mediaDiv.className = 'publication-image';
    contentDiv.className = 'publication-content';

    appendPublicationMedia(mediaDiv, pub);
    appendPublicationContent(contentDiv, pub);

    pubDiv.appendChild(mediaDiv);
    pubDiv.appendChild(contentDiv);
    pubContainer.appendChild(pubDiv);
  });
}

function appendPublicationMedia(container, pub) {
  var media = pub.video || pub.image;

  if (!media) {
    var placeholder = document.createElement('div');
    placeholder.className = 'publication-placeholder';
    placeholder.textContent = pub.badge || 'Paper';
    container.appendChild(placeholder);
    return;
  }

  if (media.endsWith('.mp4')) {
    var video = document.createElement('video');
    var source = document.createElement('source');

    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    if (pub.poster) video.poster = pub.poster;

    source.src = media;
    source.type = 'video/mp4';
    video.appendChild(source);
    container.appendChild(video);
    video.play().catch(function () {});
    return;
  }

  var image = document.createElement('img');
  image.src = media;
  image.alt = pub.title || 'Publication media';
  container.appendChild(image);
}

function appendPublicationContent(container, pub) {
  var titleDiv = document.createElement('div');
  var authorsDiv = document.createElement('div');
  var venueDiv = document.createElement('div');
  var linksDiv = document.createElement('div');

  titleDiv.className = 'papertitle';
  titleDiv.textContent = pub.title;
  container.appendChild(titleDiv);

  authorsDiv.className = 'publication-authors';
  (pub.authors || []).forEach(function (author, index) {
    var authorElement = author.url ? document.createElement('a') : document.createElement('span');

    if (author.url) authorElement.href = author.url;
    authorElement.textContent = author.name;

    if (author.isMe) {
      var strong = document.createElement('strong');
      strong.appendChild(authorElement);
      authorsDiv.appendChild(strong);
    } else {
      authorsDiv.appendChild(authorElement);
    }

    if (index < pub.authors.length - 1) {
      authorsDiv.appendChild(document.createTextNode(', '));
    }
  });

  if (pub.note) {
    authorsDiv.appendChild(document.createTextNode(' ' + pub.note));
  }

  container.appendChild(authorsDiv);

  venueDiv.className = 'publication-venue';
  venueDiv.textContent = pub.venue || '';
  container.appendChild(venueDiv);

  linksDiv.className = 'publication-links';
  (pub.links || []).forEach(function (link) {
    var anchor = document.createElement('a');
    var badge = document.createElement('img');
    var badgeSpec = getLinkBadge(link);

    anchor.href = link.url;
    anchor.className = 'publication-link';
    anchor.setAttribute('aria-label', link.label);

    badge.src = badgeSpec.src;
    badge.alt = badgeSpec.alt;
    badge.loading = 'lazy';
    anchor.appendChild(badge);
    linksDiv.appendChild(anchor);
  });
  container.appendChild(linksDiv);
}

function getLinkBadge(link) {
  var label = String(link.label || 'link').toLowerCase();
  var url = String(link.url || '').toLowerCase();
  var spec = { left: 'Link', right: 'Open', color: '6b7280', logo: 'linkerd' };

  if (label.indexOf('project') !== -1) {
    spec = { left: 'Project', right: 'Page', color: '8dbdec', logo: 'googlechrome' };
  } else if (label.indexOf('code') !== -1 || url.indexOf('github.com') !== -1) {
    spec = { left: 'Code', right: 'GitHub', color: '7f8794', logo: 'github' };
  } else if (label.indexOf('data') !== -1 || url.indexOf('huggingface.co') !== -1) {
    spec = { left: 'Data', right: 'HuggingFace', color: 'd8bd76', logo: 'huggingface' };
  } else if (label.indexOf('pdf') !== -1 || label.indexOf('arxiv') !== -1 || url.indexOf('arxiv.org') !== -1) {
    spec = { left: 'Paper', right: 'arXiv', color: 'd58a9f', logo: 'arxiv' };
  } else if (label.indexOf('blog') !== -1) {
    spec = { left: 'Blog', right: 'Post', color: 'cfa3d9', logo: 'readme' };
  }

  return {
    src: 'https://img.shields.io/badge/' + encodeURIComponent(spec.left) + '-' + encodeURIComponent(spec.right) + '-' + spec.color + '?style=flat&logo=' + encodeURIComponent(spec.logo) + '&logoColor=white',
    alt: spec.left + ' ' + spec.right
  };
}

function appendEmptyState(container, message) {
  var div = document.createElement('div');
  div.className = 'empty-state';
  div.textContent = message;
  container.appendChild(div);
}

function setupBackToTop() {
  var button = document.createElement('button');

  button.id = 'backToTop';
  button.type = 'button';
  button.textContent = '^';
  button.setAttribute('aria-label', 'Back to top');
  document.body.appendChild(button);

  window.addEventListener('scroll', function () {
    button.style.display = window.scrollY > 200 ? 'block' : 'none';
  });

  button.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
