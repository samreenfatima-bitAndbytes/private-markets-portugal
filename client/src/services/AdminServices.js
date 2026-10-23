/**
 * Static demo admin API — localStorage backed.
 */
import {
  bodyToObject,
  delay,
  fail,
  mutateDb,
  ok,
  paginate,
  requireUser,
} from "../mock/helpers";
import { loadDb } from "../mock/db";
import { ROLE, STATE } from "../mock/seedData";

function requireAdmin() {
  const user = requireUser();
  if (user.roleId !== ROLE.ADMIN) fail("Admin access required", 403);
  return user;
}

function userDetails(db, userId) {
  const u = db.users.find((x) => x._id === userId);
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
}

function enrichOrder(db, order) {
  const products =
    order.products ||
    order.productDetails ||
    (order.productId || [])
      .map((id) => db.products.find((p) => p._id === id))
      .filter(Boolean);
  return {
    ...order,
    productId: order.productId || products.map((p) => p._id),
    products,
    productDetails: products,
    userDetails: userDetails(db, order.createdBy),
  };
}

function enrichPayment(db, payment) {
  const user = userDetails(db, payment.createdBy);
  return {
    ...payment,
    productId: payment.productId || [payment.orderId],
    userDetails: user,
    userEmail: payment.userEmail || user?.email,
  };
}

export const adminDashboardCounts = async () => {
  await delay();
  requireAdmin();
  const db = loadDb();
  return ok({
    userCount: db.users.filter((u) => u.roleId !== ROLE.ADMIN).length,
    orderCount: db.orders.length,
    paymentCount: db.payments.length,
    cmsCount: (db.cms || []).filter(
      (c) => c.stateId !== STATE.DELETE && c.state !== STATE.DELETE
    ).length,
    propertyCount: db.properties.filter((p) => p.state !== STATE.DELETE).length,
    productCount: db.products.filter((p) => p.stateId === STATE.ACTIVE).length,
    contactCount: db.contacts.length,
  });
};

export const adminGraphData = async (year) => {
  await delay();
  requireAdmin();
  const y = Number(year) || new Date().getFullYear();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const seed = y % 7;
  const data = months.map((m, i) => [
    m,
    2 + ((i + seed) % 5),
    1 + ((i + seed) % 3),
    i < 6 ? (i + seed) % 4 : (i + seed) % 3,
    i < 6 ? (i + seed) % 4 : (i + seed) % 3,
  ]);
  return ok(data);
};

