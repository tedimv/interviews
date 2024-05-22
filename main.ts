import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { allLocales, Faker } from "@faker-js/faker";
import { v4 as uuidV4 } from "uuid";

const app = new Application();
const router = new Router();

const db = await Deno.openKv();
const TableKeys = {
  users: "users",
} as const;

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

router.post("/users", async (ctx) => {
  const faker = new Faker({ locale: [allLocales.en_US, allLocales.en] });
  const id = uuidV4();
  const newUser = {
    id: uuidV4(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  };

  await db.set([TableKeys.users, id], newUser);
  ctx.response.body = newUser;
});

router.get("/users/:id", async (ctx) => {
  const id = ctx.params.id;
  const user = await db.get([TableKeys.users, id]);
  console.log({ id, user });

  if (!user.value) {
    return ctx.response.status = 404;
  }

  ctx.response.body = user.value;
});

router.put("/users/:id", async (ctx) => {
  const id = ctx.params.id;
  const updatedUser = ctx.request.body;
  const userFound = await db.get([TableKeys.users, id]);
  if (!userFound.value) {
    return ctx.response.status = 404;
  }

  await db.set([TableKeys.users, id], updatedUser);
  ctx.response.status = 204;
});

app.use(router.routes());
app.listen({ port: 5000 });
