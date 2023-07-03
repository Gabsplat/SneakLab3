import {
  baseUrl,
  insertShoesCards,
  supabaseHeaders,
  updateCartCounter,
} from "./script.js";

async function getShoes(amount = 6) {
  const response = await fetch(baseUrl + "/shoes?select=*", {
    method: "GET",
    headers: {
      ...supabaseHeaders,
      Range: `0-${amount - 1}`,
    },
  });
  const data = await response.json();
  return data;
}

async function getDiscountedShoes(amount = 6) {
  const response = await fetch(
    baseUrl + "/shoes?select=*&discount_price=not.is.null",
    {
      method: "GET",
      headers: {
        ...supabaseHeaders,
        Range: `0-${amount - 1}`,
      },
    }
  );
  const data = await response.json();
  return data;
}

getShoes().then((shoes) => {
  if (shoes.length > 0) {
    insertShoesCards(shoes, "#recommended-products");
  }
});

getDiscountedShoes().then((shoes) => {
  if (shoes.length > 0) {
    insertShoesCards(shoes, "#discount-products");
  }
});

updateCartCounter();
