// выбор города

const headerCityButton = document.querySelector('.header__city-button');
let hash = location.hash.substring(1);
const lsLocation = localStorage.getItem('lomoda-location');
const defaultValue = 'Ваш город?';

headerCityButton.textContent = lsLocation || defaultValue;

headerCityButton.addEventListener('click', () => {
  const city = prompt('Укажите ваш город');
  
  if (city !== null && city.trim() !== '') {
    headerCityButton.textContent = city;
    localStorage.setItem('lomoda-location', city);
  }
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

const getGoods = (callback, value, prop) => {
  getData()
    .then((data) => {
      if (value) {
        callback(data.filter(item => item[prop] === value));
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

  getGoods(renderGoodsList, hash, 'category');

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
    
    getGoods(renderGoodsList, hash, 'category');
  });

} catch (err) {
  console.warn(err);
}

// страница товара

try {
  const cardGood = document.querySelector('.card-good');
  
  if (!cardGood) {
    throw 'This is not card-good page';
  }
  
  const cardGoodImage = document.querySelector('.card-good__image');
  const cardGoodBrand = document.querySelector('.card-good__brand');
  const cardGoodTitle = document.querySelector('.card-good__title');
  const cardGoodPrice = document.querySelector('.card-good__price');
  const cardGoodColor = document.querySelector('.card-good__color');
  const cardGoodSelectWrapper = document.querySelectorAll('.card-good__select__wrapper');
  const cardGoodColorList = document.querySelector('.card-good__color-list');
  const cardGoodSizes = document.querySelector('.card-good__sizes');
  const cardGoodSizesList = document.querySelector('.card-good__sizes-list');
  const cardGoodBuy = document.querySelector('.card-good__buy');
  
  const generateList = (data) => {
    return data.reduce((html, item, i) => {
      return html + `<li class="card-good__select-item" data-id="${i}">${item}</li>`;
    }, '');
  };

  const renderCardGood = ([{ brand, name, cost, color, sizes, photo }]) => {
    cardGoodImage.src = `goods-image/${photo}`;
    cardGoodImage.alt = `${brand} ${name}`;
    cardGoodBrand.textContent = brand;
    cardGoodTitle.textContent = name;
    cardGoodPrice.textContent = `${cost} ₽`;

    if (color) {
      cardGoodColor.textContent = color[0];
      cardGoodColor.dataset.id = 0;
      cardGoodColorList.innerHTML = generateList(color);
    } else {
      cardGoodColor.style.display = 'none';
    }
  
    if (sizes) {
      cardGoodSizes.textContent = sizes[0];
      cardGoodSizes.dataset.id = 0;
      cardGoodSizesList.innerHTML = generateList(sizes);
    } else {
      cardGoodColor.style.display = 'none';
    }
  };
  
  cardGoodSelectWrapper.forEach(item => {
    item.addEventListener('click', (evt) => {
      const target = evt.target;

      if (target.closest('.card-good__select')) {
        target.classList.toggle('card-good__select__open');
      }

      if (target.closest('.card-good__select-item')) {
        const cardGoodSelect = item.querySelector('.card-good__select');
        cardGoodSelect.textContent = target.textContent;
        cardGoodSelect.dataset.id = target.textContent;
        cardGoodSelect.classList.remove('card-good__select__open');
      }
    });
  });
  
  getGoods(renderCardGood, hash, 'id');

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

