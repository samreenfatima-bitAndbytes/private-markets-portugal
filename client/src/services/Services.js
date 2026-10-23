/**
 * Static demo API — all interactive features use localStorage dummy data.
 * No backend required (Vercel-ready).
 */
import {
  bodyToObject,
  currentUser,
  delay,
  enrichCartItem,
  enrichFavourite,
  fail,
  filterProperties,
  mutateDb,
  ok,
  paginate,
  publicUser,
  requireUser,
} from "../mock/helpers";
import { loadDb, saveDb } from "../mock/db";
import { CART_TYPE, FAV_TRUE, GENDER, ROLE, STATE } from "../mock/seedData";

function defaultAvatarFor(payload) {
  const gender = Number(payload.gender);
  const female =
    gender === GENDER.FEMALE ||
    /^(ana|sofia|ines|inês|maria|carla|helena)/i.test(
      String(payload.firstName || payload.fullName || "")
    );
  return female ? "/avatars/female-2.jpg" : "/avatars/male-2.jpg";
}

export const logOut = async () => {
  await delay();
  return ok(null, { message: "Logged out" });
};

export const customerEditProfile = async (body) => {
  await delay();
  const user = requireUser();
  const payload = bodyToObject(body);
  return mutateDb((db) => {
    const idx = db.users.findIndex((u) => u._id === user._id);
    if (idx < 0) fail("User not found", 404);
    const updated = {
      ...db.users[idx],
      ...payload,
      email: db.users[idx].email,
      roleId: db.users[idx].roleId,
    };
    if (payload.profileImg) updated.profileImgId = payload.profileImg;
    if (payload.other_Field && typeof payload.other_Field === "string") {
      try {
        updated.other_Field = JSON.parse(payload.other_Field);
      } catch {
        updated.other_Field = payload.other_Field;
      }
    }
    db.users[idx] = updated;
    return ok(publicUser(updated));
  });
};

export const changePassword = async (body) => {
  await delay();
  const payload = bodyToObject(body);
  return mutateDb((db) => {
    let idx = -1;
    const loggedIn = currentUser();
    if (loggedIn?._id) {
      idx = db.users.findIndex((u) => u._id === loggedIn._id);
    }
    if (idx < 0 && payload.email) {
      idx = db.users.findIndex(
        (u) =>
          u.email?.toLowerCase() === String(payload.email).toLowerCase()
      );
    }
    if (idx < 0) fail("User not found", 404);
    if (payload.oldPassword && db.users[idx].password !== payload.oldPassword) {
      fail("Current password is incorrect");
    }
    if (payload.newPassword) db.users[idx].password = payload.newPassword;
    else if (payload.password) db.users[idx].password = payload.password;
    return ok(null, { message: "Password updated" });
  });
};

export const signIn = async (body) => {
  await delay(180);
  const payload = bodyToObject(body);
  const db = loadDb();
  const user = db.users.find(
    (u) =>
      u.email?.toLowerCase() === String(payload.email || "").toLowerCase()
  );
  if (!user || user.password !== payload.password) {
    fail("Invalid email or password", 401);
  }
  if (user.state === STATE.BLOCK || user.state === STATE.INACTIVE) {
    fail("Account is inactive", 403);
  }
  db.loginActivity.unshift({
    _id: `login-${Date.now()}`,
    email: user.email,
    status: 1,
    ip: "127.0.0.1",
    createdAt: new Date().toISOString(),
  });
  saveDb(db);
  return ok(publicUser(user));
};

