const products = [
  {
    id: "bns-signature-01",
    name: "BNS Signature Purse",
    price: 179,
    description:
      "Borsa artigianale in piccola serie, realizzata con finiture raffinate e silhouette versatile.",
    colors: ["Oro", "Blue"],
    images: [
      "img/closeup_01.png",
      "img/closeup_02.png",
      "img/lifestyle_01.png",
      "img/lifestyle_02.png",
      "img/lifestyle_07.png",
      "img/lifestyle_08.png",
      "img/lifestyle_09.png"
    ]
  }
];

const state = {
  selectedProduct: products[0],
  selectedImage: products[0].images[0],
  cart: JSON.parse(localStorage.getItem("bns_cart") || "[]")
};

const euro = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR"
});

const dom = {
  year: document.getElementById("year"),
  productName: document.getElementById("productName"),
  productPrice: document.getElementById("productPrice"),
  productDescription: document.getElementById("productDescription"),
  color: document.getElementById("color"),
  qty: document.getElementById("qty"),
  qtyDown: document.getElementById("qtyDown"),
  qtyUp: document.getElementById("qtyUp"),
  thumbs: document.getElementById("thumbs"),
  mainProductImage: document.getElementById("mainProductImage"),
  addToCart: document.getElementById("addToCart"),
  quickBuy: document.getElementById("quickBuy"),
  cartCount: document.getElementById("cartCount"),
  cartDrawer: document.getElementById("cartDrawer"),
  openCart: document.getElementById("openCart"),
  closeCart: document.getElementById("closeCart"),
  backdrop: document.getElementById("backdrop"),
  cartItems: document.getElementById("cartItems"),
  cartSubtotal: document.getElementById("cartSubtotal"),
  checkoutBtn: document.getElementById("checkoutBtn"),
  heroImage: document.getElementById("heroImage"),
  galleryItems: [...document.querySelectorAll(".gallery-item")],
  nextSlide: document.getElementById("nextSlide"),
  prevSlide: document.getElementById("prevSlide"),
  reveal: [...document.querySelectorAll(".reveal")]
};

let galleryIndex = 0;

function init() {
  dom.year.textContent = new Date().getFullYear();
  renderProduct(state.selectedProduct);
  renderCart();
  bindEvents();
  startHeroRotation();
  startStorySlider();
  setupReveal();
}

function renderProduct(product) {
  dom.productName.textContent = product.name;
  dom.productPrice.textContent = euro.format(product.price);
  dom.productDescription.textContent = product.description;

  dom.color.innerHTML = "";
  product.colors.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    dom.color.appendChild(opt);
  });

  dom.thumbs.innerHTML = "";
  product.images.forEach((src, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `thumb ${index === 0 ? "active" : ""}`;
    btn.setAttribute("aria-label", `Anteprima ${index + 1}`);
    btn.innerHTML = `<img src="${src}" alt="Anteprima prodotto BNS ${index + 1}">`;
    btn.addEventListener("click", () => setMainImage(src, btn));
    dom.thumbs.appendChild(btn);
  });

  setMainImage(product.images[0], dom.thumbs.querySelector(".thumb"));
}

function setMainImage(src, activeBtn) {
  state.selectedImage = src;
  dom.mainProductImage.src = src;
  [...dom.thumbs.children].forEach((thumb) => thumb.classList.remove("active"));
  if (activeBtn) activeBtn.classList.add("active");
}

function bindEvents() {
  dom.qtyDown.addEventListener("click", () => {
    const next = Math.max(1, Number(dom.qty.value || 1) - 1);
    dom.qty.value = next;
  });

  dom.qtyUp.addEventListener("click", () => {
    const next = Math.max(1, Number(dom.qty.value || 1) + 1);
    dom.qty.value = next;
  });

  dom.qty.addEventListener("change", () => {
    if (Number(dom.qty.value) < 1) dom.qty.value = 1;
  });

  dom.addToCart.addEventListener("click", () => {
    addCurrentToCart();
    openCart();
  });

  dom.quickBuy.addEventListener("click", () => {
    addCurrentToCart();
    openCart();
    dom.checkoutBtn.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  dom.openCart.addEventListener("click", openCart);
  dom.closeCart.addEventListener("click", closeCart);
  dom.backdrop.addEventListener("click", closeCart);

  dom.checkoutBtn.addEventListener("click", () => {
    alert("Checkout frontend pronto. Puoi ora collegare Stripe/PayPal o una pagina checkout dedicata.");
  });

  if (dom.nextSlide) dom.nextSlide.addEventListener("click", () => shiftGallery(1));
  if (dom.prevSlide) dom.prevSlide.addEventListener("click", () => shiftGallery(-1));
}

function addCurrentToCart() {
  const quantity = Math.max(1, Number(dom.qty.value || 1));
  const color = dom.color.value;
  const product = state.selectedProduct;

  const existing = state.cart.find((item) => item.id === product.id && item.color === color);
  if (existing) {
    existing.quantity += quantity;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      color,
      price: product.price,
      quantity,
      image: state.selectedImage
    });
  }

  persistCart();
  renderCart();
}

function renderCart() {
  dom.cartItems.innerHTML = "";

  if (!state.cart.length) {
    dom.cartItems.innerHTML = "<p class=\"muted\">Il carrello e vuoto.</p>";
  } else {
    state.cart.forEach((item, index) => {
      const row = document.createElement("article");
      row.className = "cart-row";
      row.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div>
          <h4>${item.name}</h4>
          <p>${item.color} - Qta ${item.quantity}</p>
          <p>${euro.format(item.price * item.quantity)}</p>
          <button class="remove" data-index="${index}">Rimuovi</button>
        </div>
      `;
      dom.cartItems.appendChild(row);
    });
  }

  dom.cartItems.querySelectorAll(".remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.index);
      state.cart.splice(idx, 1);
      persistCart();
      renderCart();
    });
  });

  const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  dom.cartCount.textContent = count;
  dom.cartSubtotal.textContent = euro.format(subtotal);
}

function persistCart() {
  localStorage.setItem("bns_cart", JSON.stringify(state.cart));
}

function openCart() {
  dom.cartDrawer.classList.add("open");
  dom.backdrop.classList.add("open");
}

function closeCart() {
  dom.cartDrawer.classList.remove("open");
  dom.backdrop.classList.remove("open");
}

function shiftGallery(direction) {
  galleryIndex = (galleryIndex + direction + dom.galleryItems.length) % dom.galleryItems.length;
  dom.galleryItems.forEach((img, idx) => img.classList.toggle("active", idx === galleryIndex));
}

function startStorySlider() {
  galleryIndex = 0;
  dom.galleryItems.forEach((img, idx) => img.classList.toggle("active", idx === galleryIndex));
}

function startHeroRotation() {
  dom.heroImage.src = "img/lifestyle_08.png";
}

function setupReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  dom.reveal.forEach((el) => observer.observe(el));
}

init();
