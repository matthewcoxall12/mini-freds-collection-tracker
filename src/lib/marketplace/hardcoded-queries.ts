import type { MarketplaceQuery } from "./types";

const EBAY_EXACT: string[] = [
  "Corgi CC80501 Austin A35",
  "Corgi CC80502 Austin A35 Wallace Gromit",
  "Corgi CC80503 Austin A35 Wallace Gromit",
  "Corgi CC80505 Austin A35",
  "Corgi CC80506 Austin A35 Cheese Please",
  "Corgi 61209 Austin A35 Cadbury",
  "Corgi 67301 Austin Service A35",
  "Corgi 67303 Austin A35 Guinness",
  "Corgi 67305 Austin A35 Norman",
  "Corgi LP06545 Austin A35 Royal Mail",
  "Corgi 12874 Austin A35 Royal Mail",
  "Lledo DG197000 Austin A35 AA",
  "Lledo DG197001 Austin A35 Eddie Stobart",
  "Lledo DG197002 Austin A35 Royal Mail",
  "Lledo DG197003 Austin A35 RAC",
  "Lledo DG197004 Austin A35 Smarties",
  "Lledo DG197005 Austin A35 Gales Honey",
  "Lledo DG197007 Austin A35 MEB",
  "Lledo DG197008 Austin A35 MacFisheries",
  "Vanguards VA01700 Austin A35 RAC",
  "Vanguards VA01701 Austin A35 Austin Sales Service",
  "Vanguards VA01702 Austin A35 Barkers",
  "Vanguards VA01703 Austin A35 Mackeson",
  "Vanguards VA01704 Austin A35 Securicor",
  "Vanguards VA01705 Austin A35 Wiltshire Constabulary",
  "Vanguards VA01706 Austin A35 Midlands Electricity",
  "Vanguards VA01707 Austin A35 British Railways",
  "Vanguards VA01708 Austin A35 Hidden Treasures",
  "Vanguards VA01709 Austin A35 Post Office",
  "Vanguards VA01710 Austin A35 Drive Time",
  "Vanguards RAC1004 Austin A35",
  "Lledo LP197 Austin A35",
  "Lledo LP197-1001 Austin A35 St Kew Dairy",
  "Lledo LP197-1002 Austin A35 Chiltern Hills",
  "Lledo LP197-1004 Austin A35 RNLI",
  "Lledo LP197-1005 Austin A35 Enfield Pageant",
  "Lledo Issue 65 Austin A35 Hoover",
  "SRC SRCM1 Austin A35 RAC",
  "SRC Austin A35 Coventry Climax",
  "Promod Austin A35 van kit",
  "Pocketbond EM76663 Austin A35",
  "Pocketbond EM76664 Austin A35",
  "Pocketbond EM76665 Austin A35",
  "Pocketbond EM76666 Austin A35",
  "Pocketbond EM76667 Austin A35",
  "Pocketbond EM76668 Austin A35",
];

const EBAY_DISCOVERY: string[] = [
  "Austin A35 van diecast",
  "Austin A35 van model",
  "Austin A35 van 1:43",
  "Austin A35 van toy",
  "Austin A35 model van",
  "Lledo Austin A35 van",
  "Days Gone Austin A35 van",
  "Corgi Austin A35 van",
  "Corgi Classics Austin A35 van",
  "Vanguards Austin A35 van",
  "SRC Austin A35 van",
  "Promod Austin A35 van",
  "Pocketbond Austin A35",
  "Classix Austin A35",
  "Wallace Gromit Austin A35 van",
  "Royal Mail Austin A35 van",
  "RAC Austin A35 van",
];

const VINTED_QUERIES: string[] = [
  "Austin A35",
  "Austin A35 van",
  "Austin model van",
  "Corgi Austin",
  "Lledo Austin",
  "Vanguards Austin",
  "Days Gone Austin",
  "Wallace Gromit van",
  "Royal Mail van model",
  "RAC van model",
];

export function getHardcodedQueries(): MarketplaceQuery[] {
  const ebay: MarketplaceQuery[] = [
    ...EBAY_EXACT.map((q) => ({
      provider: "ebay" as const,
      query: q,
      queryType: "exact_item" as const,
      priority: 10,
      limit: 25,
    })),
    ...EBAY_DISCOVERY.map((q) => ({
      provider: "ebay" as const,
      query: q,
      queryType: "general_discovery" as const,
      priority: 5,
      limit: 20,
    })),
  ];

  const vinted: MarketplaceQuery[] = VINTED_QUERIES.map((q) => ({
    provider: "vinted" as const,
    query: q,
    queryType: "general_discovery" as const,
    priority: 5,
    limit: 20,
  }));

  return [...ebay, ...vinted];
}

export const HARDCODED_EBAY_COUNT = EBAY_EXACT.length + EBAY_DISCOVERY.length;
export const HARDCODED_VINTED_COUNT = VINTED_QUERIES.length;
