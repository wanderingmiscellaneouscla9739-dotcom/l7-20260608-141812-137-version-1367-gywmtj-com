(function () {
  var input = document.getElementById('searchInput');
  var form = document.getElementById('searchForm');
  var results = document.getElementById('searchResults');
  var meta = document.getElementById('searchMeta');
  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';

  if (!input || !results || !window.MOVIES) {
    return;
  }

  input.value = initial;

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card">'
      + '<a class="poster-wrap" href="' + movie.detail + '" title="' + escapeHtml(movie.title) + '">'
      + '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">'
      + '<span class="poster-play">▶</span>'
      + '</a>'
      + '<div class="movie-card-body">'
      + '<a class="movie-title" href="' + movie.detail + '">' + escapeHtml(movie.title) + '</a>'
      + '<p>' + escapeHtml(movie.oneLine) + '</p>'
      + '<div class="meta-line"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.region) + '</span></div>'
      + '<div class="tag-row">' + tags + '</div>'
      + '</div>'
      + '</article>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function doSearch(value) {
    var query = String(value || '').trim().toLowerCase();
    if (!query) {
      results.innerHTML = '';
      if (meta) {
        meta.textContent = '输入关键词开始搜索';
      }
      return;
    }

    var words = query.split(/\s+/).filter(Boolean);
    var matched = window.MOVIES.filter(function (movie) {
      var text = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.oneLine,
        (movie.tags || []).join(' '),
        movie.category
      ].join(' ').toLowerCase();
      return words.every(function (word) {
        return text.indexOf(word) !== -1;
      });
    }).slice(0, 120);

    results.innerHTML = matched.map(card).join('');
    if (meta) {
      meta.textContent = matched.length ? '为你找到相关影片' : '没有匹配的影片';
    }
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var url = new URL(window.location.href);
      url.searchParams.set('q', input.value.trim());
      window.history.replaceState(null, '', url.toString());
      doSearch(input.value);
    });
  }

  input.addEventListener('input', function () {
    doSearch(input.value);
  });

  doSearch(initial);
}());
