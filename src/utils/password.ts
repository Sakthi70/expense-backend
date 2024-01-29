import bcrypt from "bcryptjs";
import _ from "lodash";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import guid from "guid";
import { Request, Response } from "express";
import { Context } from "../context";

const JWT_TOKEN_SECRET = "expense__jwt";

const JWT_REFRESH_TOKEN = "expense__refresh_token";

let REFRESH_TOKEN_JSON: Record<string, any> = {};

export const hashPassword = (password: string) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(12));

export const passwordCompareSync = (
  passwordToTest: string,
  passwordHash: string
) => bcrypt.compareSync(passwordToTest, passwordHash);

export const resolveJwtToken = async ({
  prisma,
  req,
  res,
}: {
  prisma: PrismaClient;
  req: Request;
  res: Response;
}) => {
  const token =
    req.body.token ||
    req.query.token ||
    req.headers["x-access-token"] ||
    _.replace(req.headers.authorization as string, "Bearer ", "");
  if (!token) {
    throw new Error("UNAUTHENTICATED");
  }
  try {
    const decoded: any = jwt.verify(token, JWT_TOKEN_SECRET);
    if (decoded.userId) {
      const user = await prisma.user.findFirst({
        where: { AND: [{ id: decoded.userId }] },
      });
      if (!user) throw new Error("UNAUTHENTICATED");
      else return { user: decoded.userId };
    } else throw new Error("UNAUTHENTICATED");
  } catch (err: any) {
    throw new Error("TOKEN EXPIRED");
  }
};

export const generateJwt = (ctx: Context, details: any) => {
  let refreshTokenId = guid.raw();
  let accessToken = jwt.sign(details, JWT_TOKEN_SECRET, {
    expiresIn: "1h",
  });
  let refreshToken = jwt.sign({ data: refreshTokenId }, JWT_REFRESH_TOKEN, {
    expiresIn: "4h",
  });
  REFRESH_TOKEN_JSON[refreshTokenId] = details;
  let now = new Date();
  now.setTime(now.getTime() + 60 * 60 * 1000);
  ctx.res.cookie("refresh_token", refreshToken, {
    expires: now,
    sameSite: "none",
    httpOnly: true,
    secure: true,
  });
  return accessToken;
};

export const getRefreshToken = (ctx: Context) => {
  const cookies = (ctx.req.headers.cookie ?? "")
    .split(";")
    .reduce<Record<string, string>>((obj, c) => {
      const [name, value] = c.split("=");
      obj[name.trim()] = value ? value.trim() : "";
      return obj;
    }, {});
  const token = cookies["refresh_token"];
  if (!token) {
    throw new Error("UNAUTHENTICATED");
  }
  try {
    const decoded: any = jwt.verify(token, JWT_REFRESH_TOKEN);
    let data = REFRESH_TOKEN_JSON[decoded.data];
    if (!data) {
      throw new Error("UNAUTHENTICATED");
    }
    delete REFRESH_TOKEN_JSON[decoded.data];
    return generateJwt(ctx, { ...data });
  } catch (e) {
    throw new Error("UNAUTHENTICATED");
  }
};
