const test = require("node:test");
const assert = require("node:assert/strict");
const { validasiRegistrasi, validasiLogin } = require("../services/authService");
const { authorizeRole } = require("../middlewares/authMiddleware");

test("White-Box validasiRegistrasi() & validasiLogin()", () => {
  assert.equal(
    validasiRegistrasi({ name: "Budi", email: "budi@mail.com", password: "password123" }).valid,
    true
  );
  assert.equal(
    validasiRegistrasi({ name: "Budi", email: "budi-salah", password: "password123" }).valid,
    false
  );
  assert.equal(
    validasiRegistrasi({ name: "Budi", email: "budi@mail.com", password: "123" }).valid,
    false
  );
  assert.equal(
    validasiLogin({ email: "budi@mail.com", password: "password123" }).valid,
    true
  );
});

test("Middleware RBAC authorizeRole() memblokir customer dari endpoint admin", () => {
  const middleware = authorizeRole("admin");
  const req = { user: { id: 1, role: "customer" } };
  let statusCode = null;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
  let nextCalled = false;

  middleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(statusCode, 403);
});
