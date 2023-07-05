import { baseUrl, supabaseHeaders } from "./script.js";

const mendozaCoords = {
  lat: -34.629887,
  lon: -68.583122,
};

function calcDistance(lat1, lon1, lat2, lon2) {
  var R = 6371;
  var dLat = toRad(lat2 - lat1);
  var dLon = toRad(lon2 - lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}

function toRad(value) {
  return (value * Math.PI) / 180;
}

async function getShoeById(id) {
  return fetch(baseUrl + `/shoes?select=*,sizes(*)&id=eq.${id}`, {
    method: "GET",
    headers: supabaseHeaders,
  })
    .then((response) => response.json())
    .then((data) => data[0]);
}

export async function getCouponAmount(coupon_id) {
  if (!coupon_id) return 0;
  return fetch(
    baseUrl + `/discounts?select=*&code=eq.${coupon_id}&uses-left=gte.1`,
    {
      method: "GET",
      headers: supabaseHeaders,
    }
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        return data[0].amount;
      }
      return 0;
    })
    .catch(() => 0);
}

function deleteFromCart({ id, size }) {
  localStorage.removeItem("shoe-" + id + "-size-" + size);
  location.reload();
}

async function getSubtotalPrice() {
  let totalPrice = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.includes("shoe")) {
      const item = JSON.parse(localStorage.getItem(key));
      let shoe = await getShoeById(item.id);
      if (shoe.discount_price) {
        totalPrice += shoe.discount_price * item.qty;
      } else {
        totalPrice += shoe.price * item.qty;
      }
    }
  }
  return totalPrice;
}

