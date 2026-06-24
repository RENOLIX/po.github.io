import { motion } from "motion/react";
import {
  ArrowRight,
  Check,
  Heart,
  Menu,
  Minus,
  Phone,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { freeShippingThreshold, products, shippingRates, wilayas, type DeliveryMethod, type Product } from "./data";

type CartItem = {
  product: Product;
  quantity: number;
  size: string;
};

type OrderForm = {
  name: string;
  phone: string;
  wilaya: string;
  address: string;
  deliveryMethod: DeliveryMethod;
  note: string;
};

const money = (value: number) => `${value.toLocaleString("fr-DZ")} DA`;

const initialForm: OrderForm = {
  name: "",
  phone: "",
  wilaya: "",
  address: "",
  deliveryMethod: "domicile",
  note: "",
};

function App() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("perle-cart") || "[]") as CartItem[];
    } catch {
      return [];
    }
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState<OrderForm>(initialForm);
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem("perle-cart", JSON.stringify(cart));
  }, [cart]);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShipping = subtotal >= freeShippingThreshold;
  const shipping = form.wilaya ? (freeShipping ? 0 : shippingRates[form.wilaya]?.[form.deliveryMethod] ?? 0) : 0;
  const total = subtotal + shipping;
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product, size = product.sizes[0]) => {
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id && item.size === size);
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id && item.size === size ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...current, { product, size, quantity: 1 }];
    });
    setDrawerOpen(true);
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    setCart((current) =>
      current
        .map((item) => (item.product.id === productId && item.size === size ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const submitOrder = (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!cart.length) {
      setError("Votre panier est vide. Ajoutez au moins un article avant de confirmer.");
      return;
    }

    if (!form.name.trim() || !/^\d{10}$/.test(form.phone.trim()) || !form.wilaya || !form.address.trim()) {
      setError("Veuillez remplir le nom, un telephone a 10 chiffres, la wilaya et l'adresse precise.");
      return;
    }

    const nextOrder = {
      id: `PO-${Date.now().toString().slice(-6)}`,
      customer: form,
      items: cart,
      subtotal,
      shipping,
      total,
      payment: "Paiement a la livraison",
      createdAt: new Date().toISOString(),
    };

    const orders = JSON.parse(localStorage.getItem("perle-orders") || "[]") as unknown[];
    localStorage.setItem("perle-orders", JSON.stringify([nextOrder, ...orders]));
    setOrderNumber(nextOrder.id);
    setCart([]);
    setForm(initialForm);
  };

  return (
    <div>
      <header className="site-header">
        <div className="nav-shell">
          <a className="brand" href="#accueil" aria-label="La Perle d'Orient">
            <span>PO</span>
            <strong>La Perle d'Orient</strong>
          </a>
          <button className="icon-button menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <Menu />
          </button>
          <nav className={menuOpen ? "main-nav open" : "main-nav"}>
            <a href="#collections" onClick={() => setMenuOpen(false)}>Collections</a>
            <a href="#experience" onClick={() => setMenuOpen(false)}>Experience</a>
            <a href="#commande" onClick={() => setMenuOpen(false)}>Commander</a>
            <a href="tel:0550000000" onClick={() => setMenuOpen(false)}>Contact</a>
          </nav>
          <button className="cart-pill" onClick={() => setDrawerOpen(true)} aria-label={`Panier ${count} articles`}>
            <ShoppingBag />
            <span>{count}</span>
          </button>
        </div>
      </header>

      <main>
        <Hero />
        <TrustBar />
        <Collections onAdd={addToCart} />
        <Experience />
        <Checkout
          cart={cart}
          form={form}
          setForm={setForm}
          subtotal={subtotal}
          shipping={shipping}
          total={total}
          freeShipping={freeShipping}
          error={error}
          onSubmit={submitOrder}
        />
      </main>

      <Footer />
      <CartDrawer
        open={drawerOpen}
        cart={cart}
        subtotal={subtotal}
        onClose={() => setDrawerOpen(false)}
        onQuantity={updateQuantity}
        onRemove={(productId, size) => updateQuantity(productId, size, 0)}
      />
      <OrderSuccess orderNumber={orderNumber} onClose={() => setOrderNumber("")} />
    </div>
  );
}

function Hero() {
  return (
    <section id="accueil" className="hero">
      <img src="./images/hero-la-perle.png" alt="Lingerie premium La Perle d'Orient" />
      <div className="hero-shadow" />
      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <span className="eyebrow">Boutique premium en Algerie</span>
        <h1>La lingerie comme un bijou discret.</h1>
        <p>
          La Perle d'Orient habille les moments intimes avec dentelle fine, satin doux,
          teintes ecru et service simple avec paiement a la livraison.
        </p>
        <div className="hero-actions">
          <a className="button primary" href="#collections">
            Voir les collections <ArrowRight />
          </a>
          <a className="button ghost" href="#commande">
            Commander maintenant
          </a>
        </div>
      </motion.div>
      <div className="hero-card glass-panel">
        <strong>Livraison 58 wilayas</strong>
        <span>Domicile ou bureau, paiement a la reception.</span>
      </div>
    </section>
  );
}

function TrustBar() {
  const items = [
    { icon: Truck, title: "Livraison rapide", text: "Tarif calcule par wilaya" },
    { icon: ShieldCheck, title: "Paiement a la livraison", text: "Validation simple et rassurante" },
    { icon: Sparkles, title: "Selection premium", text: "Dentelle, satin et finitions soignees" },
  ];

  return (
    <section className="trust-bar shell">
      {items.map((item) => (
        <div key={item.title} className="trust-item glass-panel">
          <item.icon />
          <span>
            <strong>{item.title}</strong>
            <small>{item.text}</small>
          </span>
        </div>
      ))}
    </section>
  );
}

function Collections({ onAdd }: { onAdd: (product: Product, size?: string) => void }) {
  return (
    <section id="collections" className="section shell">
      <div className="section-title">
        <span className="eyebrow">Catalogue</span>
        <h2>Collections signature</h2>
        <p>Un univers chic inspire des grandes maisons, avec une direction plus orientale, douce et ecru.</p>
      </div>
      <div className="product-grid">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} onAdd={onAdd} />
        ))}
      </div>
    </section>
  );
}

