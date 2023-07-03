import {
  baseUrl,
  createShoesCard,
  supabaseHeaders,
  updateCartCounter,
} from "./script.js";

const paginationSize = 12;

/* Filtros y búsqueda */
const urlParams = new URLSearchParams(window.location.search);
const brandsParam = urlParams.get("brands");
const sizesParam = urlParams.get("sizes");
const priceRangeParam = urlParams.get("priceRange");
const search = urlParams.get("search");
const order = urlParams.get("order");
const page = urlParams.get("page");

const filters = {
  brands: brandsParam ? brandsParam.split(",") : [],
  sizes: sizesParam ? sizesParam.split(",") : [],
  priceRange: priceRangeParam ? priceRangeParam.split(",") : [],
  search,
  order,
};

function getUrlWithFilters({ brands, sizes, priceRange, search, order }) {
  let url;

  if (sizes.length > 0) {
    url =
      baseUrl +
      `/shoes?select=id,name,price,description,image_url,brand,discount_price,sizes!inner(*)&sizes.size=in.${
        "(" + sizes.join(",") + ")"
      }`;
  } else {
    url =
      baseUrl +
      `/shoes?select=id,name,price,brand,image_url,description,discount_price,sizes(*)`;
  }

  if (brands.length > 0) {
    url += `&brand=in.${"(" + brands.join(",") + ")"}`;
  }

  if (priceRange.length > 0) {
    url += `&and=(price.gte.${priceRange[0]},price.lte.${priceRange[1]})`;
  } else {
    url += `&and=(price.gte.0,price.lte.32767)`;
  }

  if (order) {
    if (order == "priceAsc") {
      url += `&order=price.asc`;
    } else if (order == "priceDesc") {
      url += `&order=price.desc`;
    }
  }

  if (search) {
    url += `&name=ilike.%25${search}%25`;
  }

  return url;
}

function modifyFiltersDOM(filters) {
  // Orden de los productos
  if (filters.order) {
    let productsOrder = document.querySelector("#order-products");
    if (filters.order == "priceAsc") {
      productsOrder.value = "menorPrecio";
    } else if (filters.order == "priceDesc") {
      productsOrder.value = "mayorPrecio";
    }
  }

  // Marcas
  if (filters.brands.length > 0) {
    let brandsCheckboxes = document.querySelectorAll(
      ".brand.filter-group input[type=checkbox]"
    );

    brandsCheckboxes.forEach((checkbox) => {
      if (filters.brands.includes(checkbox.value)) {
        checkbox.checked = true;
      }
    });
  }

  // Tallas
  if (filters.sizes.length > 0) {
    let sizesCheckboxes = document.querySelectorAll(
      ".size.filter-group input[type=checkbox]"
    );

    sizesCheckboxes.forEach((checkbox) => {
      if (filters.sizes.includes(checkbox.value)) {
        checkbox.checked = true;
      }
    });
  }

  // Rango de precios
  if (filters.priceRange.length > 0) {
    let minPrice = document.querySelector("#minPrice");
    let maxPrice = document.querySelector("#maxPrice");

    minPrice.value = filters.priceRange[0];
    maxPrice.value = filters.priceRange[1];
  }
}

function modifyMiscDOM(filters) {
  // Búsqueda
  if (filters.search) {
    let searchInput = document.querySelector("#search-value");
    searchInput.innerHTML = filters.search;
  } else {
    let searchSection = document.querySelector("#search-section");
    searchSection.classList.add("hidden");
  }
}

async function getShoesWithCustomURL(url) {
  let range = [];
  if (page == 1) {
    range = [0, paginationSize - 1];
  } else {
    range = [(page - 1) * paginationSize, page * paginationSize - 1];
  }
  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...supabaseHeaders,
      Range: `${range.join("-")}`,
    },
  });
  const data = await response.json();
  return data;
}

async function insertProducts(shoes, selector) {
  const shoesContainer = document.querySelector(selector);
  shoes.forEach((shoe) => {
    const shoeCard = createShoesCard(shoe);
    shoesContainer.appendChild(shoeCard);
  });
}

