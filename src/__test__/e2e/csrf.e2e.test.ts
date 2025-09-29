import { describe, expect, it } from "@jest/globals";

import request from "supertest";
import app from "../../app";
//
describe("CSRF Protection", () => {
  it("should set csrf-token cookie on first request", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);

    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();

    const csrfCookie = Array.from(cookies)
      .find((c: string) => c.startsWith("csrf-token"))
      ?.split("=")[1];
    expect(csrfCookie).toBeDefined();
  });
});
