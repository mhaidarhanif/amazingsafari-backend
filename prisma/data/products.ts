import { Product } from "@prisma/client";

export type DataProduct = {
  slug: string;
  name: string;
  imageURL: string;
  price: number;
  description: string;
  sku: string;
};

export const dataProducts: DataProduct[] = [
  {
    slug: "head-panda-cushion",
    name: "Head Panda Cushion",
    imageURL:
      "https://safariwonders.com/wp-content/uploads/2023/06/h11xxx003305-head-panda-cushion-1686803573-480x480.jpg",
    price: 115000,
    description: "Mini panda head cushion bag",
    sku: "H11XXX003305",
  },
  {
    slug: "big-head-cuddly-elephant",
    name: "Big Head Cuddly Elephant",
    imageURL:
      "https://safariwonders.com/wp-content/uploads/2023/06/t01xxx000003-big-head-cuddly-elephant-1686803856-480x480.jpg",
    price: 105000,
    description: "Mini elephant plush toy",
    sku: "T01XXX000003",
  },
  {
    slug: "lying-white-tiger",
    name: "Lying White Tiger",
    imageURL:
      "https://safariwonders.com/wp-content/uploads/2023/06/b27xgi000010-lying-white-tiger-11-1686803201-480x480.jpg",
    price: 215000,
    description: "Small lying white tiger plush",
    sku: "B27XGI000010",
  },
  {
    slug: "walking-rhino",
    name: "Walking Rhino",
    imageURL:
      "https://safariwonders.com/wp-content/uploads/2023/06/b25xxx000018-walking-rhino-7x11-16283s-1686730601-480x480.jpg",
    price: 125000,
    description: "Walking rhino plush toy",
    sku: "B25XXX000018",
  },
  {
    slug: "bali-starling",
    name: "Bali Starling",
    imageURL:
      "https://safariwonders.com/wp-content/uploads/2023/06/t011xx000047-1686726398-480x480.jpg",
    price: 155000,
    description: "Bali myna bird plush",
    sku: "T011XX0000470",
  },
  {
    slug: "lying-brown-tiger",
    name: "Lying Brown Tiger",
    imageURL:
      "https://safariwonders.com/wp-content/uploads/2023/06/b27xgl000009-lying-brown-tiger-11-215.000-1687748170-480x480.jpg",
    price: 215000,
    description: "Lying brown tiger plush",
    sku: "B27XGL000009",
  },
  {
    slug: "baby-polar-bear",
    name: "Baby Polar Bear",
    imageURL:
      "https://safariwonders.com/wp-content/uploads/2023/06/b02xxx000002-baby-polar-bear-stuffed-1686801426-480x480.jpg",
    price: 230000,
    description: "Baby polar bear plush",
    sku: "B02XXX000002",
  },
  {
    slug: "giraffe-stuffed",
    name: "Giraffe Stuffed",
    imageURL:
      "https://safariwonders.com/wp-content/uploads/2023/06/b09xax000007-giraffe-stuffed-6-105.000-1687748005-480x480.jpg",
    price: 105000,
    description: "Giraffe stuffed plush",
    sku: "B09XAX000007",
  },
];