/* Filters */
const filtersMenuButton = document.querySelector(".filters-menu");
filtersMenuButton.addEventListener("click", () => {
  if (filtersMenuButton.style.borderBottom != "") {
    filtersMenuButton.style.borderBottom = "";
  } else {
    filtersMenuButton.style.borderBottom = "2px solid #d9d9d9";
  }
  const filterGroups = document.querySelectorAll(".filter-group");
  filterGroups.forEach((filterGroup) => {
    if (filterGroup.style.display != "block") {
      filterGroup.style.display = "block";
    } else {
      filterGroup.style.display = "none";
    }
  });
});

/* Listeners */

// Orden de los productos
const productsOrder = document.querySelector("#order-products");
productsOrder.addEventListener("change", () => {
  let order = productsOrder.value;
  let baseUrl = window.location.pathname + (window.location.search || "?");
  let finalUrl;

  if (order == "mayorPrecio") {
    if (baseUrl.includes("priceAsc")) {
      finalUrl = baseUrl.replace("priceAsc", "priceDesc");
    } else if (!baseUrl.includes("order")) {
      finalUrl = baseUrl + "&order=priceDesc";
    } else {
      finalUrl = baseUrl;
    }
  } else if (order == "menorPrecio") {
    if (baseUrl.includes("priceDesc")) {
      finalUrl = baseUrl.replace("priceDesc", "priceAsc");
    } else if (!baseUrl.includes("order")) {
      finalUrl = baseUrl + "&order=priceAsc";
    } else {
      finalUrl = baseUrl;
    }
  }
  window.location = finalUrl;
});

// Filtrar
const filterButton = document.querySelector("#filter-button");
filterButton.addEventListener("click", (e) => {
  e.preventDefault();
  let brands = [];
  let sizes = [];
  let priceRange = [];
  let search = urlParams.get("search");
  let order = productsOrder.value;

  const brandsCheckboxes = document.querySelectorAll(
    ".brand.filter-group input[type=checkbox]"
  );
  brandsCheckboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      brands.push(checkbox.value);
    }
  });

  console.log(brands);

  const sizesCheckboxes = document.querySelectorAll(
    ".size.filter-group input[type=checkbox]"
  );
  sizesCheckboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      sizes.push(checkbox.value);
    }
  });

  let minPrice = document.querySelector("#minPrice").value;
  let maxPrice = document.querySelector("#maxPrice").value;
  if (minPrice != "") {
    priceRange.push(minPrice);
  } else {
    priceRange.push(0);
  }
  if (maxPrice != "") {
    priceRange.push(maxPrice);
  } else {
    priceRange.push(10000);
  }

  let baseUrl = window.location.pathname;
  let finalUrl = baseUrl + "?";

  if (search) {
    finalUrl += `search=${search}`;
  }

  if (brands.length > 0) {
    finalUrl += `&brands=${brands.join(",")}`;
  }

  if (sizes.length > 0) {
    finalUrl += `&sizes=${sizes.join(",")}`;
  }

  if (priceRange.length > 0) {
    finalUrl += `&priceRange=${priceRange.join(",")}`;
  }

  if (order == "mayorPrecio") {
    finalUrl += `&order=priceDesc`;
  } else if (order == "menorPrecio") {
    finalUrl += `&order=priceAsc`;
  }

  window.location = finalUrl;
});

/* Calls */

let url = getUrlWithFilters(filters);
getShoesWithCustomURL(url).then((shoes) => {
  if (shoes.length == 0) {
    let noProductsSection = document.querySelector("#no-products");
    noProductsSection.classList.remove("hidden");
    document.querySelector("#end-products").classList.add("hidden");
    return;
  }

  if (shoes.length < paginationSize) {
    document.querySelector("#end-products").classList.add("hidden");
  }
  insertProducts(shoes, "#product-section");
});
modifyFiltersDOM(filters);
modifyMiscDOM(filters);
