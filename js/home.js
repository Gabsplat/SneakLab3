const baseUrl = "https://ankbyqnqwkoduboshrsd.supabase.co/rest/v1/";

const supabaseHeaders = {
  apikey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFua2J5cW5xd2tvZHVib3NocnNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODc3OTQ1OTcsImV4cCI6MjAwMzM3MDU5N30.b9SW_Hy3JQsb51rB1QCYexHkQuJP3utk0ABGE0x9mn0",
  Authorization:
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFua2J5cW5xd2tvZHVib3NocnNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODc3OTQ1OTcsImV4cCI6MjAwMzM3MDU5N30.b9SW_Hy3JQsb51rB1QCYexHkQuJP3utk0ABGE0x9mn0",
};

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

function createShoesCard(shoe) {
  const name = shoe.name.split(" ");
  const brand = name[0];
  const model = name.slice(1).join(" ");
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

async function insertShoesCards(selector) {
  const shoesContainer = document.querySelector(selector);
  const shoes = await getShoes();
  shoes.forEach((shoe) => {
    const shoeCard = createShoesCard(shoe);
    shoesContainer.appendChild(shoeCard);
  });
}

insertShoesCards("#discount-products");
insertShoesCards("#recommended-products");

getShoes().then((data) => console.log(data));
