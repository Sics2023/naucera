/**
 * Storytelling content for the product pages (taglines are printed on the packs; segment facts are from
 * naucera.in/lp and the brand catalogue). Draft marketing copy – review with the client.
 * Products created later in the admin fall back to their category's profile.
 */

export type Segment = "Kadak" | "Select" | "Coolers" | "Divine Taste" | "Single Serve";

export type Profile = {
  segment: Segment;
  tagline: string;
  notes: string[]; // taste notes
  serve: "Hot" | "Chilled";
  moment: { title: string; text: string; image: string };
  ways: { title: string; text: string }[]; // "Make it your way" ideas
};

export const SEGMENTS: Record<Segment, { title: string; text: string; image: string; tint: string }> = {
  Kadak: { title: "The Naucera Kadak Segment", text: "Bold, authentic taste with up to 50% less sugar.", image: "/products/kadak-tea.webp", tint: "#f4eedc" },
  Select: { title: "The Naucera Select Segment", text: "Premium blends crafted with up to 70% less sugar.", image: "/products/select-tea.webp", tint: "#e3ece4" },
  Coolers: { title: "The Naucera Coolers Segment", text: "Iced, Bold & Beautiful!", image: "/products/jalwa-lemonade.webp", tint: "#e6f2ee" },
  "Divine Taste": { title: "Divine Taste vending premixes", text: "Classic 1 kg premixes made for vending machines, canteens and cafeterias.", image: "/products/cardamom-tea-gold.webp", tint: "#eef3e6" },
  "Single Serve": { title: "Single-serve sachets", text: "One sachet, one perfect cup – ready in just 30 seconds, wherever you are.", image: "/products/special-coffee.webp", tint: "#f1e9e2" },
};

const MORNING = { title: "Your first cup of the day", text: "Steaming, comforting and ready before the kettle has cooled – the easiest good start to a busy morning.", image: "/story/pouring-tea.webp" };
const OFFICE = { title: "Every break, every shift", text: "The same great cup from the first serve to the five-hundredth – in office pantries, hospital lounges and factory canteens.", image: "/story/office-vending.webp" };
const CAFE = { title: "Café taste, without the café", text: "A rich, aromatic cup at home, at work or at your counter – no brewing, no barista, no wait.", image: "/story/cafe-setting.webp" };
const SUMMER = { title: "Made for hot afternoons", text: "Mix, add ice, and turn the hottest part of the day into the coolest – at home, at the shop counter or on a cooler trolley.", image: "/story/banner-range-2.webp" };

const HOT_WAYS = [
  { title: "Kadak & strong", text: "Use a little less water for a stronger, bolder cup." },
  { title: "Spiced chai", text: "Add a pinch of crushed ginger or elaichi while it’s hot." },
  { title: "For a crowd", text: "Load the 1 kg pack into a vending machine and serve cup after cup with the same taste." },
];
const COFFEE_WAYS = [
  { title: "Extra creamy", text: "Top up with a splash of hot milk for a café-style cup." },
  { title: "Frothy & light", text: "Whisk the premix with a little hot water first, then top up and stir." },
  { title: "For a crowd", text: "Load the 1 kg pack into a vending machine and serve cup after cup with the same taste." },
];
const COLD_WAYS = [
  { title: "Over ice", text: "Fill the glass with ice first, pour over and stir for an instantly chilled drink." },
  { title: "With a fizz", text: "Mix with chilled soda instead of water for a sparkling cooler." },
  { title: "Party jug", text: "Mix a jug in advance, chill it, and serve to the whole family." },
];

