// выбор города

const headerCityButton = document.querySelector('.header__city-button');

headerCityButton.textContent = localStorage.getItem('lomoda-location') || 'Ваш город?';

headerCityButton.addEventListener('click', () => {
  const city = prompt('Укажите ваш город');
  headerCityButton.textContent = city;

  localStorage.setItem('lomoda-location', city);
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
  const scrollWidth = window.innerWidth - document.body.offsetWidth;

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

const getGoods = (callback) => {
  getData()
    .then(data => callback(data))
    .catch(err => console.error(err));
};

getGoods((data) => {
  console.warn(data);
});

// слушатели

subheaderCart.addEventListener('click', openCartModal);

cartOverlay.addEventListener('click', (evt) => {
  const target = evt.target;

  if (target.classList.contains('cart__btn-close') || target.matches('.cart-overlay')) {
    closeCartModal();
  }
});
