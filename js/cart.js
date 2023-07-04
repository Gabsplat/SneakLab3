import { baseUrl, supabaseHeaders } from "./script.js";

async function getShoeById(id) {
  console.log("id: ", id);
  return fetch(baseUrl + `/shoes?select=*,sizes(*)&id=eq.${id}`, {
    method: "GET",
    headers: supabaseHeaders,
  })
    .then((response) => response.json())
    .then((data) => data[0]);
}

function deleteFromCart({ id, size }) {
  localStorage.removeItem("shoe-" + id + "-size-" + size);
  location.reload();
}

function getItemsFromCart() {
  let items = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.includes("shoe")) {
      const item = JSON.parse(localStorage.getItem(key));
      items[key] = item;
    }
  }
  return items;
}

function updateCartQty({ id, size, qty }) {
  let item = JSON.parse(localStorage.getItem("shoe-" + id + "-size-" + size));
  item.qty = qty;
  localStorage.setItem("shoe-" + id + "-size-" + size, JSON.stringify(item));
}

async function createCartCard({ id, size, qty }) {
  let card = document.createElement("div");
  let { name, price, image_url } = await getShoeById(id);
  console.log(name, price, image_url);
  card.classList.add("cart-product");
  card.setAttribute("id", id);
  card.innerHTML = `
      <div class="name">
        <img
          src="${image_url}"
          alt=""
        />
        <span class="">${name} - ${size}</span>
      </div>
      <div class="qty">
        <div class="qty-group">
          <button class="qty-btn minus">-</button>
          <span class="count">${qty}</span>
          <button class="qty-btn add">+</button>
        </div>
      </div>
      <div class="subtotal">
        <span class="price">$${price}</span>
        <span class="delete">X</span>
      </div>
  `;

  // Counter
  let countElement = card.querySelector(".count");
  let minusButton = card.querySelector(".qty-btn.minus");
  let addButton = card.querySelector(".qty-btn.add");

  let count = qty;

  minusButton.addEventListener("click", () => {
    if (count > 1) {
      count--;
      countElement.textContent = count;
      updateCartQty({ id, size, qty: count });
    }
  });

  addButton.addEventListener("click", () => {
    count++;
    countElement.textContent = count;
    updateCartQty({ id, size, qty: count });
  });

  // Eraser
  let deleteButton = card.querySelector(".delete");
  deleteButton.addEventListener("click", () => {
    deleteFromCart({ id, size });
  });

  return card;
}

function insertCards() {
  const cartContainer = document.querySelector("#cart-products");
  const items = getItemsFromCart();
  if (Object.keys(items).length > 0) {
    // Items is an object with the items in the cart
    for (const key in items) {
      const item = items[key];
      console.log(items[key]);
      createCartCard(item).then((card) => {
        cartContainer.appendChild(card);
      });
    }
  } else {
    const emptyCart = document.createElement("h2");
    emptyCart.textContent = "No tienes productos en el carrito";
    cartContainer.appendChild(emptyCart);
  }
  // const card = createCartCard({
  //   id: 1,
  //   name: "Nike Air Max",
  //   size: 42,
  //   price: 210,
  //   image_url: "https://via.placeholder.com/150",
  // });
  // cartContainer.appendChild(card);
  // const card2 = createCartCard({
  //   id: 2,
  //   name: "Nike Air Force",
  //   size: 43,
  //   price: 200,
  //   image_url: "https://via.placeholder.com/150",
  // });
  // cartContainer.appendChild(card2);
}

insertCards();
// console.log(getItemsFromCart());