export const adminUserList = async (query) => {
  await delay();
  requireAdmin();
  const db = loadDb();
  let list = db.users.filter((u) => u.roleId !== ROLE.ADMIN);
  if (query?.roleId) {
    list = list.filter((u) => String(u.roleId) === String(query.roleId));
  }
  if (query?.state) {
    list = list.filter((u) => String(u.state) === String(query.state));
  }
  if (query?.search?.trim()) {
    const q = query.search.trim().toLowerCase();
    list = list.filter(
      (u) =>
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }
  const { data, _meta } = paginate(list, query?.page, query?.limit);
  return ok(
    data.map(({ password, ...u }) => u),
    { _meta }
  );
};

export const adminUserView = async (id) => {
  await delay();
  requireAdmin();
  const db = loadDb();
  const user = db.users.find((u) => u._id === id);
  if (!user) fail("User not found", 404);
  const { password, ...rest } = user;
  return ok(rest);
};

export const adminUserUpdate = async (id, body) => {
  await delay();
  requireAdmin();
  const payload = bodyToObject(body);
  return mutateDb((db) => {
    const idx = db.users.findIndex((u) => u._id === id);
    if (idx < 0) fail("User not found", 404);
    db.users[idx] = { ...db.users[idx], ...payload, _id: id };
    const { password, ...rest } = db.users[idx];
    return ok(rest);
  });
};

export const adminErrorList = async (query) => {
  await delay();
  requireAdmin();
  const db = loadDb();
  const { data, _meta } = paginate(db.errorLogs, query?.page, query?.limit);
  return ok(data, { _meta });
};

export const adminErrorDelete = async (id) => {
  await delay();
  requireAdmin();
  return mutateDb((db) => {
    db.errorLogs = db.errorLogs.filter((e) => e._id !== id);
    return ok(null);
  });
};

export const adminErrorAllDelete = async () => {
  await delay();
  requireAdmin();
  return mutateDb((db) => {
    db.errorLogs = [];
    return ok(null);
  });
};

export const adminEmailList = async (query) => {
  await delay();
  requireAdmin();
  const db = loadDb();
  const { data, _meta } = paginate(db.emailQueue, query?.page, query?.limit);
  return ok(data, { _meta });
};

export const adminEmailDelete = async (id) => {
  await delay();
  requireAdmin();
  return mutateDb((db) => {
    db.emailQueue = db.emailQueue.filter((e) => e._id !== id);
    return ok(null);
  });
};

export const adminEmailAllDelete = async () => {
  await delay();
  requireAdmin();
  return mutateDb((db) => {
    db.emailQueue = [];
    return ok(null);
  });
};

export const adminEmailView = async (id) => {
  await delay();
  requireAdmin();
  const db = loadDb();
  const row = db.emailQueue.find((e) => e._id === id);
  if (!row) fail("Not found", 404);
  return ok(row);
};

export const adminLoginList = async (query) => {
  await delay();
  requireAdmin();
  const db = loadDb();
  const { data, _meta } = paginate(db.loginActivity, query?.page, query?.limit);
  return ok(data, { _meta });
};

export const adminLoginView = async (id) => {
  await delay();
  requireAdmin();
  const db = loadDb();
  const row = db.loginActivity.find((e) => e._id === id);
  if (!row) fail("Not found", 404);
  return ok(row);
};

export const adminLoginAllDelete = async () => {
  await delay();
  requireAdmin();
  return mutateDb((db) => {
    db.loginActivity = [];
    return ok(null);
  });
};

export const adminCmsList = async (query) => {
  await delay();
  requireAdmin();
  const db = loadDb();
  const { data, _meta } = paginate(db.cms, query?.page, query?.limit);
  return ok(data, { _meta });
};

export const adminAddCms = async (body) => {
  await delay();
  requireAdmin();
  const payload = bodyToObject(body);
  return mutateDb((db, { nextId }) => {
    const row = {
      _id: nextId("cms"),
      title: payload.title || "Untitled",
      description: payload.description || "",
      typeId: Number(payload.typeId) || 1,
      stateId: STATE.ACTIVE,
      image: payload.image || "",
    };
    db.cms.unshift(row);
    return ok(row);
  });
};

export const adminCmsView = async (id) => {
  await delay();
  requireAdmin();
  const db = loadDb();
  const row = db.cms.find((c) => c._id === id);
  if (!row) fail("Not found", 404);
  return ok(row);
};

export const adminUpdateCms = async (id, body) => {
  await delay();
  requireAdmin();
  const payload = bodyToObject(body);
  return mutateDb((db) => {
    const idx = db.cms.findIndex((c) => c._id === id);
    if (idx < 0) fail("Not found", 404);
    db.cms[idx] = { ...db.cms[idx], ...payload, _id: id };
    return ok(db.cms[idx]);
  });
};

export const adminStatusCms = async (id, body) => {
  await delay();
  requireAdmin();
  const payload = bodyToObject(body);
  return mutateDb((db) => {
    const idx = db.cms.findIndex((c) => c._id === id);
    if (idx < 0) fail("Not found", 404);
    db.cms[idx].stateId = payload.stateId ?? payload.state ?? STATE.ACTIVE;
    return ok(db.cms[idx]);
  });
};

export const adminDeleteCMS = async (id) => {
  await delay();
  requireAdmin();
  return mutateDb((db) => {
    db.cms = db.cms.filter((c) => c._id !== id);
    return ok(null);
  });
};

export const adminFaqList = async (query) => {
  await delay();
  requireAdmin();
  const db = loadDb();
  const { data, _meta } = paginate(db.faqs, query?.page, query?.limit);
  return ok(data, { _meta });
};

export const adminAddFaq = async (body) => {
  await delay();
  requireAdmin();
  const payload = bodyToObject(body);
  return mutateDb((db, { nextId }) => {
    const row = {
      _id: nextId("faq"),
      question: payload.question || "",
      answer: payload.answer || "",
      stateId: STATE.ACTIVE,
    };
    db.faqs.unshift(row);
    return ok(row);
  });
};

export const adminViewFaq = async (id) => {
  await delay();
  requireAdmin();
  const db = loadDb();
  const row = db.faqs.find((f) => f._id === id);
  if (!row) fail("Not found", 404);
  return ok(row);
};

export const adminUpdateFaq = async (id, body) => {
  await delay();
  requireAdmin();
  const payload = bodyToObject(body);
  return mutateDb((db) => {
    const idx = db.faqs.findIndex((f) => f._id === id);
    if (idx < 0) fail("Not found", 404);
    db.faqs[idx] = { ...db.faqs[idx], ...payload, _id: id };
    return ok(db.faqs[idx]);
  });
};

export const adminFaqStatus = async (body) => {
  await delay();
  requireAdmin();
  const payload = bodyToObject(body);
  return mutateDb((db) => {
    const idx = db.faqs.findIndex((f) => f._id === payload._id || f._id === payload.id);
    if (idx < 0) fail("Not found", 404);
    db.faqs[idx].stateId = payload.stateId ?? payload.state ?? STATE.ACTIVE;
    return ok(db.faqs[idx]);
  });
};

export const adminDeleteFaq = async (id) => {
  await delay();
  requireAdmin();
  return mutateDb((db) => {
    db.faqs = db.faqs.filter((f) => f._id !== id);
    return ok(null);
  });
};

export const adminContactList = async (query) => {
  await delay();
  requireAdmin();
  const db = loadDb();
  const { data, _meta } = paginate(db.contacts, query?.page, query?.limit);
  return ok(data, { _meta });
};

export const adminContactView = async (id) => {
  await delay();
  requireAdmin();
  const db = loadDb();
  const row = db.contacts.find((c) => c._id === id);
  if (!row) fail("Not found", 404);
  return ok(row);
};

export const adminCategoryList = async (query) => {
  await delay();
  requireAdmin();
  const db = loadDb();
  const { data, _meta } = paginate(db.categories, query?.page, query?.limit);
  return ok(data, { _meta });
};

export const adminAddCatgeory = async (body) => {
  await delay();
  requireAdmin();
  const payload = bodyToObject(body);
  return mutateDb((db, { nextId }) => {
    const row = {
      _id: nextId("cat"),
      name: payload.name || "Category",
      description: payload.description || "",
      stateId: STATE.ACTIVE,
      createdBy: requireAdmin()._id,
    };
    db.categories.unshift(row);
    return ok(row);
  });
};

export const adminCategoryView = async (id) => {
  await delay();
  requireAdmin();
  const db = loadDb();
  const row = db.categories.find((c) => c._id === id);
  if (!row) fail("Not found", 404);
  return ok(row);
};

export const adminUpdateCategory = async (id, body) => {
  await delay();
  requireAdmin();
  const payload = bodyToObject(body);
  return mutateDb((db) => {
    const idx = db.categories.findIndex((c) => c._id === id);
    if (idx < 0) fail("Not found", 404);
    db.categories[idx] = { ...db.categories[idx], ...payload, _id: id };
    return ok(db.categories[idx]);
  });
};

export const adminStatusCategory = async (id, body) => {
  await delay();
  requireAdmin();
  const payload = bodyToObject(body);
  return mutateDb((db) => {
    const idx = db.categories.findIndex((c) => c._id === id);
    if (idx < 0) fail("Not found", 404);
    db.categories[idx].stateId = payload.stateId ?? payload.state ?? STATE.ACTIVE;
    return ok(db.categories[idx]);
  });
};

export const adminDeleteCatgeory = async (id) => {
  await delay();
  requireAdmin();
  return mutateDb((db) => {
    db.categories = db.categories.filter((c) => c._id !== id);
    return ok(null);
  });
};

export const adminPropertyList = async (query) => {
  await delay();
  requireAdmin();
  const db = loadDb();
  let list = db.properties.filter((p) => p.state !== STATE.DELETE);
  if (query?.search?.trim()) {
    const q = query.search.trim().toLowerCase();
    list = list.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.reference?.toLowerCase().includes(q) ||
        p.district?.toLowerCase().includes(q)
    );
  }
  const { data, _meta } = paginate(list, query?.page, query?.limit);
  return ok(data, { _meta });
};

