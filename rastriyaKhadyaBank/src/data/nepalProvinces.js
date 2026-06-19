/** Province names, districts, and municipalities for address book (province → `state`, district → `district`, city → `city`). */

export const NEPAL_PROVINCES = [
  "Koshi Province",
  "Madhesh Province",
  "Bagmati Province",
  "Gandaki Province",
  "Lumbini Province",
  "Karnali Province",
  "Sudurpashchim Province",
];

export const NEPAL_DISTRICTS_BY_PROVINCE = {
  "Koshi Province": [
    "Bhojpur", "Dhankuta", "Ilam", "Jhapa", "Khotang", "Morang",
    "Okhaldhunga", "Panchthar", "Sankhuwasabha", "Solukhumbu",
    "Sunsari", "Taplejung", "Terhathum", "Udayapur",
  ],
  "Madhesh Province": [
    "Saptari", "Siraha", "Dhanusha", "Mahottari", "Sarlahi",
    "Rautahat", "Bara", "Parsa",
  ],
  "Bagmati Province": [
    "Kathmandu", "Lalitpur", "Bhaktapur", "Kavrepalanchok", "Sindhupalchok",
    "Rasuwa", "Nuwakot", "Dhading", "Makwanpur", "Chitwan",
    "Ramechhap", "Dolakha", "Sindhuli",
  ],
  "Gandaki Province": [
    "Kaski", "Lamjung", "Gorkha", "Tanahun", "Syangja",
    "Parbat", "Baglung", "Myagdi", "Mustang", "Manang", "Nawalpur",
  ],
  "Lumbini Province": [
    "Kapilvastu", "Rupandehi", "Nawalparasi West", "Palpa", "Gulmi",
    "Arghakhanchi", "Dang", "Banke", "Bardiya", "Pyuthan", "Rolpa", "Rukum East",
  ],
  "Karnali Province": [
    "Surkhet", "Dailekh", "Jajarkot", "Salyan", "Dolpa",
    "Humla", "Jumla", "Kalikot", "Mugu", "Western Rukum",
  ],
  "Sudurpashchim Province": [
    "Kailali", "Kanchanpur", "Dadeldhura", "Baitadi", "Darchula",
    "Bajhang", "Bajura", "Achham", "Doti",
  ],
};

export const NEPAL_CITIES_BY_PROVINCE = {
  "Koshi Province": [
    "Biratnagar Metropolitan City",
    "Dharan Sub-Metropolitan City",
    "Itahari Sub-Metropolitan City",
    "Dhankuta",
    "Phidim",
  ],
  "Madhesh Province": [
    "Janakpur Sub-Metropolitan City",
    "Birgunj Metropolitan City",
    "Rajbiraj",
    "Kalaiya Sub-Metropolitan City",
    "Lahan",
  ],
  "Bagmati Province": [
    "Kathmandu Metro",
    "Lalitpur Metro",
    "Bhaktapur Municipality",
    "Kirtipur",
    "Madhyapur Thimi",
  ],
  "Gandaki Province": ["Pokhara Metro", "Baglung", "Gorkha"],
  "Lumbini Province": ["Butwal", "Nepalgunj", "Tulsipur"],
  "Karnali Province": [
    "Birendranagar (Surkhet)",
    "Jumla",
    "Dailekh",
    "Humla",
  ],
  "Sudurpashchim Province": [
    "Dhangadhi Sub-Metropolitan City",
    "Bhimdatta (Mahendranagar)",
    "Tikapur",
    "Mahendranagar",
  ],
};
