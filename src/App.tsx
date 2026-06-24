import { motion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Heart,
  Home,
  Images,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Minus,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Trash2,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
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

const publicBase = import.meta.env.BASE_URL === "./" ? "" : import.meta.env.BASE_URL.replace(/\/$/, "");
const money = (value: number) => `${value.toLocaleString("fr-DZ")} DA`;
const imageUrl = (name: string) => `${publicBase}/images/${name}`;

const initialForm: OrderForm = {
  name: "",
  phone: "",
  wilaya: "",
  address: "",
  deliveryMethod: "domicile",
  note: "",
};

function currentRoute() {
  const raw = window.location.pathname;
  const stripped = publicBase && raw.startsWith(publicBase) ? raw.slice(publicBase.length) || "/" : raw;
  return stripped.endsWith("/") && stripped.length > 1 ? stripped.slice(0, -1) : stripped;
}

function hrefFor(path: string) {
  return `${publicBase}${path}` || "/";
}

function App() {
  const [route, setRoute] = useState(currentRoute);
  const [menuOpen, setMenuOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(true);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("perle-cart") || "[]") as CartItem[];
    } catch {
      return [];
    }
  });
  const [form, setForm] = useState<OrderForm>(initialForm);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    const onPop = () => setRoute(currentRoute());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setIntroOpen(false), 2400);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("perle-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [route]);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const freeShipping = subtotal >= freeShippingThreshold;
  const shipping = form.wilaya ? (freeShipping ? 0 : shippingRates[form.wilaya]?.[form.deliveryMethod] ?? 0) : 0;
  const total = subtotal + shipping;

  const navigate = (path: string) => {
    window.history.pushState(null, "", hrefFor(path));
    setRoute(path);
  };

  const addToCart = (product: Product, size = product.sizes[0], quantity = 1) => {
    setCart((current) => {
      const found = current.find((item) => item.product.id === product.id && item.size === size);
      if (found) {
        return current.map((item) =>
          item.product.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...current, { product, size, quantity }];
    });
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
    setCheckoutError("");

    if (!cart.length) {
      setCheckoutError("Votre panier est vide. Ajoutez un article avant de valider.");
      return;
    }

    if (!form.name.trim() || !/^\d{10}$/.test(form.phone.trim()) || !form.wilaya || !form.address.trim()) {
      setCheckoutError("Veuillez remplir le nom, un telephone a 10 chiffres, la wilaya et l'adresse precise.");
      return;
    }

    const order = {
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
    localStorage.setItem("perle-orders", JSON.stringify([order, ...orders]));
    localStorage.setItem("perle-last-order", JSON.stringify(order));
    setCart([]);
    setForm(initialForm);
    navigate("/merci");
  };

  const page = renderPage(route, {
    cart,
    count,
    form,
    subtotal,
    shipping,
    total,
    freeShipping,
    checkoutError,
    navigate,
    addToCart,
    updateQuantity,
    setForm,
    submitOrder,
  });

  return (
    <div>
      {introOpen ? <IntroGate /> : null}
      <Header route={route} count={count} menuOpen={menuOpen} setMenuOpen={setMenuOpen} navigate={navigate} />
      {page}
      <Footer navigate={navigate} />
    </div>
  );
}

function IntroGate() {
  return (
    <div className="intro-gate" aria-label="Ouverture La Perle d'Orient">
      <div className="glass-door glass-door-left" />
      <div className="glass-door glass-door-right" />
      <div className="intro-gate-brand">
        <img src={imageUrl("logo-la-perle.png")} alt="La Perle d'Orient" />
        <span>La Perle d'Orient</span>
        <small>Ouverture de la boutique</small>
      </div>
    </div>
  );
}

type PageContext = {
  cart: CartItem[];
  count: number;
  form: OrderForm;
  subtotal: number;
  shipping: number;
  total: number;
  freeShipping: boolean;
  checkoutError: string;
  navigate: (path: string) => void;
  addToCart: (product: Product, size?: string, quantity?: number) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  setForm: (form: OrderForm) => void;
  submitOrder: (event: FormEvent) => void;
};

function renderPage(route: string, context: PageContext) {
  if (route === "/boutique") return <ShopPage {...context} />;
  if (route === "/panier") return <CartPage {...context} />;
  if (route === "/checkout") return <CheckoutPage {...context} />;
  if (route === "/a-propos") return <AboutPage navigate={context.navigate} />;
  if (route === "/contact") return <ContactPage />;
  if (route === "/merci") return <ThanksPage navigate={context.navigate} />;
  if (route.startsWith("/produit/")) {
    const id = decodeURIComponent(route.replace("/produit/", ""));
    const product = products.find((item) => item.id === id);
    return product ? <ProductPage product={product} {...context} /> : <NotFound navigate={context.navigate} />;
  }
  if (route === "/") return <HomePage navigate={context.navigate} addToCart={context.addToCart} />;
  return <NotFound navigate={context.navigate} />;
}

function LinkButton({
  to,
  navigate,
  className,
  children,
}: {
  to: string;
  navigate: (path: string) => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      className={className}
      href={hrefFor(to)}
      onClick={(event) => {
        event.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}

function Header({
  route,
  count,
  menuOpen,
  setMenuOpen,
  navigate,
}: {
  route: string;
  count: number;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  navigate: (path: string) => void;
}) {
  const links = [
    { label: "Accueil", to: "/", icon: Home },
    { label: "Boutique", to: "/boutique", icon: ShoppingBag },
    { label: "A propos", to: "/a-propos", icon: UserRound },
    { label: "Contact", to: "/contact", icon: Phone },
  ];

  return (
    <header className="site-header">
      <div className="nav-shell">
        <LinkButton to="/" navigate={navigate} className="brand">
          <img src={imageUrl("logo-la-perle.png")} alt="La Perle d'Orient" />
          <strong>La Perle d'Orient</strong>
        </LinkButton>
        <button className="icon-button menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          {menuOpen ? <X /> : <Menu />}
        </button>
        <nav className={menuOpen ? "main-nav open" : "main-nav"}>
          {links.map((link) => (
            <LinkButton key={link.to} to={link.to} navigate={navigate} className={route === link.to ? "active" : ""}>
              <link.icon />
              {link.label}
            </LinkButton>
          ))}
        </nav>
        <LinkButton to="/panier" navigate={navigate} className="cart-pill">
          <ShoppingBag />
          <span>{count}</span>
        </LinkButton>
      </div>
    </header>
  );
}

function HomePage({ navigate, addToCart }: { navigate: (path: string) => void; addToCart: PageContext["addToCart"] }) {
  const featured = products.slice(0, 3);

  return (
    <main>
      <section className="hero">
        <img src={imageUrl("hero-la-perle.png")} alt="La Perle d'Orient lingerie premium" />
        <div className="hero-shadow" />
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="eyebrow">Lingerie premium en Algerie</span>
          <h1>La lingerie comme une piece de joaillerie.</h1>
          <p>
            Dentelle fine, satin doux, tons ecru et bordeaux profond. Une boutique elegante,
            complete, avec paiement a la livraison.
          </p>
          <div className="hero-actions">
            <LinkButton to="/boutique" navigate={navigate} className="button primary">
              Explorer la boutique <ArrowRight />
            </LinkButton>
            <LinkButton to="/a-propos" navigate={navigate} className="button ghost">
              L'univers de la marque
            </LinkButton>
          </div>
        </motion.div>
      </section>

      <TrustBar />

      <section className="section shell split-feature">
        <div className="section-title">
          <span className="eyebrow">Maison La Perle</span>
          <h2>Une boutique pensee comme un salon prive.</h2>
        </div>
        <div className="feature-copy">
          <p>
            Une selection intime et soignee, pensee pour les femmes qui cherchent une lingerie elegante,
            confortable et facile a commander depuis l'Algerie.
          </p>
          <div className="creuse-card">
            <strong>Conseil taille discret</strong>
            <span>Assistance par telephone ou message avant confirmation, avec livraison a domicile ou en bureau.</span>
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="title-row">
          <div className="section-title">
            <span className="eyebrow">Selection</span>
            <h2>Pieces signatures</h2>
          </div>
          <LinkButton to="/boutique" navigate={navigate} className="text-link">
            Voir toute la boutique <ArrowRight />
          </LinkButton>
        </div>
        <div className="product-grid">
          {featured.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} navigate={navigate} addToCart={addToCart} />
          ))}
        </div>
      </section>

      <section className="section atelier-band">
        <div className="shell atelier-grid">
          <div>
            <span className="eyebrow">Details couture</span>
            <h2>Dentelle, satin, ecru, bordeaux. Rien de gratuit, tout doit servir la marque.</h2>
          </div>
          <div className="atelier-cards">
            <article>
              <i><BadgeCheck /></i>
              <strong>01</strong>
              <span>Finitions soignees</span>
              <p>Dentelle visible, satin doux et details presentes clairement avant l'achat.</p>
            </article>
            <article>
              <i><ShoppingCart /></i>
              <strong>02</strong>
              <span>Commande rassurante</span>
              <p>Panier detaille, validation simple et paiement uniquement a la reception.</p>
            </article>
            <article>
              <i><Images /></i>
              <strong>03</strong>
              <span>Presentation premium</span>
              <p>Photos nettes, packaging elegant et suivi client avant expedition.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section shell editorial-grid">
        <div className="editorial-card large">
          <span className="eyebrow">Nouvelle capsule</span>
          <h2>Nuit de Rose</h2>
          <p>Une ligne bordeaux profonde, pensee pour donner une presence de grande marque.</p>
          <LinkButton to="/produit/nuit-de-rose" navigate={navigate} className="button creuse">
            Voir la fiche produit
          </LinkButton>
        </div>
        <div className="editorial-card">
          <Sparkles />
          <h3>Packaging cadeau</h3>
          <p>Presentation propre, messages discrets, experience boutique jusqu'a la livraison.</p>
        </div>
          <div className="editorial-card">
            <ShieldCheck />
            <h3>Paiement a reception</h3>
            <p>Votre commande est confirmee par telephone avant expedition partout en Algerie.</p>
          </div>
      </section>
    </main>
  );
}

function TrustBar() {
  const items = [
    { icon: Truck, title: "Livraison 58 wilayas", text: "Domicile ou bureau" },
    { icon: ShieldCheck, title: "Paiement a la livraison", text: "Pas de paiement en ligne impose" },
    { icon: Sparkles, title: "Selection premium", text: "Dentelle, satin, ecru et bordeaux" },
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

function ShopPage({ navigate, addToCart }: PageContext) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Toutes");
  const categories = ["Toutes", ...Array.from(new Set(products.map((product) => product.category)))];
  const filtered = products.filter((product) => {
    const text = `${product.name} ${product.category} ${product.tone}`.toLowerCase();
    return (category === "Toutes" || product.category === category) && text.includes(query.toLowerCase());
  });

  return (
    <main className="page-shell shell">
      <PageIntro eyebrow="Boutique" title="Toutes les pieces La Perle d'Orient" text="Explorez les modeles, choisissez votre taille, puis validez votre panier en quelques etapes." />
      <div className="shop-toolbar">
        <div className="search-box">
          <Search />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une piece..." />
        </div>
        <div className="filter-row">
          {categories.map((item) => (
            <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="product-grid shop-grid">
        {filtered.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} navigate={navigate} addToCart={addToCart} />
        ))}
      </div>
    </main>
  );
}

function ProductCard({
  product,
  index,
  navigate,
  addToCart,
}: {
  product: Product;
  index: number;
  navigate: (path: string) => void;
  addToCart: PageContext["addToCart"];
}) {
  const [size, setSize] = useState(product.sizes[0]);

  return (
    <motion.article
      className="product-card"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.18) }}
    >
      <LinkButton to={`/produit/${product.id}`} navigate={navigate} className="product-image">
        <img src={imageUrl(product.image)} alt={product.name} />
        <span>{product.badge}</span>
        <i><Heart /></i>
      </LinkButton>
      <div className="product-copy">
        <div className="product-meta">
          <span>{product.category}</span>
          <span><Star fill="currentColor" /> 4.9</span>
        </div>
        <LinkButton to={`/produit/${product.id}`} navigate={navigate} className="product-title-link">
          <h3>{product.name}</h3>
        </LinkButton>
        <p>{product.description}</p>
        <div className="size-row">
          {product.sizes.map((entry) => (
            <button key={entry} className={size === entry ? "active" : ""} onClick={() => setSize(entry)}>
              {entry}
            </button>
          ))}
        </div>
        <div className="product-bottom">
          <div>
            <strong>{money(product.price)}</strong>
            {product.compareAt ? <del>{money(product.compareAt)}</del> : null}
          </div>
          <button className="add-button creuse-small" onClick={() => addToCart(product, size)}>
            <Plus /> Ajouter
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function ProductPage({ product, navigate, addToCart }: PageContext & { product: Product }) {
  const [size, setSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);

  return (
    <main className="page-shell shell">
      <div className="product-detail">
        <section className="detail-gallery">
          <img src={imageUrl(product.image)} alt={product.name} />
          <div className="detail-note glass-panel">
            <span>{product.badge}</span>
            <strong>{product.tone}</strong>
          </div>
        </section>
        <section className="detail-copy">
          <LinkButton to="/boutique" navigate={navigate} className="back-link">Retour boutique</LinkButton>
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <p>{product.longDescription}</p>
          <div className="detail-price">
            <strong>{money(product.price)}</strong>
            {product.compareAt ? <del>{money(product.compareAt)}</del> : null}
          </div>
          <div className="detail-options">
            <span>Taille</span>
            <div className="size-row">
              {product.sizes.map((entry) => (
                <button key={entry} className={size === entry ? "active" : ""} onClick={() => setSize(entry)}>
                  {entry}
                </button>
              ))}
            </div>
          </div>
          <div className="quantity-card">
            <span>Quantite</span>
            <div className="quantity">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus /></button>
              <b>{quantity}</b>
              <button onClick={() => setQuantity(quantity + 1)}><Plus /></button>
            </div>
          </div>
          <div className="detail-actions">
            <button
              className="button primary"
              onClick={() => {
                addToCart(product, size, quantity);
                navigate("/panier");
              }}
            >
              Ajouter au panier <ShoppingBag />
            </button>
            <button className="button creuse" onClick={() => addToCart(product, size, quantity)}>
              Ajouter et continuer
            </button>
          </div>
          <div className="detail-list">
            {product.details.map((detail) => (
              <p key={detail}><Check /> {detail}</p>
            ))}
            <p><Sparkles /> Conseil entretien: {product.care}</p>
          </div>
        </section>
      </div>
      <section className="section related-section">
        <div className="title-row">
          <div className="section-title compact">
            <span className="eyebrow">A decouvrir aussi</span>
            <h2>Pieces proches</h2>
          </div>
        </div>
        <div className="product-grid">
          {products.filter((item) => item.id !== product.id).slice(0, 3).map((item, index) => (
            <ProductCard key={item.id} product={item} index={index} navigate={navigate} addToCart={addToCart} />
          ))}
        </div>
      </section>
    </main>
  );
}

function CartPage({ cart, subtotal, updateQuantity, navigate }: PageContext) {
  return (
    <main className="page-shell shell">
      <PageIntro eyebrow="Panier" title="Votre selection" text="Une vraie page panier, avec quantites, tailles, suppression et passage au checkout." />
      <div className="cart-page-grid">
        <section className="cart-page-list">
          {cart.length ? (
            cart.map((item) => (
              <article className="cart-page-line" key={`${item.product.id}-${item.size}`}>
                <img src={imageUrl(item.product.image)} alt={item.product.name} />
                <div>
                  <strong>{item.product.name}</strong>
                  <span>{item.product.category} / Taille {item.size}</span>
                  <small>{money(item.product.price)}</small>
                </div>
                <div className="quantity">
                  <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}><Minus /></button>
                  <b>{item.quantity}</b>
                  <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}><Plus /></button>
                </div>
                <button className="remove" onClick={() => updateQuantity(item.product.id, item.size, 0)} aria-label="Supprimer">
                  <Trash2 />
                </button>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <ShoppingBag />
              <h2>Votre panier est vide</h2>
              <p>Retournez a la boutique et choisissez une piece.</p>
              <button className="button primary" onClick={() => navigate("/boutique")}>Voir la boutique</button>
            </div>
          )}
        </section>
        <aside className="summary-card glass-panel">
          <span className="eyebrow">Resume</span>
          <div className="summary-lines">
            <p><span>Articles</span><strong>{cart.reduce((sum, item) => sum + item.quantity, 0)}</strong></p>
            <p><span>Sous-total</span><strong>{money(subtotal)}</strong></p>
            <p><span>Livraison</span><strong>Calculee au checkout</strong></p>
          </div>
          <div className="total-line"><span>Total provisoire</span><strong>{money(subtotal)}</strong></div>
          <button className="button primary full" onClick={() => navigate(cart.length ? "/checkout" : "/boutique")}>
            {cart.length ? "Passer au checkout" : "Remplir le panier"} <ArrowRight />
          </button>
        </aside>
      </div>
    </main>
  );
}

function CheckoutPage({
  cart,
  form,
  setForm,
  subtotal,
  shipping,
  total,
  freeShipping,
  checkoutError,
  submitOrder,
  navigate,
}: PageContext) {
  const summary = useMemo(
    () => cart.map((item) => `${item.quantity}x ${item.product.name} (${item.size})`).join(", "),
    [cart],
  );

  return (
    <main className="page-shell shell">
      <PageIntro eyebrow="Checkout" title="Paiement a la livraison" text="Le formulaire est separe de l'accueil: nom, telephone, wilaya, adresse, livraison et recapitulatif." />
      <div className="checkout-grid">
        <form className="checkout-form glass-panel" onSubmit={submitOrder}>
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
            <label className={form.deliveryMethod === "domicile" ? "delivery-choice active" : "delivery-choice"}>
              <input type="radio" checked={form.deliveryMethod === "domicile"} onChange={() => setForm({ ...form, deliveryMethod: "domicile" })} />
              <Truck />
              <strong>Domicile</strong>
              <em>Selectionne</em>
            </label>
            <label className={form.deliveryMethod === "bureau" ? "delivery-choice active" : "delivery-choice"}>
              <input type="radio" checked={form.deliveryMethod === "bureau"} onChange={() => setForm({ ...form, deliveryMethod: "bureau" })} />
              <MapPin />
              <strong>Bureau</strong>
              <em>Selectionne</em>
            </label>
          </div>
          <label className="wide">
            Note optionnelle
            <textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Couleur preferee, disponibilite, details de livraison..." />
          </label>
          {checkoutError ? <div className="form-error">{checkoutError}</div> : null}
          <button className="button primary full">Confirmer la commande <ArrowRight /></button>
        </form>
        <aside className="summary-card glass-panel">
          <span className="eyebrow">Commande</span>
          <h3>{cart.length ? summary : "Aucun article dans le panier"}</h3>
          <div className="summary-lines">
            <p><span>Sous-total</span><strong>{money(subtotal)}</strong></p>
            <p><span>Livraison</span><strong>{form.wilaya ? (freeShipping ? "Offerte" : money(shipping)) : "A calculer"}</strong></p>
            <p><span>Paiement</span><strong>A la livraison</strong></p>
          </div>
          <div className="total-line"><span>Total</span><strong>{money(total)}</strong></div>
          <button className="button creuse full" onClick={() => navigate("/panier")}>Modifier le panier</button>
        </aside>
      </div>
    </main>
  );
}

function AboutPage({ navigate }: { navigate: (path: string) => void }) {
  return (
    <main className="page-shell shell">
      <PageIntro eyebrow="A propos" title="La Perle d'Orient, une boutique algerienne avec une presence luxe." text="Une identite douce, feminine, premium, inspiree des codes des grandes maisons sans copier une marque." />
      <section className="about-grid">
        <div className="about-panel dark">
          <h2>Notre direction</h2>
          <p>Une boutique algerienne qui mise sur l'elegance, la discretion et le conseil avant chaque commande.</p>
        </div>
        <div className="about-panel">
          <h3>Selection</h3>
          <p>Chaque piece est presentee avec taille, description, entretien et fiche produit dediee.</p>
        </div>
        <div className="about-panel">
          <h3>Service</h3>
          <p>Paiement a la livraison, confirmation par telephone et livraison sur les wilayas d'Algerie.</p>
        </div>
      </section>
      <section className="section brand-values">
        <div className="creuse-card"><strong>Elegance</strong><span>Pieces choisies pour leur ligne et leur finition.</span></div>
        <div className="creuse-card"><strong>Confort</strong><span>Tailles lisibles et conseil avant confirmation.</span></div>
        <div className="creuse-card"><strong>Discretion</strong><span>Commande confirmee avec respect et confidentialite.</span></div>
        <div className="creuse-card"><strong>Livraison</strong><span>Domicile ou bureau selon la wilaya selectionnee.</span></div>
      </section>
      <button className="button primary" onClick={() => navigate("/boutique")}>Decouvrir la boutique <ArrowRight /></button>
    </main>
  );
}

function ContactPage() {
  return (
    <main className="page-shell shell">
      <PageIntro eyebrow="Contact" title="Besoin d'aide pour choisir ?" text="Une page contact claire, rassurante et adaptee a une boutique locale." />
      <section className="contact-grid">
        <a className="contact-card glass-panel" href="tel:0550000000"><Phone /><strong>Telephone</strong><span>0550 00 00 00</span></a>
        <a className="contact-card glass-panel" href="mailto:contact@laperledorient.dz"><Mail /><strong>Email</strong><span>contact@laperledorient.dz</span></a>
        <div className="contact-card glass-panel"><MapPin /><strong>Algerie</strong><span>Livraison disponible sur 58 wilayas</span></div>
      </section>
      <section className="contact-note">
        <h2>Horaires</h2>
        <p>Samedi - Jeudi / 9h - 18h. Confirmation des commandes par telephone avant expedition.</p>
      </section>
    </main>
  );
}

function ThanksPage({ navigate }: { navigate: (path: string) => void }) {
  const order = (() => {
    try {
      return JSON.parse(localStorage.getItem("perle-last-order") || "{}") as { id?: string; total?: number };
    } catch {
      return {};
    }
  })();

  return (
    <main className="page-shell shell thanks-page">
      <div className="success-modal glass-panel inline">
        <div><Check /></div>
        <span className="eyebrow">Commande recue</span>
        <h1>{order.id || "Merci"}</h1>
        <p>La commande a ete enregistree. La boutique confirme par telephone avant livraison.</p>
        {order.total ? <strong>Total: {money(order.total)}</strong> : null}
        <button className="button primary full" onClick={() => navigate("/boutique")}>Retour boutique</button>
      </div>
    </main>
  );
}

function PageIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <section className="page-intro">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{text}</p>
    </section>
  );
}