function ProductCard({
  product,
  index,
  onAdd,
}: {
  product: Product;
  index: number;
  onAdd: (product: Product, size?: string) => void;
}) {
  const [size, setSize] = useState(product.sizes[0]);

  return (
    <motion.article
      className="product-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.2) }}
    >
      <div className="product-image">
        <img src={product.image} alt={product.name} />
        <span>{product.badge}</span>
        <button aria-label="Ajouter aux favoris">
          <Heart />
        </button>
      </div>
      <div className="product-copy">
        <div className="product-meta">
          <span>{product.category}</span>
          <span>{product.tone}</span>
        </div>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="size-row">
          {product.sizes.map((entry) => (
            <button key={entry} className={entry === size ? "active" : ""} onClick={() => setSize(entry)}>
              {entry}
            </button>
          ))}
        </div>
        <div className="product-bottom">
          <div>
            <strong>{money(product.price)}</strong>
            {product.compareAt ? <del>{money(product.compareAt)}</del> : null}
          </div>
          <button className="add-button" onClick={() => onAdd(product, size)}>
            <Plus /> Ajouter
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function Experience() {
  return (
    <section id="experience" className="section experience">
      <div className="shell experience-grid">
        <div className="glass-panel mood-card">
          <span className="eyebrow">UI / UX boutique</span>
          <h2>Une experience douce, premium et rapide.</h2>
          <p>
            Les blocs en verre gardent le site leger, tandis que les touches ecru donnent le cote naturel,
            chaud et luxueux demande pour les descriptions et les boutons.
          </p>
        </div>
        <div className="ritual-list">
          <div><span>01</span><strong>Choisir la taille</strong><small>S, M, L, XL selon article.</small></div>
          <div><span>02</span><strong>Ajouter au panier</strong><small>Le panier reste sauvegarde sur le navigateur.</small></div>
          <div><span>03</span><strong>Commander</strong><small>Nom, telephone, wilaya, adresse et livraison.</small></div>
        </div>
      </div>
    </section>
  );
}

function Checkout({
  cart,
  form,
  setForm,
  subtotal,
  shipping,
  total,
  freeShipping,
  error,
  onSubmit,
}: {
  cart: CartItem[];
  form: OrderForm;
  setForm: (form: OrderForm) => void;
  subtotal: number;
  shipping: number;
  total: number;
  freeShipping: boolean;
  error: string;
  onSubmit: (event: FormEvent) => void;
}) {
  const summary = useMemo(
    () => cart.map((item) => `${item.quantity}x ${item.product.name} (${item.size})`).join(", "),
    [cart],
  );

  return (
    <section id="commande" className="section shell checkout-section">
      <div className="section-title">
        <span className="eyebrow">Paiement a la livraison</span>
        <h2>Formulaire de commande</h2>
        <p>Structure inspiree du formulaire Atlas Miel: donnees client, wilaya, adresse, quantite, livraison et total.</p>
      </div>
      <div className="checkout-grid">
        <form className="checkout-form glass-panel" onSubmit={onSubmit}>
          <label>
            Nom et prenom
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ex: Lina Benali" />
          </label>
          <label>
            Telephone
            <input
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value.replace(/\D/g, "").slice(0, 10) })}
              inputMode="numeric"
              placeholder="0550000000"
            />
          </label>
          <label>
            Wilaya
            <select value={form.wilaya} onChange={(event) => setForm({ ...form, wilaya: event.target.value })}>
              <option value="">Choisir la wilaya</option>
              {wilayas.map((wilaya, index) => (
                <option key={wilaya} value={wilaya}>
                  {String(index + 1).padStart(2, "0")} - {wilaya}
                </option>
              ))}
            </select>
          </label>
          <label>
            Adresse precise
            <input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="Commune, quartier, rue..." />
          </label>
          <div className="delivery-box">
            <span>Mode de livraison</span>
            <label>
              <input
                type="radio"
                checked={form.deliveryMethod === "domicile"}
                onChange={() => setForm({ ...form, deliveryMethod: "domicile" })}
              />
              Domicile
            </label>
            <label>
              <input
                type="radio"
                checked={form.deliveryMethod === "bureau"}
                onChange={() => setForm({ ...form, deliveryMethod: "bureau" })}
              />
              Bureau
            </label>
          </div>
          <label className="wide">
            Note optionnelle
            <textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Couleur preferee, disponibilite, details de livraison..." />
          </label>
          {error ? <div className="form-error">{error}</div> : null}
          <button className="button primary full">
            Confirmer la commande <ArrowRight />
          </button>
        </form>
        <aside className="order-summary">
          <div className="glass-panel summary-card">
            <span className="eyebrow">Votre panier</span>
            <h3>{cart.length ? summary : "Aucun article selectionne"}</h3>
            <div className="summary-lines">
              <p><span>Sous-total</span><strong>{money(subtotal)}</strong></p>
              <p><span>Livraison</span><strong>{form.wilaya ? (freeShipping ? "Offerte" : money(shipping)) : "A calculer"}</strong></p>
              <p><span>Paiement</span><strong>A la livraison</strong></p>
            </div>
            <div className="total-line">
              <span>Total</span>
              <strong>{money(total)}</strong>
            </div>
            <small>
              Livraison offerte a partir de {money(freeShippingThreshold)}. Les commandes sont enregistrees localement pour cette version statique.
            </small>
          </div>
        </aside>
      </div>
    </section>
  );
}