export const adminPropertyView = async (id) => {
  await delay();
  requireAdmin();
  const db = loadDb();
  const row = db.properties.find((p) => p._id === id);
  if (!row) fail("Not found", 404);
  return ok(row);
};

export const adminUpdatePropertyState = async (body) => {
  await delay();
  requireAdmin();
  const payload = bodyToObject(body);
  return mutateDb((db) => {
    const idx = db.properties.findIndex(
      (p) => p._id === payload._id || p._id === payload.id
    );
    if (idx < 0) fail("Not found", 404);
    db.properties[idx].state = payload.state ?? STATE.ACTIVE;
    return ok(db.properties[idx]);
  });
};

export const getPropertyList = async (query) => adminPropertyList(query);

export const adminOrderList = async (query) => {
  await delay();
  requireAdmin();
  const db = loadDb();
  const enriched = db.orders.map((o) => enrichOrder(db, o));
  const { data, _meta } = paginate(enriched, query?.page, query?.limit);
  return ok(data, { _meta });
};

export const adminViewOrder = async (id) => {
  await delay();
  requireAdmin();
  const db = loadDb();
  const row = db.orders.find((o) => o._id === id || o.orderId === id);
  if (!row) fail("Not found", 404);
  return ok(enrichOrder(db, row));
};

