export const baseUrl = "https://ankbyqnqwkoduboshrsd.supabase.co/rest/v1/";
export const supabaseHeaders = {
  apikey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFua2J5cW5xd2tvZHVib3NocnNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODc3OTQ1OTcsImV4cCI6MjAwMzM3MDU5N30.b9SW_Hy3JQsb51rB1QCYexHkQuJP3utk0ABGE0x9mn0",
  Authorization:
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFua2J5cW5xd2tvZHVib3NocnNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODc3OTQ1OTcsImV4cCI6MjAwMzM3MDU5N30.b9SW_Hy3JQsb51rB1QCYexHkQuJP3utk0ABGE0x9mn0",
  "Access-Control-Allow-Origin": "*",
};

/* Menu */

const menuButton = document.querySelector("#menu-button");
const menu = document.querySelector(".nav-menu");

menuButton.addEventListener("click", () => {
  menu.classList.toggle("hidden");
});

// Search

const searchForm = document.querySelector("#search-form");
const searchFormMobile = document.querySelector("#search-form-mobile");

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchInput = document.querySelector("#search-input");

  const search = searchInput.value;
  window.location.href = `./products.html?search=${search}`;
});
searchFormMobile.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchInput = document.querySelector("#search-input-mobile");

  const search = searchInput.value;
  window.location.href = `./products.html?search=${search}`;
});

/* Cart items and Shoes */

export function createShoesCard(shoe) {
  const model = shoe.name;
  const brand = shoe.brand;
  const shoeCard = document.createElement("a");
  shoeCard.classList.add("product");
  shoeCard.href = `./product.html?id=${shoe.id}`;
  shoeCard.innerHTML = `
    <img src="${shoe["image_url"]}" alt="" />
    <div class="product-info">
      <div>
        <h3>${brand}</h3>
        <p>${model}</p>
      </div>
      <div class="price-info">
        <p class="price ${shoe.discount_price ? "discounted" : ""}">$${
    shoe.price
  }</p>
        ${
          shoe.discount_price
            ? `<p class="discount">&nbsp$${shoe.discount_price}</p>`
            : ""
        }
      </div>
    </div>
  `;

  return shoeCard;
}

export async function insertShoesCards(shoes, selector) {
  const shoesContainer = document.querySelector(selector);
  shoes.forEach((shoe) => {
    const shoeCard = createShoesCard(shoe);
    shoesContainer.appendChild(shoeCard);
  });
}

export function updateCartCounter() {
  const cartCounter = document.querySelectorAll(".cart-counter");
  cartCounter.forEach((counter) => {
    counter.textContent = localStorage.length - 2;
  });
}

function instantiateLocalStorageCart() {
  const couponCode = "";
  const shippingLocation = "";

  localStorage.setItem("coupon-code", couponCode);
  localStorage.setItem("shipping", shippingLocation);
}
if (
  localStorage.getItem("coupon-code") === null ||
  localStorage.getItem("shipping") === null
) {
  instantiateLocalStorageCart();
}

updateCartCounter();

/* Footer */

const year = document.querySelector("#current-year");
const currentYear = new Date().getFullYear();
year.textContent = currentYear;
