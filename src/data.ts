export type DeliveryMethod = "domicile" | "bureau";

export type Product = {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  compareAt?: number;
  badge: string;
  tone: string;
  description: string;
  longDescription: string;
  sizes: string[];
  details: string[];
  care: string;
};

export const products: Product[] = [
  {
    id: "perle-signature",
    name: "Perle Signature",
    category: "Dentelle",
    image: "collection-perle.png",
    price: 8900,
    compareAt: 10800,
    badge: "Best seller",
    tone: "Champagne",
    description: "Ensemble en dentelle ivoire avec finition delicate, pense pour les silhouettes elegantes.",
    longDescription:
      "Une piece signature pensee comme un bijou de tiroir: dentelle florale, nuance champagne et maintien confortable pour une allure chic sans surcharge.",
    sizes: ["S", "M", "L", "XL"],
    details: ["Dentelle ivoire premium", "Bretelles reglables", "Doublure douce", "Packaging cadeau disponible"],
    care: "Lavage doux a la main, sechage a plat, eviter le chlore.",
  },
  {
    id: "nuit-de-rose",
    name: "Nuit de Rose",
    category: "Soiree",
    image: "collection-rose.png",
    price: 9800,
    badge: "Edition luxe",
    tone: "Bordeaux",
    description: "Ligne bordeaux profonde, texture douce et details satin pour une allure premium.",
    longDescription:
      "Une silhouette plus intense, ideale pour les clientes qui aiment le bordeaux profond, les details satines et une presentation tres maison de luxe.",
    sizes: ["S", "M", "L"],
    details: ["Dentelle bordeaux", "Finition satin", "Coupe elegante", "Edition limitee"],
    care: "Lavage separe a froid, ne pas repasser la dentelle.",
  },
  {
    id: "satin-orient",
    name: "Satin Orient",
    category: "Satin",
    image: "collection-satin.png",
    price: 7600,
    compareAt: 9200,
    badge: "Nouveau",
    tone: "Blush nude",
    description: "Satin fluide, teinte blush et confort quotidien avec une presentation tres boutique.",
    longDescription:
      "Une capsule satin douce et lumineuse, faite pour le confort quotidien tout en gardant une sensation habillee et delicate.",
    sizes: ["M", "L", "XL", "XXL"],
    details: ["Satin fluide", "Toucher peau de peche", "Coupe confortable", "Teinte blush nude"],
    care: "Lavage a froid, retourner la piece avant lavage, sechage naturel.",
  },
  {
    id: "ecrin-douceur",
    name: "Ecrin Douceur",
    category: "Confort",
    image: "collection-perle.png",
    price: 6900,
    badge: "Confort",
    tone: "Ivoire",
    description: "Un essentiel doux et raffine pour les commandes cadeau et les routines de tous les jours.",
    longDescription:
      "Un modele essentiel pour tous les jours, plus doux et rassurant, avec une finition propre qui garde le cote feminin de la marque.",
    sizes: ["S", "M", "L", "XL"],
    details: ["Base ecru douce", "Confort quotidien", "Bon maintien", "Ideal cadeau"],
    care: "Cycle delicat possible dans un filet, sechage a l'air libre.",
  },
];

export const wilayas = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Bejaia", "Biskra", "Bechar", "Blida", "Bouira",
  "Tamanrasset", "Tebessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Setif", "Saida",
  "Skikda", "Sidi Bel Abbes", "Annaba", "Guelma", "Constantine", "Medea", "Mostaganem", "M'Sila", "Mascara",
  "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arreridj", "Boumerdes", "El Tarf", "Tindouf", "Tissemsilt",
  "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Ain Defla", "Naama", "Ain Temouchent", "Ghardaia",
  "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Beni Abbes", "In Salah", "In Guezzam",
  "Touggourt", "Djanet", "El M'Ghair", "El Meniaa",
];

const defaultRate = { domicile: 700, bureau: 350 };

export const shippingRates: Record<string, Record<DeliveryMethod, number>> = Object.fromEntries(
  wilayas.map((wilaya) => {
    if (["Alger"].includes(wilaya)) return [wilaya, { domicile: 350, bureau: 350 }];
    if (["Blida", "Tipaza", "Boumerdes", "Chlef"].includes(wilaya)) return [wilaya, { domicile: 550, bureau: 350 }];
    if (["Adrar", "Tamanrasset", "Illizi", "Tindouf", "Djanet", "Beni Abbes", "In Salah"].includes(wilaya)) {
      return [wilaya, { domicile: 1200, bureau: 750 }];
    }
    if (["Bordj Badji Mokhtar", "In Guezzam"].includes(wilaya)) return [wilaya, { domicile: 1500, bureau: 800 }];
    if (["Ouargla", "El Oued", "Touggourt", "El Meniaa", "El M'Ghair", "Ghardaia", "Biskra"].includes(wilaya)) {
      return [wilaya, { domicile: 800, bureau: 400 }];
    }
    return [wilaya, defaultRate];
  }),
) as Record<string, Record<DeliveryMethod, number>>;

export const freeShippingThreshold = 18000;
