import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { allLocales, Faker } from "@faker-js/faker";
import { v4 as uuidV4 } from "uuid";

const app = new Application();
const router = new Router();

const db = await Deno.openKv();
export const Table = {
  users: "users",
} as const;

router.delete("/admin/users/:id/really", async (ctx) => {
  await db.delete([Table.users, ctx.params.id]);
  ctx.response.status = 204;
});

router.post("/admin/users/create", async (ctx) => {
  const faker = new Faker({ locale: [allLocales.en_US, allLocales.en] });
  const id = uuidV4();
  const newUser = {
    id,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  };

  await db.set([Table.users, id], newUser);
  ctx.response.body = newUser;
});

router.get("/price/crypto", async (ctx) => {
  const assetPrice = await import("./price_crypto.json", {
    with: { type: "json" },
  });
  ctx.response.body = assetPrice.default;
});

router.get("/price/properties", async (ctx) => {
  const assetPrice = await import("./price_properties.json", {
    with: { type: "json" },
  });
  ctx.response.body = assetPrice.default;
});

router.get("/price/rare_metals", async (ctx) => {
  const assetPrice = await import("./price_rare_metals.json", {
    with: { type: "json" },
  });
  ctx.response.body = assetPrice.default;
});

router.get("/price/stocks", async (ctx) => {
  const assetPrice = await import("./price_stocks.json", {
    with: { type: "json" },
  });
  ctx.response.body = assetPrice.default;
});

router.get("/users/:id", async (ctx) => {
  const id = ctx.params.id;
  const user = await db.get([Table.users, id]);

  if (!user.value) {
    return ctx.response.status = 404;
  }

  ctx.response.body = user.value;
});

router.put("/users/:id", async (ctx) => {
  const id = ctx.params.id;
  const userFound = await db.get([Table.users, id]);
  if (!userFound.value) {
    return ctx.response.status = 404;
  }

  const payload = await ctx.request.body.json();
  await db.set([Table.users, id], { ...payload, id });
  const updated = await db.get([Table.users, id]);
  ctx.response.body = updated.value as object;
});

app.use(router.routes());
app.listen({ port: 5000 });