export const adminPaymentList = async (query) => {
  await delay();
  requireAdmin();
  const db = loadDb();
  const enriched = db.payments.map((p) => enrichPayment(db, p));
  const { data, _meta } = paginate(enriched, query?.page, query?.limit);
  return ok(data, { _meta });
};

export const adminViewPayment = async (id) => {
  await delay();
  requireAdmin();
  const db = loadDb();
  const row = db.payments.find((p) => p._id === id);
  if (!row) fail("Not found", 404);
  return ok(enrichPayment(db, row));
};

export const adminAddProduct = async (body) => {
  await delay();
  requireAdmin();
  const payload = bodyToObject(body);
  return mutateDb((db, { nextId }) => {
    const img = payload.productImg || payload.image || "/csv.png";
    const row = {
      _id: nextId("prod"),
      productName: payload.productName || "New pack",
      price: Number(payload.price) || 0,
      productImg: Array.isArray(img) ? img : [img],
      productFile: payload.productFile || "/sample-product-data.csv",
      stateId: STATE.ACTIVE,
      createdBy: requireAdmin()._id,
      createdAt: new Date().toISOString(),
    };
    db.products.unshift(row);
    return ok(row);
  });
};

export const adminUpdateProperty = async (id, body) => {
  await delay();
  requireAdmin();
  const payload = bodyToObject(body);
  return mutateDb((db) => {
    const idx = db.products.findIndex((p) => p._id === id);
    if (idx < 0) fail("Not found", 404);
    const img = payload.productImg || payload.image;
    db.products[idx] = {
      ...db.products[idx],
      ...payload,
      _id: id,
      productImg: img
        ? Array.isArray(img)
          ? img
          : [img]
        : db.products[idx].productImg,
    };
    return ok(db.products[idx]);
  });
};

export const adminViewProduct = async (id) => {
  await delay();
  requireAdmin();
  const db = loadDb();
  const row = db.products.find((p) => p._id === id);
  if (!row) fail("Not found", 404);
  return ok(row);
};

export const adminProductList = async (query) => {
  await delay();
  requireAdmin();
  const db = loadDb();
  let list = db.products.filter((p) => p.stateId !== STATE.DELETE);
  if (query?.search) {
    const q = String(query.search).toLowerCase();
    list = list.filter((p) => p.productName.toLowerCase().includes(q));
  }
  const { data, _meta } = paginate(list, query?.page, query?.limit);
  return ok(data, { _meta });
};

export const adminStatusProduct = async (id, body) => {
  await delay();
  requireAdmin();
  const payload = bodyToObject(body);
  return mutateDb((db) => {
    const idx = db.products.findIndex((p) => p._id === id);
    if (idx < 0) fail("Not found", 404);
    db.products[idx].stateId = payload.stateId ?? payload.state ?? STATE.ACTIVE;
    return ok(db.products[idx]);
  });
};

export const adminDeleteProduct = async (id) => {
  await delay();
  requireAdmin();
  return mutateDb((db) => {
    const idx = db.products.findIndex((p) => p._id === id);
    if (idx < 0) fail("Not found", 404);
    db.products[idx].stateId = STATE.DELETE;
    return ok(null);
  });
};

export const adminDeleteProperty = async (id) => {
  await delay();
  requireAdmin();
  return mutateDb((db) => {
    const idx = db.properties.findIndex((p) => p._id === id);
    if (idx < 0) fail("Not found", 404);
    db.properties[idx].state = STATE.DELETE;
    return ok(null);
  });
};

/** Message queue list — used by Logger/MessageQueue */
export const adminMessageList = async (query) => {
  await delay();
  requireAdmin();
  const db = loadDb();
  const { data, _meta } = paginate(db.messageQueue, query?.page, query?.limit);
  return ok(data, { _meta });
};
