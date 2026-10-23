import { store } from "../redux/store";
import { clone, loadDb, nextId, saveDb } from "./db";
import { STATE } from "./seedData";

export function delay(ms = 120) {
  return new Promise((r) => setTimeout(r, ms));
}

export function ok(data, extra = {}) {
  return {
    status: 200,
    data: {
      success: true,
      message: extra.message || "Success",
      data,
      ...(extra._meta ? { _meta: extra._meta } : {}),
      ...extra,
    },
  };
}

export function fail(message, status = 400) {
  const err = new Error(message);
  err.response = { status, data: { message, success: false } };
  throw err;
}

export function bodyToObject(body) {
  if (!body) return {};
  if (typeof FormData !== "undefined" && body instanceof FormData) {
    const o = {};
    for (const [k, v] of body.entries()) {
      if (v instanceof File) {
        o[k] = URL.createObjectURL(v);
        o[`${k}Name`] = v.name;
        o[`${k}File`] = v;
      } else {
        o[k] = v;
      }
    }
    return o;
  }
  return { ...body };
}

export function currentUser() {
  const details = store.getState()?.auth?.details;
  if (!details?._id && !details?.token) return null;
  const db = loadDb();
  const user =
    db.users.find((u) => u._id === details._id) ||
    db.users.find((u) => u.email === details.email);
  return user || details;
}

export function requireUser() {
  const user = currentUser();
  if (!user) fail("Please login to continue", 401);
  return user;
}

export function publicUser(user, token) {
  if (!user) return null;
  const { password, ...rest } = user;
  return {
    ...rest,
    token: token || rest.token || `demo-token-${rest._id}`,
  };
}

export function paginate(list, page = 1, limit = 10) {
  const pageNo = Number(page) || 1;
  const pageLimit = Number(limit) || 10;
  const totalCount = list.length;
  const start = (pageNo - 1) * pageLimit;
  const data = list.slice(start, start + pageLimit);
  return {
    data,
    _meta: {
      totalCount,
      pageCount: Math.max(1, Math.ceil(totalCount / pageLimit)),
      currentPage: pageNo,
      perPage: pageLimit,
    },
  };
}

function includesCI(hay, needle) {
  if (!needle) return true;
  return String(hay || "")
    .toLowerCase()
    .includes(String(needle).toLowerCase());
}