export const PROFILES: Record<string, Profile> = {
  "select-tea": { segment: "Select", tagline: "That aahh! feeling in every sip!", notes: ["Smooth", "Well-balanced", "Milky"], serve: "Hot", moment: MORNING, ways: HOT_WAYS },
  "kadak-tea": { segment: "Kadak", tagline: "Awaken Your Senses with a Kadak Punch!", notes: ["Bold", "Strong Assam tea", "Full-bodied"], serve: "Hot", moment: MORNING, ways: HOT_WAYS },
  "cardamom-tea-gold": { segment: "Divine Taste", tagline: "Instant tea premix with cardamom flavour.", notes: ["Fragrant elaichi", "Warm", "Comforting"], serve: "Hot", moment: OFFICE, ways: HOT_WAYS },
  "lemon-tea": { segment: "Divine Taste", tagline: "Instant tea premix with lemon flavour.", notes: ["Zesty lemon", "Light", "Refreshing"], serve: "Hot", moment: OFFICE, ways: [{ title: "Honey lemon", text: "Stir in a spoon of honey for a soothing cup." }, ...HOT_WAYS.slice(2)] },
  "laung-elaichi-tea": { segment: "Single Serve", tagline: "Refreshing Taste – ready in just 30 secs.", notes: ["Laung (clove)", "Elaichi", "Warming spice"], serve: "Hot", moment: MORNING, ways: HOT_WAYS.slice(0, 2) },
  "select-coffee": { segment: "Select", tagline: "Brewed for the bold!", notes: ["Smooth", "Creamy", "Rounded"], serve: "Hot", moment: CAFE, ways: COFFEE_WAYS },
  "kadak-coffee": { segment: "Kadak", tagline: "Strength in every sip, soul in every cup!", notes: ["Bold", "Aromatic", "South Indian coffee"], serve: "Hot", moment: CAFE, ways: COFFEE_WAYS },
  "coffee-gold": { segment: "Divine Taste", tagline: "Instant coffee premix.", notes: ["Rich", "Premium", "Indulgent"], serve: "Hot", moment: OFFICE, ways: COFFEE_WAYS },
  "special-coffee": { segment: "Single Serve", tagline: "Special Coffeemix – Refreshing Taste.", notes: ["Creamy", "Smooth", "Ready in 30 secs"], serve: "Hot", moment: CAFE, ways: COFFEE_WAYS.slice(0, 2) },
  "moh-maya": { segment: "Coolers", tagline: "Icy Green, Cool Scene.", notes: ["Minty", "Citrusy", "Ice-cold"], serve: "Chilled", moment: SUMMER, ways: COLD_WAYS },
  "jalwa-lemonade": { segment: "Coolers", tagline: "Lemon Chill, Jalwa Thrill.", notes: ["Tangy", "Citrus burst", "Refreshing"], serve: "Chilled", moment: SUMMER, ways: COLD_WAYS },
  "cold-coffee": { segment: "Coolers", tagline: "Cold Brew, Bold You.", notes: ["Creamy", "Bold coffee", "Café-style"], serve: "Chilled", moment: SUMMER, ways: [{ title: "Dessert style", text: "Add a scoop of vanilla ice cream on top." }, ...COLD_WAYS.slice(0, 2)] },
  "lemon-iced-tea": { segment: "Coolers", tagline: "Ice Cold, Lemon Bold.", notes: ["Brisk tea", "Lemony", "Ice-cold"], serve: "Chilled", moment: SUMMER, ways: COLD_WAYS },
  "aam-panna": { segment: "Coolers", tagline: "Kacha Mango, Pakka Refreshment.", notes: ["Raw mango", "Tangy", "Classic summer"], serve: "Chilled", moment: SUMMER, ways: [{ title: "Masala panna", text: "Add a pinch of roasted jeera and black salt." }, ...COLD_WAYS.slice(0, 2)] },
};

export function profileFor(slug: string, categorySlug: string | null): Profile {
  if (PROFILES[slug]) return PROFILES[slug];
  if (categorySlug?.includes("cooler")) return { ...PROFILES["jalwa-lemonade"], tagline: "Instantly refreshing.", notes: ["Refreshing"] };
  if (categorySlug?.includes("coffee")) return { ...PROFILES["select-coffee"], tagline: "Instantly refreshing.", notes: ["Aromatic"] };
  return { ...PROFILES["select-tea"], tagline: "Instantly refreshing.", notes: ["Comforting"] };
}
