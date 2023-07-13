# ---- Base Node ----
FROM node:16-alpine AS base
WORKDIR /app
COPY package.json yarn.lock tsconfig.json ./

# ---- Dependencies ----
FROM base AS dependencies
RUN yarn install && yarn cache clean
COPY . .

# ---- Copy Files/Build ----
FROM dependencies AS build
WORKDIR /app
RUN yarn build

# --- Release ----
FROM node:16-alpine AS release
WORKDIR /app
COPY --from=build /app/package.json ./package.json
RUN yarn install --production && yarn cache clean
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["yarn", "start:prod"]
