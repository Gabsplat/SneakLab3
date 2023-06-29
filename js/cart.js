function deleteFromCart(id) {
  localStorage.removeItem("shoe-" + id);
  location.reload();
}

function getItemsFromCart() {
  let items = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.includes("shoe")) {
      const item = JSON.parse(localStorage.getItem(key));
      items.push(item);
    }
  }
  return items;
}

// deleteFromCart(2);
console.log(getItemsFromCart());