export function filterProperties(list, query = {}) {
  let items = list.filter((p) => p.state !== STATE.DELETE);

  const search = (query.search || query.name || "").trim();
  if (search) {
    items = items.filter(
      (p) =>
        includesCI(p.name, search) ||
        includesCI(p.district, search) ||
        includesCI(p.municipality, search) ||
        includesCI(p.parish, search) ||
        includesCI(p.place, search) ||
        includesCI(p.street, search) ||
        includesCI(p.reference, search) ||
        includesCI(p.type_of_real_estate, search)
    );
  }

  if (query.district) {
    items = items.filter((p) => includesCI(p.district, query.district));
  }
  if (query.municipality) {
    items = items.filter((p) =>
      includesCI(p.municipality, query.municipality)
    );
  }
  if (query.parish) {
    items = items.filter((p) => includesCI(p.parish, query.parish));
  }

  const propertyType = query.propertyType || query.property_type;
  if (propertyType) {
    items = items.filter((p) => p.type_of_real_estate === propertyType);
  }

  const num = (v) => (v === "" || v == null ? null : Number(v));
  const minPrice = num(query.minPrice);
  const maxPrice = num(query.maxPrice);
  if (minPrice != null && !Number.isNaN(minPrice)) {
    items = items.filter((p) => Number(p.price) >= minPrice);
  }
  if (maxPrice != null && !Number.isNaN(maxPrice)) {
    items = items.filter((p) => Number(p.price) <= maxPrice);
  }

  const minSize = num(query.minSize);
  const maxSize = num(query.maxSize);
  if (minSize != null && !Number.isNaN(minSize)) {
    items = items.filter((p) => Number(p.gross_area) >= minSize);
  }
  if (maxSize != null && !Number.isNaN(maxSize)) {
    items = items.filter((p) => Number(p.gross_area) <= maxSize);
  }

  const minNet = num(query.minNet);
  const maxNet = num(query.maxNet);
  if (minNet != null && !Number.isNaN(minNet)) {
    items = items.filter((p) => Number(p.net_area) >= minNet);
  }
  if (maxNet != null && !Number.isNaN(maxNet)) {
    items = items.filter((p) => Number(p.net_area) <= maxNet);
  }

  if (query.rooms) {
    const rooms = Array.isArray(query.rooms) ? query.rooms : [query.rooms];
    items = items.filter((p) => rooms.map(Number).includes(Number(p.rooms)));
  }
  if (query.baths) {
    const baths = Array.isArray(query.baths) ? query.baths : [query.baths];
    items = items.filter((p) => baths.map(Number).includes(Number(p.baths)));
  }
  if (query.floor) {
    const floors = Array.isArray(query.floor) ? query.floor : [query.floor];
    items = items.filter((p) => floors.map(Number).includes(Number(p.floor)));
  }
  if (query.condition) {
    const conds = Array.isArray(query.condition)
      ? query.condition
      : [query.condition];
    items = items.filter((p) =>
      (p.condition || []).some((c) =>
        conds.some((x) => includesCI(c, x) || includesCI(x, c))
      )
    );
  }

  const sort = Number(query.sort) || 0;
  items = [...items];
  switch (sort) {
    case 3:
      items.sort((a, b) => b.price - a.price);
      break;
    case 4:
      items.sort((a, b) => a.price - b.price);
      break;
    case 5:
      items.sort((a, b) => b.floor - a.floor);
      break;
    case 6:
      items.sort((a, b) => a.floor - b.floor);
      break;
    case 7:
      items.sort((a, b) => b.gross_area - a.gross_area);
      break;
    case 8:
      items.sort((a, b) => a.gross_area - b.gross_area);
      break;
    case 2:
      items.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      break;
    case 1:
    default:
      items.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      break;
  }

  return items;
}

export function enrichFavourite(fav, db) {
  const propertyDetails =
    db.properties.find((p) => p._id === fav.propertyId) || fav.propertyDetails;
  return { ...fav, propertyDetails };
}

export function enrichCartItem(item, db) {
  const productDetails = item.productId
    ? db.products.find((p) => p._id === item.productId) || item.productDetails
    : item.productDetails;
  const propertyDetails = item.propertyId
    ? db.properties.find((p) => p._id === item.propertyId) ||
      item.propertyDetails
    : item.propertyDetails;
  const price =
    Number(item.price) ||
    Number(item.productPrice) ||
    Number(productDetails?.price) ||
    0;
  return {
    ...item,
    price,
    productPrice: Number(item.productPrice) || price,
    productDetails,
    propertyDetails,
  };
}

export function mutateDb(fn) {
  const db = loadDb();
  const out = fn(db, { nextId: (prefix) => nextId(db, prefix), clone });
  saveDb(db);
  return out;
}

export async function geoSearch(query) {
  await delay(80);
  const db = loadDb();
  const q = String(query || "").trim().toLowerCase();
  if (q.length < 2) {
    return { districts: [], municipalities: [], addresses: [] };
  }

  const districts = db.districts
    .filter((d) => d.title.toLowerCase().includes(q))
    .map((d) => ({
      district: d.title,
      municipality: "",
      parish: "",
      label: d.title,
    }));

  const municipalities = db.municipalities
    .filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        String(m.district || "")
          .toLowerCase()
          .includes(q)
    )
    .map((m) => ({
      district: m.district,
      municipality: m.title,
      parish: "",
      label: `${m.title}, ${m.district}`,
    }));

  const addresses = db.properties
    .filter(
      (p) =>
        p.parish?.toLowerCase().includes(q) ||
        p.street?.toLowerCase().includes(q) ||
        p.name?.toLowerCase().includes(q)
    )
    .slice(0, 8)
    .map((p) => ({
      district: p.district,
      municipality: p.municipality,
      parish: p.parish,
      label: `${p.parish}, ${p.municipality}, ${p.district}`,
      lat: p.location?.coordinates?.[1],
      lng: p.location?.coordinates?.[0],
    }));

  return { districts, municipalities, addresses };
}
