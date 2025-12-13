from logging.config import fileConfig
import os
import sys

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context
from dotenv import load_dotenv

# 1. Add current path to sys.path so we can import 'app'
sys.path.insert(0, os.getcwd())

# 2. Load .env
load_dotenv()

# 3. Import app's Base and Models
from app.db import get_engine, Base
# Must import ALL models that inherit from Base for autogenerate to work
import app.models.project
import app.models.document
import app.models.answer
import app.models.rfp_requirement
import app.models.user
import app.models.group
import app.models.chunk
import app.models.audit_log
import app.models.project_member

# this is the Alembic Config object
config = context.config

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 4. Set target_metadata
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.
    
    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well. By skipping the Engine creation
    we don't even need a DBAPI to be available.
    """
    # Use environment variable if available, else config
    url = os.getenv("DATABASE_URL")
    if not url:
         url = config.get_main_option("sqlalchemy.url")
         
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.
    """
    # 5. Use app.db.get_engine directly
    # This ensures we use the exact same connection logic (Cloud SQL connector, etc.)
    connectable = get_engine()

    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata,
            compare_type=True, # Optional: Detect column type changes
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
