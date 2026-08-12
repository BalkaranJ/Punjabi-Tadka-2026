(function () {
  var section = document.getElementById('reviews');
  if (!section) return;

  var summaryEl = document.getElementById('reviewsSummary');
  var summaryTextEl = summaryEl && summaryEl.querySelector('.reviews__summary-text');
  var gridEl = document.getElementById('reviewsGrid');
  var linkEl = document.getElementById('reviewsLink');

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function starString(rating) {
    var full = Math.round(rating || 0);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  }

  fetch('/.netlify/functions/reviews')
    .then(function (res) {
      if (!res.ok) throw new Error('Reviews request failed');
      return res.json();
    })
    .then(function (data) {
      if (data.mapsUrl && linkEl) linkEl.href = data.mapsUrl;

      if (summaryTextEl && typeof data.rating === 'number' && typeof data.userRatingCount === 'number') {
        summaryTextEl.textContent =
          data.rating.toFixed(1) + ' average from ' + data.userRatingCount.toLocaleString() + ' Google reviews';
      } else if (summaryEl) {
        summaryEl.remove();
      }

      if (gridEl && data.reviews && data.reviews.length) {
        gridEl.innerHTML = data.reviews
          .map(function (r) {
            return (
              '<div class="reviews__card">' +
              '<span class="reviews__card-stars" aria-hidden="true">' + starString(r.rating) + '</span>' +
              '<p class="reviews__quote">“' + escapeHtml(r.text) + '”</p>' +
              '<p class="reviews__author">' + escapeHtml(r.author) +
              (r.relativeTime ? ' <span>' + escapeHtml(r.relativeTime) + '</span>' : '') +
              '</p>' +
              '</div>'
            );
          })
          .join('');
        section.hidden = false;
      }
    })
    .catch(function () {
      // Leave the section hidden. Places API not configured or unreachable.
    });
})();
