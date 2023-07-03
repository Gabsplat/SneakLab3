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

/* Cart items and Shoes */
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

export function createShoesCard(shoe) {
  const model = shoe.name;
  const brand = shoe.brand;
  const shoeCard = document.createElement("a");
  shoeCard.classList.add("product");
  shoeCard.href = `./product.html?id=${shoe.id}`;
  shoeCard.innerHTML = `
    <img src="${shoe["image_url"]}" alt="" />
    <div class="product-info">
      <h3>${brand}</h3>
      <p>${model}</p>
      <p class="price">$${shoe.price}</p>
    </div>
  `;

  return shoeCard;
}

function addToCart(data) {
  localStorage.setItem("shoe-" + data.id, JSON.stringify(data));
}

export async function insertShoesCards(selector) {
  const shoesContainer = document.querySelector(selector);
  const shoes = await getShoes();
  shoes.forEach((shoe) => {
    const shoeCard = createShoesCard(shoe);
    shoesContainer.appendChild(shoeCard);
  });
}

export function updateCartCounter() {
  const cartCounter = document.querySelectorAll(".cart-counter");
  cartCounter.forEach((counter) => {
    counter.textContent = localStorage.length;
  });
}

updateCartCounter();

/* Footer */

const year = document.querySelector("#current-year");
const currentYear = new Date().getFullYear();
year.textContent = currentYear;

// async function getAllShoes() {
//   const response = await fetch(
//     baseUrl + "/shoes?select=id,name,price,sizes(size, stock)",
//     {
//       method: "GET",
//       headers: supabaseHeaders,
//     }
//   );
//   const data = await response.json();
//   return data;
// }

// async function getShoeById(id) {
//   return fetch(baseUrl + `/shoes?id=eq.${id}&select=*,sizes(shoe_id)`, {
//     method: "GET",
//     headers: supabaseHeaders,
//   })
//     .then((response) => response.json())
//     .then((data) => data);
// }

// function getDistanciaMetros(lat1, lon1, lat2, lon2) {
//   rad = function (x) {
//     return (x * Math.PI) / 180;
//   };
//   var R = 6378.137; //Radio de la tierra en km
//   var dLat = rad(lat2 - lat1);
//   var dLong = rad(lon2 - lon1);
//   var a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(rad(lat1)) *
//       Math.cos(rad(lat2)) *
//       Math.sin(dLong / 2) *
//       Math.sin(dLong / 2);
//   var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//   //aquí obtienes la distancia en metros por la conversion 1Km =1000m
//   var d = R * c * 1000;
//   return d;
// }

// console.log("hola");
// async function getArgentinianCities() {
//   // fetch get this https://apis.datos.gob.ar/georef/api/provincias
//   // return only the cities

//   return fetch("https://apis.datos.gob.ar/georef/api/provincias", {
//     method: "GET",
//   })
//     .then((response) => response.json())
//     .then((data) => data.provincias.map((provincia) => provincia.centroide));
// }

// console.log(
//   "Distancia entre Mendoza y Buenos Aires: ",
//   getDistanciaMetros(-32.890183, -68.84405, -34.603722, -58.381592)
// );