function NotFound({ navigate }: { navigate: (path: string) => void }) {
  return (
    <main className="page-shell shell thanks-page">
      <div className="empty-state">
        <h1>Page introuvable</h1>
        <p>Retournez vers la boutique.</p>
        <button className="button primary" onClick={() => navigate("/")}>Accueil</button>
      </div>
    </main>
  );
}

function Footer({ navigate }: { navigate: (path: string) => void }) {
  return (
    <footer className="footer-pro">
      <div className="shell footer-top">
        <div className="footer-brand">
          <img src={imageUrl("logo-la-perle.png")} alt="La Perle d'Orient" />
          <strong>La Perle d'Orient</strong>
          <p>Boutique de lingerie premium en Algerie. Dentelle fine, satin doux, paiement a la livraison.</p>
          <div className="social-row">
            <a href="#instagram" aria-label="Instagram"><Instagram /></a>
            <a href="mailto:contact@laperledorient.dz" aria-label="Email"><Mail /></a>
          </div>
        </div>
        <div>
          <h3>Boutique</h3>
          <button onClick={() => navigate("/boutique")}>Toutes les pieces</button>
          <button onClick={() => navigate("/panier")}>Panier</button>
          <button onClick={() => navigate("/checkout")}>Checkout</button>
        </div>
        <div>
          <h3>Maison</h3>
          <button onClick={() => navigate("/a-propos")}>A propos</button>
          <button onClick={() => navigate("/contact")}>Contact</button>
          <a href="tel:0550000000">0550 00 00 00</a>
        </div>
        <div className="footer-newsletter">
          <h3>Note privee</h3>
          <p>Recevoir les nouveautes, capsules et offres de lancement.</p>
          <div><input placeholder="Votre email" /><button className="button creuse">S'inscrire</button></div>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>2026 La Perle d'Orient. Tous droits reserves.</span>
        <span>Livraison en Algerie / Paiement a la reception</span>
      </div>
    </footer>
  );
}

export default App;
