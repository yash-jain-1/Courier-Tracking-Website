# Makefile for backend (server)

install:
	cd server && npm install

test:
	npm run test

lint:
	npx eslint server/**/*.js

format:
	npx prettier --write server/**/*.js
