import {
  getCouponAmount,
  getItemsFromCart,
  getPrices,
  updateSummaryPrices,
} from "./cart.js";
import { baseUrl, supabaseHeaders } from "./script.js";

async function getArgentinianCities() {
  return fetch("https://apis.datos.gob.ar/georef/api/provincias", {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => data.provincias.map((provincia) => provincia));
}

let shipmentChosen = false;
let addressGroup = document.querySelectorAll(".address-group");

let shippingRadio = document.querySelectorAll('input[name="shipping-type"]');
shippingRadio.forEach((radio) => {
  radio.addEventListener("change", (e) => {
    if (e.target.value === "pick-up") {
      if (shipmentChosen) {
        localStorage.setItem("shipping", "");
        updateSummaryPrices();
      }
      addressGroup.forEach((group) => {
        group.classList.add("hidden");
      });
    } else {
      shipmentChosen = true;
      addressGroup.forEach((group) => {
        group.classList.remove("hidden");
      });
    }
  });
});

function getBasicData() {
  let formData = new FormData(document.querySelector("#checkout-form"));
  let data = {};
  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }
  return data;
}

function getShipmentData() {
  let formData = new FormData(document.querySelector("#shipment-form"));
  let data = {};
  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }
  return data;
}

/* Select Provincias */

let provinces = await getArgentinianCities();
let provinceSelect = document.querySelector("#province");
provinces.forEach((province) => {
  let option = document.createElement("option");
  option.value = JSON.stringify(province);
  option.textContent = province.nombre;
  provinceSelect.appendChild(option);
});

/* Calcular costo de envío */

let addressForm = document.querySelector("#shipment-form");
addressForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let shipmentData = getShipmentData();
  localStorage.setItem("shipping", shipmentData.province);
  updateSummaryPrices();
});

/* Deshabilitar boton si no hay productos, o finalizar pago */
let finalizePayButton = document.querySelector("#finalize-pay-button");
let amountItemsInCart = Object.keys(getItemsFromCart()).length;
if (amountItemsInCart === 0) {
  finalizePayButton.disabled = true;
} else if (amountItemsInCart > 0) {
  let checkoutForm = document.querySelector("#checkout-form");
  let errorMessage = document.querySelector("#checkout-error-message");
  finalizePayButton.addEventListener("click", async () => {
    errorMessage.classList.add("hidden");

    if (checkoutForm.checkValidity()) {
      let basicData = getBasicData();
      openModal("modal-1");
      let modalEmail = document.querySelector("#modal-client-email");
      modalEmail.textContent = basicData.email;
      resetCart();
    } else {
      errorMessage.classList.remove("hidden");
    }
  });
}

function getCouponUsesLeft(code) {
  return fetch(`${baseUrl}/discounts?code=eq.${code}`, {
    method: "GET",
    headers: supabaseHeaders,
  })
    .then((response) => response.json())
    .then((data) => data[0]["uses-left"]);
}

async function useCoupon(code) {
  let usesLeft = await getCouponUsesLeft(code);
  return fetch(`${baseUrl}/discounts?code=eq.${code}`, {
    method: "PATCH",
    headers: {
      ...supabaseHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "uses-left": usesLeft - 1,
    }),
  })
    .then((response) => response.json())
    .then((data) => data);
}

async function resetCart() {
  let cart = getItemsFromCart();
  for (let key in cart) {
    localStorage.removeItem(key);
  }
  useCoupon(localStorage.getItem("coupon-code"));
  localStorage.setItem("coupon-code", "");
  localStorage.setItem("shipping", "");
}

/* Modal */

function openModal(id) {
  document.getElementById(id).classList.add("open");
  document.body.classList.add("jw-modal-open");
}

let closeModalButton = document.querySelector("#close-modal-button");
closeModalButton.addEventListener("click", () => {
  document.querySelector(".jw-modal.open").classList.remove("open");
  document.body.classList.remove("jw-modal-open");
  window.location = "/index.html";
});

window.addEventListener("load", function () {
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("jw-modal")) {
      closeModal();
    }
  });
});

console.log(getItemsFromCart());
