.PHONY: check typecheck lint build

check: typecheck lint build

typecheck:
	pnpm run typecheck

lint:
	pnpm run lint

build:
	pnpm run build
