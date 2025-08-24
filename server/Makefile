PYTHON?=python3
ALEMBIC?=alembic

.PHONY: migrate upgrade downgrade create-revision

migrate:
	$(ALEMBIC) revision --autogenerate -m "$(m)"

upgrade:
	$(ALEMBIC) upgrade head

downgrade:
	$(ALEMBIC) downgrade -1

check-drift:
	$(ALEMBIC) revision --autogenerate -m "__DRIFT_CHECK__" || true