export function getItemsFromCart() {
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

function getCurrentCouponCode() {
  const couponCode = localStorage.getItem("coupon-code");
  return couponCode;
}

function getCurrentShipping() {
  const shipping = localStorage.getItem("shipping");
  return shipping;
}

function getShippingValue() {
  let currentShipping = getCurrentShipping();
  let shipmentCost = 0;
  if (currentShipping !== "") {
    currentShipping = JSON.parse(currentShipping).centroide;
    let distance = calcDistance(
      mendozaCoords.lat,
      mendozaCoords.lon,
      currentShipping.lat,
      currentShipping.lon
    );
    if (distance > 1500) {
      shipmentCost = 40;
    } else if (distance > 1000) {
      shipmentCost = 30;
    } else if (distance > 500) {
      shipmentCost = 20;
    } else if (distance > 250) {
      shipmentCost = 10;
    }
  }
  return shipmentCost;
}

export async function getPrices() {
  let subtotal = await getSubtotalPrice();
  let total = subtotal;
  let discountAmount = 0;
  const shippingValue = getShippingValue();

  const couponCode = getCurrentCouponCode();
  if (couponCode !== null) {
    discountAmount = await getCouponAmount(couponCode);
    total -= discountAmount;
  }

  total += shippingValue;

  if (total < 0) {
    total = 0;
  }

  return {
    subtotal,
    shippingValue,
    discountAmount,
    total,
  };
}

export async function updateSummaryPrices() {
  const subtotalElement = document.querySelector("#subtotal-price");
  const shippingElement = document.querySelector("#shipping-price");
  const discountElement = document.querySelector("#discount-value");
  const totalElement = document.querySelector("#total-price");

  let { subtotal, shippingValue, discountAmount, total } = await getPrices();

  // let subtotal = await getSubtotalPrice();
  // let total = subtotal;
  // let discountAmount = 0;
  // const shippingValue = getShippingValue();

  // const couponCode = getCurrentCouponCode();
  // if (couponCode !== null) {
  //   discountAmount = await getCouponAmount(couponCode);
  //   total -= discountAmount;
  // }

  // total += shippingValue;

  // if (total < 0) {
  //   total = 0;
  // }

  subtotalElement.textContent = `$${subtotal}`;
  shippingElement.textContent = `$${shippingValue}`;
  discountElement.textContent = `$${discountAmount}`;
  totalElement.textContent = `$${total}`;
}

async function createCartCard({ id, size, qty }) {
  let card = document.createElement("div");
  let { name, price, image_url, discount_price } = await getShoeById(id);

  card.classList.add("cart-product");
  card.setAttribute("id", id);
  card.innerHTML = `
      <div class="name">
        <img
          src="${image_url}"
          alt=""
        />
        <span class="">${name} - T${size}</span>
      </div>
      <div class="qty">
        <div class="qty-group">
          <button class="qty-btn minus">-</button>
          <span class="count">${qty}</span>
          <button class="qty-btn add">+</button>
        </div>
      </div>
      <div class="subtotal">
        <span class="price">$${
          discount_price ? discount_price * qty : price * qty
        }</span>
        <span class="delete">X</span>
      </div>
  `;

  // Counter
  let countElement = card.querySelector(".count");
  let minusButton = card.querySelector(".qty-btn.minus");
  let addButton = card.querySelector(".qty-btn.add");
  let priceElement = card.querySelector(".price");

  let count = qty;

  minusButton.addEventListener("click", () => {
    if (count > 1) {
      count--;
      countElement.textContent = count;
      priceElement.textContent = `$${
        discount_price ? discount_price * count : price * count
      }`;
      updateCartQty({ id, size, qty: count });
      updateSummaryPrices();
    }
  });

  addButton.addEventListener("click", () => {
    count++;
    countElement.textContent = count;
    priceElement.textContent = `$${
      discount_price ? discount_price * count : price * count
    }`;
    updateCartQty({ id, size, qty: count });
    updateSummaryPrices();
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
  if (Object.keys(items).length > 0 && cartContainer) {
    for (const key in items) {
      const item = items[key];
      createCartCard(item).then((card) => {
        cartContainer.appendChild(card);
      });
    }
  } else {
    const productsSection = document.querySelector("#products-section");
    if (productsSection) {
      productsSection.classList.add("hidden");
    }

    const emptyCart = document.querySelector("#empty-cart");
    if (emptyCart) {
      emptyCart.classList.remove("hidden");
    }
  }
}

/* Coupon Form */

let discountForm = document.querySelector("#discount-form");
let couponApplied = false;

discountForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!couponApplied) {
    let errorElement = document.querySelector("#coupon-error-message");
    errorElement.classList.add("hidden");

    const couponCode = document.querySelector("#discount-code").value;
    getCouponAmount(couponCode).then((amount) => {
      if (amount > 0) {
        let successElement = document.querySelector("#coupon-success-message");
        let couponCodeElement = document.querySelector("#coupon-name");
        couponCodeElement.textContent = couponCode;
        successElement.classList.remove("hidden");
        localStorage.setItem("coupon-code", couponCode);
        couponApplied = true;
        updateSummaryPrices();
      } else {
        errorElement.classList.remove("hidden");
      }
    });
  }
});

/* Initial Load */

if (
  localStorage.getItem("coupon-code") !== "" &&
  localStorage.getItem("coupon-code") !== null
) {
  couponApplied = true;
  let couponSubmitButton = document.querySelector("#coupon-submit-button");
  let couponInput = document.querySelector("#discount-code");
  let successElement = document.querySelector("#coupon-success-message");
  let couponCodeElement = document.querySelector("#coupon-name");
  couponCodeElement.textContent = getCurrentCouponCode();
  successElement.classList.remove("hidden");
  couponSubmitButton.disabled = true;
  couponInput.disabled = true;
}

let payButton = document.querySelector("#pay-button");
let amountItemsInCart = Object.keys(getItemsFromCart()).length;
if (amountItemsInCart === 0 && payButton) {
  payButton.disabled = true;
} else if (amountItemsInCart > 0 && payButton) {
  payButton.addEventListener("click", () => {
    window.location.href = "./cart-checkout.html";
  });
}

updateSummaryPrices();
insertCards();