function CartDrawer({
  open,
  cart,
  subtotal,
  onClose,
  onQuantity,
  onRemove,
}: {
  open: boolean;
  cart: CartItem[];
  subtotal: number;
  onClose: () => void;
  onQuantity: (productId: string, size: string, quantity: number) => void;
  onRemove: (productId: string, size: string) => void;
}) {
  return (
    <>
      <button className={open ? "drawer-backdrop visible" : "drawer-backdrop"} onClick={onClose} aria-label="Fermer le panier" />
      <aside className={open ? "cart-drawer visible" : "cart-drawer"}>
        <div className="drawer-head">
          <div>
            <span className="eyebrow">Selection</span>
            <h2>Panier</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Fermer">
            <X />
          </button>
        </div>
        <div className="cart-lines">
          {cart.length ? (
            cart.map((item) => (
              <article className="cart-line" key={`${item.product.id}-${item.size}`}>
                <img src={item.product.image} alt={item.product.name} />
                <div>
                  <strong>{item.product.name}</strong>
                  <small>Taille {item.size}</small>
                  <span>{money(item.product.price)}</span>
                  <div className="quantity">
                    <button onClick={() => onQuantity(item.product.id, item.size, item.quantity - 1)} aria-label="Diminuer"><Minus /></button>
                    <b>{item.quantity}</b>
                    <button onClick={() => onQuantity(item.product.id, item.size, item.quantity + 1)} aria-label="Augmenter"><Plus /></button>
                  </div>
                </div>
                <button className="remove" onClick={() => onRemove(item.product.id, item.size)} aria-label="Supprimer">
                  <Trash2 />
                </button>
              </article>
            ))
          ) : (
            <div className="empty-cart">
              <ShoppingBag />
              <h3>Panier vide</h3>
              <p>Ajoutez une piece signature pour commencer.</p>
            </div>
          )}
        </div>
        <div className="drawer-total">
          <p><span>Sous-total</span><strong>{money(subtotal)}</strong></p>
          <a className="button primary full" href="#commande" onClick={onClose}>
            Commander <ArrowRight />
          </a>
        </div>
      </aside>
    </>
  );
}

function OrderSuccess({ orderNumber, onClose }: { orderNumber: string; onClose: () => void }) {
  if (!orderNumber) return null;

  return (
    <div className="success-backdrop">
      <div className="success-modal glass-panel">
        <div><Check /></div>
        <span className="eyebrow">Commande recue</span>
        <h2>{orderNumber}</h2>
        <p>Votre commande est sauvegardee. La boutique pourra confirmer par telephone avant livraison.</p>
        <button className="button primary full" onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-grid">
        <div>
          <strong>La Perle d'Orient</strong>
          <p>Lingerie premium en Algerie. Direction artistique ecru, verre, satin et rose-gold.</p>
        </div>
        <a href="tel:0550000000"><Phone /> 0550 00 00 00</a>
        <a href="#commande"><ShoppingBag /> Paiement a la livraison</a>
      </div>
    </footer>
  );
}

export default App;
