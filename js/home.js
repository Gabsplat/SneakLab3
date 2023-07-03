import {
  baseUrl,
  insertShoesCards,
  supabaseHeaders,
  updateCartCounter,
} from "./script.js";

insertShoesCards("#discount-products");
insertShoesCards("#recommended-products");

updateCartCounter();