export const register = async (body) => {
  await delay();
  const payload = bodyToObject(body);
  return mutateDb((db, { nextId }) => {
    if (!payload.email || !payload.password) fail("Email and password required");
    if (
      db.users.some(
        (u) => u.email.toLowerCase() === String(payload.email).toLowerCase()
      )
    ) {
      fail("Email already registered");
    }
    const roleId = Number(payload.roleId) || ROLE.CUSTOMER;
    const gender =
      payload.gender !== undefined && payload.gender !== ""
        ? Number(payload.gender)
        : /^(ana|sofia|ines|inês|maria|carla|helena)/i.test(
            String(payload.firstName || payload.fullName || "")
          )
          ? GENDER.FEMALE
          : GENDER.MALE;
    const user = {
      _id: nextId("user"),
      fullName: payload.fullName || `${payload.firstName || ""} ${payload.lastName || ""}`.trim(),
      firstName: payload.firstName || "",
      lastName: payload.lastName || "",
      email: payload.email,
      password: payload.password,
      roleId,
      gender,
      state: STATE.ACTIVE,
      isVerified: 1,
      mobile: payload.mobile || "",
      companyName: payload.companyName || "",
      profileImgId: payload.profileImg || defaultAvatarFor({ ...payload, gender }),
      customerId: `cus_demo_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    return ok(publicUser(user), { message: "Registered successfully" });
  });
};

export const forgotPassword = async (body) => {
  await delay();
  const payload = bodyToObject(body);
  const db = loadDb();
  const user = db.users.find(
    (u) => u.email?.toLowerCase() === String(payload.email || "").toLowerCase()
  );
  if (!user) fail("Email not found", 404);
  return ok({ email: user.email, otp: "1234" }, { message: "OTP sent (demo: 1234)" });
};

export const verifyOTP = async (body) => {
  await delay();
  const payload = bodyToObject(body);
  const db = loadDb();
  const user = db.users.find(
    (u) => u.email?.toLowerCase() === String(payload.email || "").toLowerCase()
  );
  if (!user) fail("User not found", 404);
  // Demo: accept any OTP with length >= 4, or 1234
  const otp = String(payload.otp || payload.OTP || "");
  if (otp.length < 4) fail("Invalid OTP");
  user.isVerified = 1;
  saveDb(db);
  return ok(publicUser(user), { message: "Verified" });
};

export const resendOTP = async (body) => {
  await delay();
  return ok(null, { message: "OTP resent (demo: 1234)" });
};

export const staticPages = async (typeId) => {
  await delay();
  const db = loadDb();
  const page = db.cms.find((c) => String(c.typeId) === String(typeId));
  if (!page) fail("Page not found", 404);
  return ok(page);
};

export const customerFaqList = async (query) => {
  await delay();
  const db = loadDb();
  const list = db.faqs.filter((f) => f.stateId === STATE.ACTIVE);
  const { data, _meta } = paginate(list, query?.page, query?.limit);
  return ok(data, { _meta });
};

export const customerAddContact = async (body) => {
  await delay();
  const payload = bodyToObject(body);
  return mutateDb((db, { nextId }) => {
    const firstName =
      payload.firstName || String(payload.name || "").split(" ")[0] || "";
    const lastName =
      payload.lastName ||
      String(payload.name || "").split(" ").slice(1).join(" ") ||
      "";
    const row = {
      _id: nextId("contact"),
      name: payload.name || `${firstName} ${lastName}`.trim(),
      firstName,
      lastName,
      email: payload.email || "",
      subject: payload.subject || "",
      message: payload.message || payload.description || "",
      state: 0,
      stateId: 0,
      createdAt: new Date().toISOString(),
    };
    db.contacts.unshift(row);
    db.messageQueue.unshift({
      _id: nextId("msg"),
      from: row.email,
      subject: row.subject,
      message: row.message,
      createdAt: row.createdAt,
    });
    return ok(row, { message: "Message sent" });
  });
};

export const agentActiveProperty = async () => {
  await delay();
  const db = loadDb();
  return ok(db.categories.filter((c) => c.stateId === STATE.ACTIVE));
};

export const agentAddProperty = async (body) => {
  await delay();
  const user = requireUser();
  const payload = bodyToObject(body);
  return mutateDb((db, { nextId }) => {
    const images = [];
    if (payload.propertyImg) images.push(payload.propertyImg);
    if (payload.image) {
      const arr = Array.isArray(payload.image) ? payload.image : [payload.image];
      images.push(...arr);
    }
    const imagePaths = images.length ? images : ["/property.jpg"];
    const prop = {
      _id: nextId("prop"),
      name: payload.name || "New listing",
      description: payload.description || "",
      place: payload.place || payload.district || "",
      district: payload.district || "",
      municipality: payload.municipality || "",
      parish: payload.parish || "",
      street: payload.street || "",
      postalCode: payload.postalCode || "",
      price: Number(payload.price) || 0,
      rooms: Number(payload.rooms) || 0,
      baths: Number(payload.baths) || 0,
      floor: Number(payload.floor) || 0,
      gross_area: Number(payload.gross_area) || 0,
      net_area: Number(payload.net_area) || 0,
      year_of_construction: Number(payload.year_of_construction) || 2000,
      energy_class: payload.energy_class || "C",
      type_of_real_estate:
        payload.type_of_real_estate || payload.categoryId || "FLAT / APARTMENT",
      categoryId:
        payload.categoryId || payload.type_of_real_estate || "FLAT / APARTMENT",
      elevator: payload.elevator || "No",
      condition: payload.condition
        ? Array.isArray(payload.condition)
          ? payload.condition
          : [payload.condition]
        : ["Good"],
      expectedRentalYield: Number(payload.expectedRentalYield) || 4,
      daysToSale: Number(payload.daysToSale) || 60,
      priceEstimation: Number(payload.priceEstimation) || Number(payload.price) || 0,
      priceDelta: Number(payload.priceDelta) || 0,
      location: payload.location || {
        type: "Point",
        coordinates: [-9.14, 38.72],
      },
      other_features_real_estate: payload.other_features_real_estate || [],
      other_features_building: payload.other_features_building || [],
      reference: payload.reference || `PM-NEW-${Date.now().toString().slice(-5)}`,
      createdBy: user._id,
      username: user.fullName,
      email: user.email,
      mobile: String(user.mobile || ""),
      state: STATE.ACTIVE,
      image: imagePaths,
      propertyImgId: imagePaths,
      fileType: imagePaths.map(() => "image/jpeg"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.properties.unshift(prop);
    return ok(prop, { message: "Property added" });
  });
};

export const agentUpdateProperty = async (body) => {
  await delay();
  requireUser();
  const payload = bodyToObject(body);
  const id = payload._id || payload.id || payload.propertyId;
  return mutateDb((db) => {
    const idx = db.properties.findIndex((p) => p._id === id);
    if (idx < 0) fail("Property not found", 404);
    const prev = db.properties[idx];
    const next = {
      ...prev,
      ...payload,
      _id: prev._id,
      updatedAt: new Date().toISOString(),
    };
    if (payload.propertyImg) {
      next.image = [payload.propertyImg, ...(prev.image || [])];
      next.propertyImgId = next.image;
    }
    db.properties[idx] = next;
    return ok(next, { message: "Property updated" });
  });
};

export const propertyListingAuth = async (query) => {
  await delay();
  requireUser();
  const db = loadDb();
  const filtered = filterProperties(db.properties, query);
  const { data, _meta } = paginate(filtered, query?.page, query?.limit);
  return ok(data, { _meta });
};

export const agentPropertyView = async (id) => {
  await delay();
  const db = loadDb();
  const prop = db.properties.find((p) => p._id === id);
  if (!prop) fail("Property not found", 404);
  return ok(prop);
};

export const agentPropertyDelete = async (id) => {
  await delay();
  requireUser();
  return mutateDb((db) => {
    const idx = db.properties.findIndex((p) => p._id === id);
    if (idx < 0) fail("Property not found", 404);
    db.properties[idx].state = STATE.DELETE;
    return ok(null, { message: "Property deleted" });
  });
};

export const getPropertySearch = async (query) => {
  await delay();
  const db = loadDb();
  const filtered = filterProperties(db.properties, query);
  const { data, _meta } = paginate(filtered, query?.page, query?.limit);
  return ok(data, { _meta });
};

export const propertySearchView = async (id) => {
  await delay();
  const db = loadDb();
  const prop = db.properties.find((p) => p._id === id);
  if (!prop) fail("Property not found", 404);
  return ok(prop);
};

export const customerPropertyList = async (query) => {
  await delay();
  const user = requireUser();
  const db = loadDb();
  const list = db.properties.filter(
    (p) => p.createdBy === user._id && p.state !== STATE.DELETE
  );
  const { data, _meta } = paginate(list, query?.page, query?.limit);
  return ok(data, { _meta });
};

export const contactCsvDownload = async (id) => {
  await delay();
  requireUser();
  // Return a blob-like download path for demo
  return ok("/sample.csv", { message: "CSV ready" });
};

export const customerAddFavourite = async (body) => {
  await delay();
  const user = requireUser();
  const payload = bodyToObject(body);
  return mutateDb((db, { nextId }) => {
    const propertyId = payload.propertyId;
    const existing = db.favourites.find(
      (f) => f.propertyId === propertyId && f.createdBy === user._id
    );
    const isFav = Number(payload.isFavourite);
    if (isFav === 2 || isFav === 0) {
      db.favourites = db.favourites.filter(
        (f) => !(f.propertyId === propertyId && f.createdBy === user._id)
      );
      return ok(null, { message: "Removed from favourites" });
    }
    if (existing) {
      existing.isFavourite = FAV_TRUE;
      return ok(enrichFavourite(existing, db));
    }
    const prop = db.properties.find((p) => p._id === propertyId);
    const fav = {
      _id: nextId("fav"),
      propertyId,
      createdBy: user._id,
      isFavourite: FAV_TRUE,
      propertyDetails: prop,
      createdAt: new Date().toISOString(),
    };
    db.favourites.unshift(fav);
    return ok(enrichFavourite(fav, db), { message: "Added to favourites" });
  });
};

export const customerFavouriteList = async (query) => {
  await delay();
  const user = requireUser();
  const db = loadDb();
  let list = db.favourites
    .filter((f) => f.createdBy === user._id)
    .map((f) => enrichFavourite(f, db));
  if (query?.sort) {
    list = filterProperties(
      list.map((f) => f.propertyDetails).filter(Boolean),
      { sort: query.sort }
    ).map((p) => list.find((f) => f.propertyId === p._id)).filter(Boolean);
  }
  const { data, _meta } = paginate(list, query?.page, query?.limit);
  return ok(data, { _meta });
};

/** UI uses typeId 1=alerts on, 2=off; seed also has isEnable 1/0 */
function normalizeSearch(s) {
  if (!s) return s;
  let typeId = Number(s.typeId);
  if (typeId !== 1 && typeId !== 2) {
    typeId = Number(s.isEnable) === 1 || s.isEnable === true ? 1 : 2;
  }
  return {
    ...s,
    typeId,
    isEnable: typeId === 1 ? 1 : 0,
  };
}

export const customerSaveSearch = async (body) => {
  await delay();
  const user = requireUser();
  const payload = bodyToObject(body);
  return mutateDb((db, { nextId }) => {
    const label =
      payload.search ||
      payload.name ||
      [payload.district, payload.municipality, payload.propertyType]
        .filter(Boolean)
        .join(" · ") ||
      "Saved search";
    const row = {
      _id: nextId("search"),
      ...payload,
      search: label,
      name: payload.name || label,
      createdBy: user._id,
      isEnable: 1,
      typeId: 1,
      createdAt: new Date().toISOString(),
    };
    db.searches.unshift(row);
    return ok(normalizeSearch(row), { message: "Search saved" });
  });
};

export const CustomerSendQueryAuth = async (body) => {
  await delay();
  requireUser();
  return customerAddContact(body);
};

export const CustomerSendQuery = async (body) => {
  await delay();
  return customerAddContact(body);
};

export const customerAddCart = async (body) => {
  await delay();
  const user = requireUser();
  const payload = bodyToObject(body);
  return mutateDb((db, { nextId }) => {
    const productId = payload.productId || null;
    const propertyId = payload.propertyId || null;
    const product = productId
      ? db.products.find((p) => p._id === productId)
      : null;
    const resolvedPrice =
      Number(payload.price) ||
      Number(payload.productPrice) ||
      Number(product?.price) ||
      (propertyId ? 15 : 0);
    const item = {
      _id: nextId("cart"),
      createdBy: user._id,
      price: resolvedPrice,
      typeId: Number(payload.typeId) || CART_TYPE.PRODUCT,
      productId,
      propertyId,
      productPrice: resolvedPrice,
      link: payload.link || "",
    };
    db.cart.unshift(item);
    return ok(enrichCartItem(item, db), { message: "Added to cart" });
  });
};

export const customerCartList = async () => {
  await delay();
  const user = requireUser();
  const db = loadDb();
  const list = db.cart
    .filter((c) => c.createdBy === user._id)
    .map((c) => enrichCartItem(c, db));
  const total = list.reduce((s, i) => s + Number(i.price || 0), 0);
  return ok({ list, total, length: list.length });
};

export const customerRemoveCart = async (id) => {
  await delay();
  const user = requireUser();
  return mutateDb((db) => {
    db.cart = db.cart.filter(
      (c) => !(c._id === id && c.createdBy === user._id)
    );
    const remaining = db.cart.filter((c) => c.createdBy === user._id);
    return ok(remaining, { message: "Removed from cart" });
  });
};

export const customerSearchList = async (query) => {
  await delay();
  const user = requireUser();
  const db = loadDb();
  const list = db.searches
    .filter((s) => s.createdBy === user._id)
    .map(normalizeSearch);
  const { data, _meta } = paginate(list, query?.page, query?.limit);
  return ok(data, { _meta });
};

export const customerActiveProperty = async () => {
  await delay();
  const db = loadDb();
  return ok(db.categories.filter((c) => c.stateId === STATE.ACTIVE));
};

export const customerCardPayment = async (body) => {
  return customerOrderCreate(body);
};

export const customerFileList = async (query) => {
  await delay();
  const user = requireUser();
  const db = loadDb();
  const list = db.orders.filter((o) => o.createdBy === user._id);
  const { data, _meta } = paginate(list, query?.page, query?.limit);
  return ok(data, { _meta });
};

export const customerFileDelete = async (id) => {
  await delay();
  const user = requireUser();
  return mutateDb((db) => {
    db.orders = db.orders.filter(
      (o) => !(o._id === id && o.createdBy === user._id)
    );
    return ok(null, { message: "File deleted" });
  });
};

export const customerSearchUpdate = async (body) => {
  await delay();
  const user = requireUser();
  const payload = bodyToObject(body);
  const searchId = payload._id || payload.id;
  return mutateDb((db) => {
    const idx = db.searches.findIndex(
      (s) => s._id === searchId && s.createdBy === user._id
    );
    if (idx < 0) fail("Search not found", 404);
    const { id: _omitId, ...rest } = payload;
    db.searches[idx] = {
      ...db.searches[idx],
      ...rest,
      _id: db.searches[idx]._id,
      createdBy: db.searches[idx].createdBy,
    };
    return ok(normalizeSearch(db.searches[idx]));
  });
};

export const customerSearchDelete = async (id) => {
  await delay();
  const user = requireUser();
  return mutateDb((db) => {
    db.searches = db.searches.filter(
      (s) => !(s._id === id && s.createdBy === user._id)
    );
    return ok(null, { message: "Search deleted" });
  });
};

export const customerSearchDisable = async (body) => {
  await delay();
  const user = requireUser();
  const payload = bodyToObject(body);
  const searchId = payload._id || payload.id;
  return mutateDb((db) => {
    const idx = db.searches.findIndex(
      (s) => s._id === searchId && s.createdBy === user._id
    );
    if (idx < 0) fail("Search not found", 404);
    const current = normalizeSearch(db.searches[idx]);
    let typeId = Number(payload.typeId);
    if (typeId !== 1 && typeId !== 2) {
      if (payload.isEnable != null) {
        typeId = Number(payload.isEnable) === 1 ? 1 : 2;
      } else {
        typeId = current.typeId === 1 ? 2 : 1;
      }
    }
    db.searches[idx] = {
      ...db.searches[idx],
      typeId,
      isEnable: typeId === 1 ? 1 : 0,
    };
    return ok(normalizeSearch(db.searches[idx]), {
      message: typeId === 1 ? "Alerts enabled" : "Alerts disabled",
    });
  });
};

export const customerNotificationList = async (query) => {
  await delay();
  const user = requireUser();
  const db = loadDb();
  const list = db.notifications.filter((n) => n.createdBy === user._id);
  const { data, _meta } = paginate(list, query?.page, query?.limit);
  return ok(data, { _meta });
};

export const customerDeleteNotification = async () => {
  await delay();
  const user = requireUser();
  return mutateDb((db) => {
    db.notifications = db.notifications.filter((n) => n.createdBy !== user._id);
    return ok(null, { message: "Notifications cleared" });
  });
};

export const importCsv = async () => {
  await delay();
  requireUser();
  return ok(null, { message: "CSV imported (demo)" });
};

/** Stripe-shaped card for CheckoutForm (id, exp_month, exp_year) */
function normalizeCard(card) {
  if (!card) return card;
  const id = card.id || card._id;
  const expMonth = Number(card.exp_month ?? card.expMonth) || 0;
  const expYear = Number(card.exp_year ?? card.expYear) || 0;
  return {
    ...card,
    id,
    _id: card._id || id,
    brand: card.brand || "Card",
    last4: String(card.last4 || "0000").slice(-4),
    expMonth,
    expYear,
    exp_month: expMonth,
    exp_year: expYear,
    created: card.created || Date.parse(card.createdAt || 0) || 0,
  };
}

export const customerAddCard = async (body) => {
  await delay();
  const user = requireUser();
  const payload = bodyToObject(body);
  return mutateDb((db, { nextId }) => {
    const card = {
      _id: nextId("card"),
      brand: payload.brand || "Visa",
      last4: String(payload.last4 || "4242").slice(-4),
      expMonth: Number(payload.expMonth ?? payload.exp_month) || 12,
      expYear: Number(payload.expYear ?? payload.exp_year) || 2028,
      createdBy: user._id,
      createdAt: new Date().toISOString(),
    };
    db.cards.unshift(card);
    return ok(normalizeCard(card), { message: "Card added" });
  });
};

export const customerCardList = async () => {
  await delay();
  const user = requireUser();
  const db = loadDb();
  return ok(
    db.cards.filter((c) => c.createdBy === user._id).map(normalizeCard)
  );
};

export const customerCardDelete = async (id) => {
  await delay();
  const user = requireUser();
  return mutateDb((db) => {
    db.cards = db.cards.filter(
      (c) =>
        !(
          (c._id === id || c.id === id) &&
          c.createdBy === user._id
        )
    );
    return ok(null, { message: "Card deleted" });
  });
};

export const customerOrderCreate = async (body) => {
  await delay(250);
  const user = requireUser();
  const payload = bodyToObject(body);
  return mutateDb((db, { nextId }) => {
    const cartItems = db.cart.filter((c) => c.createdBy === user._id);
    const productIds = payload.productIds || [];
    const items =
      cartItems.length > 0
        ? cartItems
        : productIds.map((id) => ({
            productId: id,
            price: db.products.find((p) => p._id === id)?.price || 0,
            typeId: CART_TYPE.PRODUCT,
          }));

    if (!items.length) fail("Cart is empty");

    const priced = items.map((i) => enrichCartItem(i, db));
    const total = priced.reduce((s, i) => s + Number(i.price || 0), 0);
    const orderId = `ORD-${1000 + db.orders.length + 1}`;
    const products = priced.map((i) => {
      if (i.productId) {
        return (
          db.products.find((p) => p._id === i.productId) || {
            productName: i.productDetails?.productName || "Data pack",
            price: i.price,
            productFile: "/sample.csv",
          }
        );
      }
      return {
        productName: `CSV — ${i.link || i.propertyId}`,
        price: i.price,
        productFile: "/sample.csv",
      };
    });

    const order = {
      _id: nextId("order"),
      orderId,
      createdBy: user._id,
      total,
      status: STATE.ACTIVE,
      productId: items.map((i) => i.productId || i.propertyId).filter(Boolean),
      products,
      createdAt: new Date().toISOString(),
      downloadUrl: products[0]?.productFile || "/sample.csv",
    };
    db.orders.unshift(order);
    db.payments.unshift({
      _id: nextId("pay"),
      orderId,
      amount: total,
      status: STATE.ACTIVE,
      createdBy: user._id,
      userEmail: user.email,
      createdAt: new Date().toISOString(),
    });
    db.emailQueue.unshift({
      _id: nextId("email"),
      to: user.email,
      subject: `Order confirmation ${orderId}`,
      status: 1,
      createdAt: new Date().toISOString(),
      body: "Your download is ready.",
    });
    db.cart = db.cart.filter((c) => c.createdBy !== user._id);
    db.notifications.unshift({
      _id: nextId("notif"),
      title: "Order complete",
      message: `Order ${orderId} paid successfully (demo).`,
      createdBy: user._id,
      isRead: 0,
      createdAt: new Date().toISOString(),
    });
    return ok(order, { message: "Payment successful (demo)" });
  });
};

export const customerOrderDownload = async (orderId) => {
  await delay();
  requireUser();
  const db = loadDb();
  const order =
    db.orders.find((o) => o._id === orderId || o.orderId === orderId);
  if (!order) fail("Order not found", 404);
  return ok(order.downloadUrl || "/sample.csv");
};

export const customerDownloadFull = async () => {
  await delay();
  requireUser();
  return ok("/sample.csv");
};

export const customerAllProperty = async (query) => {
  await delay();
  requireUser();
  const db = loadDb();
  let list = db.products.filter((p) => p.stateId === STATE.ACTIVE);
  if (query?.search) {
    const q = String(query.search).toLowerCase();
    list = list.filter((p) => p.productName.toLowerCase().includes(q));
  }
  const { data, _meta } = paginate(list, query?.page, query?.limit);
  return ok(data, { _meta });
};

export const adminStatusProperty = async (id, body) => {
  await delay();
  requireUser();
  const payload = bodyToObject(body);
  return mutateDb((db) => {
    const idx = db.properties.findIndex((p) => p._id === id);
    if (idx < 0) fail("Property not found", 404);
    db.properties[idx].state = payload.state ?? payload.stateId ?? STATE.ACTIVE;
    return ok(db.properties[idx]);
  });
};

export const activeCategory = async () => {
  await delay();
  const db = loadDb();
  return ok(db.categories.filter((c) => c.stateId === STATE.ACTIVE));
};

export const placeList = async (search, pageNo, municiplity = "") => {
  await delay();
  const db = loadDb();
  let list = db.places;
  if (municiplity) {
    list = list.filter(
      (p) =>
        p.municipalityId === municiplity || p.municipality === municiplity
    );
  }
  if (search) {
    list = list.filter((p) =>
      p.title.toLowerCase().includes(String(search).toLowerCase())
    );
  }
  const { data, _meta } = paginate(list, pageNo, 10);
  return ok(data, { _meta });
};

export const municiplityList = async (search, pageNo, districtId = "") => {
  await delay();
  const db = loadDb();
  let list = db.municipalities;
  if (districtId) {
    list = list.filter(
      (m) => m.districtId === districtId || m.district === districtId
    );
  }
  if (search) {
    list = list.filter((m) =>
      m.title.toLowerCase().includes(String(search).toLowerCase())
    );
  }
  const { data, _meta } = paginate(list, pageNo, 10);
  return ok(data, { _meta });
};

export const districtList = async (search, pageNo) => {
  await delay();
  const db = loadDb();
  let list = db.districts;
  if (search) {
    list = list.filter((d) =>
      d.title.toLowerCase().includes(String(search).toLowerCase())
    );
  }
  const { data, _meta } = paginate(list, pageNo, 10);
  return ok(data, { _meta });
};

export const productListWithoutAuth = async (query) => {
  await delay();
  const db = loadDb();
  const list = db.products.filter((p) => p.stateId === STATE.ACTIVE);
  const { data, _meta } = paginate(list, query?.page, query?.limit);
  return ok(data, { _meta });
};

// Expose for GeoSearch without axios
export { geoSearch } from "../mock/helpers";
export { resetDb } from "../mock/db";
export { currentUser };
