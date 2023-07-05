import { baseUrl, supabaseHeaders, updateCartCounter } from "./script.js";

let urlParams = new URLSearchParams(window.location.search);
let id = urlParams.get("id");

async function getShoeById(id) {
  return fetch(baseUrl + `/shoes?select=*,sizes(*)&id=eq.${id}`, {
    method: "GET",
    headers: supabaseHeaders,
  })
    .then((response) => response.json())
    .then((data) => data);
}

function addToCart(data) {
  localStorage.setItem(
    "shoe-" + data.id + "-size-" + data.size,
    JSON.stringify(data)
  );
}

let addToCartButton = document.querySelector("#add-to-cart");
addToCartButton.addEventListener("click", (e) => {
  e.preventDefault();
  let sizeSelect = document.querySelector("#size-select");
  let size = sizeSelect.value;
  let shoeData = {
    id,
    size,
    qty: 1,
  };
  addToCart(shoeData);
  updateCartCounter();
});

getShoeById(id)
  .then((shoe) => {
    if (!shoe) {
      throw new Error("No shoe found");
    }

    let productImage = document.querySelector("#product-image");
    let productBrand = document.querySelector("#product-brand");
    let productName = document.querySelector("#product-name");
    let productDescription = document.querySelector("#product-description");
    let productPrice = document.querySelector("#product-price");
    let productPriceDiscount = document.querySelector(
      "#product-price-discount"
    );
    let sizeSelect = document.querySelector("#size-select");

    productImage.src = shoe[0].image_url;
    productBrand.textContent = shoe[0].brand;
    productName.textContent = shoe[0].name;
    productDescription.textContent = shoe[0].description;
    if (shoe[0].discount_price) {
      productPriceDiscount.textContent = "$" + shoe[0].price;
      productPrice.textContent = "$" + shoe[0].discount_price;
    } else {
      productPrice.textContent = "$" + shoe[0].price;
      productPriceDiscount.style.display = "none";
    }

    console.log(shoe[0].sizes);
    // order shoe[0].sizes object that contains a size property ascending
    shoe[0].sizes
      .sort((a, b) => {
        return a.size - b.size;
      })
      .forEach((size) => {
        let option = document.createElement("option");
        option.value = size.size;
        option.textContent = size.size;
        sizeSelect.appendChild(option);
      });
  })
  .catch((err) => {
    document.querySelector("#no-product-found").style.display = "flex";
    document.querySelector("#product-content").style.display = "none";
  });
