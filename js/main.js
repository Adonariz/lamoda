// выбор города

const headerCityButton = document.querySelector('.header__city-button');
let hash = location.hash.substring(1);

const updateLocation = () => {
  const lsLocation = localStorage.getItem('lomoda-location');
  headerCityButton.textContent = lsLocation && lsLocation !== 'null' ? lsLocation : 'Ваш город?';
};

headerCityButton.addEventListener('click', () => {
  const city = prompt('Укажите ваш город').trim();

  if (city !== null) {
    localStorage.setItem('lomoda-location', city);
  }
  
  updateLocation();
});

// модальное окно корзины

const subheaderCart = document.querySelector('.subheader__cart');
const cartOverlay = document.querySelector('.cart-overlay');

const openCartModal = () => {
  cartOverlay.classList.add('cart-overlay-open');
  disableScroll();
};

const closeCartModal = () => {
  cartOverlay.classList.remove('cart-overlay-open');
  enableScroll();
};

const disableScroll = () => {
  if (document.disableScroll) {
    return;
  }

  const scrollWidth = window.innerWidth - document.body.offsetWidth;

  document.disableScroll = true;
  
  document.body.dbScrollY = window.scrollY;
  document.body.style.cssText = `
    position: fixed;
    top: ${-window.scrollY}px;
    left: 0;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    padding-right: ${scrollWidth}px;
  `;
};

const enableScroll = () => {
  document.disableScroll = false;

  document.body.style.cssText = '';
  window.scroll({
    top: document.body.dbScrollY
  });
};

// запрос из базы данных

const database = 'db.json';

const getData = async () => {
  const data = await fetch(database);
  
  if(data.ok) {
    return data.json();
  } else {
    throw new Error(`Данные не были получены, ошибка ${data.status} ${data.statusText}`);
  }
};

const getGoods = (callback, value) => {
  getData()
    .then((data) => {
      if (value) {
        callback(data.filter(item => item.category === value));
      } else {
        callback(data);
      }
    })
    .catch(err => console.error(err));
};

// вывод товаров

try {
  const goodsList = document.querySelector('.goods__list');

  if (!goodsList) {
    throw 'Это не страница с товарами';
  }

  const createCard = (data) => {
    const {
      id, 
      preview, 
      cost, 
      brand, 
      name, 
      sizes
    } = data;
    
    const listItem = document.createElement('li');

    listItem.classList.add('goods__item');

    listItem.innerHTML = `
      <article class="good">
        <a class="good__link-img" href="card-good.html#${id}">
          <img class="good__img" src="goods-image/${preview}" alt="${name}">
        </a>
        <div class="good__description">
          <p class="good__price">${cost} &#8381;</p>
          <h3 class="good__title">${brand} <span class="good__title__grey">/ ${name}</span></h3>
          ${sizes ? 
            `<p class="good__sizes">Размеры (RUS): <span class="good__sizes-list">${sizes.join(' ')}</span></p>`
             : 
             ``}
          <a class="good__link" href="card-good.html#${id}">Подробнее</a>
        </div>
      </article>
    `;

    return listItem;
  };

  const renderGoodsList = (data) => {
    goodsList.textContent = '';

    for (const item of data) {
      const card = createCard(item);
      goodsList.append(card);
    }
  };

  getGoods(renderGoodsList, hash);

  window.addEventListener('hashchange', () => {
    hash = location.hash.substring(1);
    const title = document.querySelector('.goods__title');

    switch (hash) {
      case 'men':
        title.textContent = 'Мужчинам';
        break;
      case 'women':
        title.textContent = 'Женщинам';
        break;
      case 'kids':
        title.textContent = 'Детям';
        break;
    }
    
    getGoods(renderGoodsList, hash);
  });

} catch (err) {
  console.warn(err);
}

// слушатели

subheaderCart.addEventListener('click', openCartModal);

cartOverlay.addEventListener('click', (evt) => {
  const target = evt.target;

  if (target.classList.contains('cart__btn-close') || target.matches('.cart-overlay')) {
    closeCartModal();
  }
});
